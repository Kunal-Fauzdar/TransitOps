import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = getSession()
  try {
    const dispatchResult = await session.executeWrite(async (tx: any) => {
      // 1. Fetch trip and status of its vehicle & driver
      const checkQuery = await tx.run(
        `
        MATCH (t:Trip {id: $id})
        MATCH (t)-[:USES_VEHICLE]->(v:Vehicle)
        MATCH (t)-[:ASSIGNED_DRIVER]->(d:Driver)
        RETURN t.status AS tripStatus, v.status AS vehicleStatus, d.status AS driverStatus, v.regNumber AS vehicleReg, d.id AS driverId
        LIMIT 1
        `,
        { id }
      )

      if (checkQuery.records.length === 0) {
        throw new Error('TRIP_NOT_FOUND')
      }

      const record = checkQuery.records[0]
      const tripStatus = record.get('tripStatus')
      const vehicleStatus = record.get('vehicleStatus')
      const driverStatus = record.get('driverStatus')
      const vehicleReg = record.get('vehicleReg')
      const driverId = record.get('driverId')

      if (tripStatus !== 'Draft') {
        throw new Error('TRIP_NOT_DRAFT')
      }

      // Rule #4: Both driver and vehicle must be Available
      if (vehicleStatus !== 'Available') {
        throw new Error('VEHICLE_NOT_AVAILABLE')
      }
      if (driverStatus !== 'Available') {
        throw new Error('DRIVER_NOT_AVAILABLE')
      }

      // 2. Perform updates in a single atomic transaction
      const updateQuery = await tx.run(
        `
        MATCH (t:Trip {id: $id})
        MATCH (t)-[:USES_VEHICLE]->(v:Vehicle)
        MATCH (t)-[:ASSIGNED_DRIVER]->(d:Driver)
        SET t.status = 'Dispatched'
        SET v.status = 'On Trip'
        SET d.status = 'On Trip'
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

    return NextResponse.json(dispatchResult)
  } catch (error: any) {
    console.error('Error dispatching trip:', error)

    if (error.message === 'TRIP_NOT_FOUND') {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }
    if (error.message === 'TRIP_NOT_DRAFT') {
      return NextResponse.json({ error: 'Only draft trips can be dispatched' }, { status: 422 })
    }
    if (error.message === 'VEHICLE_NOT_AVAILABLE') {
      return NextResponse.json({ error: 'The assigned vehicle is not available (it may be retired, in the shop, or on another trip)' }, { status: 422 })
    }
    if (error.message === 'DRIVER_NOT_AVAILABLE') {
      return NextResponse.json({ error: 'The assigned driver is not available (they may be off duty, suspended, or on another trip)' }, { status: 422 })
    }

    return NextResponse.json({ error: 'Failed to dispatch trip' }, { status: 500 })
  } finally {
    await session.close()
  }
}
