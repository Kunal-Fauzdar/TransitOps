import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { getSession } from '@/lib/neo4j'

const createTripSchema = z.object({
  source: z.string().min(1, 'Source is required').trim(),
  destination: z.string().min(1, 'Destination is required').trim(),
  vehicleId: z.string().min(1, 'Vehicle registration number is required').trim(), // v.regNumber
  driverId: z.string().min(1, 'Driver ID is required').trim(), // d.id
  cargoWeight: z.number().positive('Cargo weight must be positive'),
  plannedDistance: z.number().positive('Planned distance must be positive'),
})

export async function GET(request: NextRequest) {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (t:Trip)
      MATCH (t)-[:USES_VEHICLE]->(v:Vehicle)
      MATCH (t)-[:ASSIGNED_DRIVER]->(d:Driver)
      RETURN t { 
        .*, 
        vehicleReg: v.regNumber, 
        vehicleName: v.name, 
        driverId: d.id, 
        driverName: d.name 
      } AS trip
      ORDER BY t.createdAt DESC
      `
    )
    const trips = result.records.map((record: any) => record.get('trip'))
    return NextResponse.json(trips)
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
  } finally {
    await session.close()
  }
}

export async function POST(request: NextRequest) {
  const session = getSession()
  try {
    const body = await request.json()
    const parsed = createTripSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 422 }
      )
    }

    const data = parsed.data
    const tripId = `trip_${crypto.randomUUID()}`
    const createdAt = new Date().toISOString()

    const tripResult = await session.executeWrite(async (tx: any) => {
      // 1. Fetch vehicle capacity
      const vehicleCheck = await tx.run(
        `
        MATCH (v:Vehicle {regNumber: $regNumber})
        RETURN v.maxLoadCapacity AS maxLoadCapacity LIMIT 1
        `,
        { regNumber: data.vehicleId }
      )

      if (vehicleCheck.records.length === 0) {
        throw new Error('VEHICLE_NOT_FOUND')
      }

      const maxLoadCapacity = vehicleCheck.records[0].get('maxLoadCapacity')
      if (data.cargoWeight > maxLoadCapacity) {
        throw new Error('EXCEEDS_CAPACITY')
      }

      // 2. Fetch driver node
      const driverCheck = await tx.run(
        `
        MATCH (d:Driver {id: $driverId})
        RETURN d LIMIT 1
        `,
        { driverId: data.driverId }
      )

      if (driverCheck.records.length === 0) {
        throw new Error('DRIVER_NOT_FOUND')
      }

      // 3. Create Draft Trip and create relationships
      const createQuery = await tx.run(
        `
        MATCH (v:Vehicle {regNumber: $vehicleReg})
        MATCH (d:Driver {id: $driverId})
        CREATE (t:Trip {
          id: $id,
          source: $source,
          destination: $destination,
          cargoWeight: $cargoWeight,
          plannedDistance: $plannedDistance,
          status: 'Draft',
          createdAt: $createdAt
        })
        CREATE (t)-[:USES_VEHICLE]->(v)
        CREATE (t)-[:ASSIGNED_DRIVER]->(d)
        RETURN t { 
          .*, 
          vehicleReg: v.regNumber, 
          driverId: d.id 
        } AS trip
        `,
        {
          id: tripId,
          source: data.source,
          destination: data.destination,
          cargoWeight: data.cargoWeight,
          plannedDistance: data.plannedDistance,
          vehicleReg: data.vehicleId,
          driverId: data.driverId,
          createdAt,
        }
      )

      return createQuery.records[0].get('trip')
    })

    return NextResponse.json(tripResult, { status: 201 })
  } catch (error: any) {
    console.error('Error creating trip record:', error)

    if (error.message === 'VEHICLE_NOT_FOUND') {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 422 })
    }
    if (error.message === 'DRIVER_NOT_FOUND') {
      return NextResponse.json({ error: 'Driver not found' }, { status: 422 })
    }
    if (error.message === 'EXCEEDS_CAPACITY') {
      return NextResponse.json({ error: 'Cargo weight exceeds the maximum capacity of the vehicle' }, { status: 422 })
    }

    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 })
  } finally {
    await session.close()
  }
}
