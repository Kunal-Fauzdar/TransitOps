import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = getSession()
  try {
    const cancelResult = await session.executeWrite(async (tx) => {
      // 1. Fetch trip, verify it is Dispatched
      const checkQuery = await tx.run(
        `
        MATCH (t:Trip {id: $id})
        RETURN t.status AS tripStatus LIMIT 1
        `,
        { id }
      )

      if (checkQuery.records.length === 0) {
        throw new Error('TRIP_NOT_FOUND')
      }

      const tripStatus = checkQuery.records[0].get('tripStatus')

      // Rule #8: Only allowed if current status = Dispatched
      if (tripStatus !== 'Dispatched') {
        throw new Error('TRIP_NOT_DISPATCHED')
      }

      // 2. Perform updates atomically
      const updateQuery = await tx.run(
        `
        MATCH (t:Trip {id: $id})
        MATCH (t)-[:USES_VEHICLE]->(v:Vehicle)
        MATCH (t)-[:ASSIGNED_DRIVER]->(d:Driver)
        SET t.status = 'Cancelled'
        SET v.status = 'Available'
        SET d.status = 'Available'
        RETURN t { 
          .*, 
          vehicleReg: v.regNumber, 
          vehicleStatus: v.status, 
          driverId: d.id, 
          driverStatus: d.status 
        } AS trip
        `,
        { id }
      )

      return updateQuery.records[0].get('trip')
    })

    return NextResponse.json(cancelResult)
  } catch (error: any) {
    console.error('Error cancelling trip:', error)

    if (error.message === 'TRIP_NOT_FOUND') {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }
    if (error.message === 'TRIP_NOT_DISPATCHED') {
      return NextResponse.json({ error: 'Only dispatched trips can be cancelled' }, { status: 422 })
    }

    return NextResponse.json({ error: 'Failed to cancel trip' }, { status: 500 })
  } finally {
    await session.close()
  }
}
