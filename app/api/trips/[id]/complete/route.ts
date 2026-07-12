import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/neo4j'

const completeTripSchema = z.object({
  finalOdometer: z.number().positive('Final odometer reading must be positive'),
  fuelConsumed: z.number().positive('Fuel consumed must be positive'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = getSession()
  try {
    const body = await request.json()
    const parsed = completeTripSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 422 }
      )
    }

    const data = parsed.data

    const completeResult = await session.executeWrite(async (tx: any) => {
      // 1. Fetch trip, verify it is Dispatched and fetch current vehicle odometer
      const checkQuery = await tx.run(
        `
        MATCH (t:Trip {id: $id})
        MATCH (t)-[:USES_VEHICLE]->(v:Vehicle)
        RETURN t.status AS tripStatus, v.odometer AS currentOdometer
        LIMIT 1
        `,
        { id }
      )

      if (checkQuery.records.length === 0) {
        throw new Error('TRIP_NOT_FOUND')
      }

      const tripStatus = checkQuery.records[0].get('tripStatus')
      const rawOdometer = checkQuery.records[0].get('currentOdometer')
      const currentOdometer = typeof rawOdometer === 'object' && rawOdometer !== null && 'toNumber' in rawOdometer
        ? (rawOdometer as any).toNumber()
        : Number(rawOdometer)

      if (tripStatus !== 'Dispatched') {
        throw new Error('TRIP_NOT_DISPATCHED')
      }

      if (data.finalOdometer < currentOdometer) {
        throw new Error('INVALID_ODOMETER')
      }

      const actualDistance = data.finalOdometer - currentOdometer

      // 2. Perform updates atomically
      const updateQuery = await tx.run(
        `
        MATCH (t:Trip {id: $id})
        MATCH (t)-[:USES_VEHICLE]->(v:Vehicle)
        MATCH (t)-[:ASSIGNED_DRIVER]->(d:Driver)
        SET t.status = 'Completed',
            t.actualDistance = $actualDistance,
            t.fuelConsumed = $fuelConsumed
        SET v.status = 'Available',
            v.odometer = $finalOdometer
        SET d.status = 'Available'
        RETURN t { 
          .*, 
          vehicleReg: v.regNumber, 
          vehicleStatus: v.status, 
          vehicleOdometer: v.odometer, 
          driverId: d.id, 
          driverStatus: d.status 
        } AS trip
        `,
        {
          id,
          finalOdometer: data.finalOdometer,
          fuelConsumed: data.fuelConsumed,
          actualDistance,
        }
      )

      return updateQuery.records[0].get('trip')
    })

    return NextResponse.json(completeResult)
  } catch (error: any) {
    console.error('Error completing trip:', error)

    if (error.message === 'TRIP_NOT_FOUND') {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }
    if (error.message === 'TRIP_NOT_DISPATCHED') {
      return NextResponse.json({ error: 'Only dispatched trips can be completed' }, { status: 422 })
    }
    if (error.message === 'INVALID_ODOMETER') {
      return NextResponse.json({ error: 'Final odometer cannot be less than the vehicle\'s current odometer reading' }, { status: 422 })
    }

    return NextResponse.json({ error: 'Failed to complete trip' }, { status: 500 })
  } finally {
    await session.close()
  }
}
