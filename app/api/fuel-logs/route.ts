import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { getSession } from '@/lib/neo4j'

const createFuelLogSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle registration is required').trim(),
  liters: z.number().positive('Liters must be positive'),
  cost: z.number().positive('Cost must be positive'),
  date: z.string().min(10, 'Invalid date format (YYYY-MM-DD)').trim(), // ISO date expected
})

export async function GET(request: NextRequest) {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (f:FuelLog)-[:FOR_VEHICLE]->(v:Vehicle)
      RETURN f { .*, vehicleReg: v.regNumber } AS log
      ORDER BY f.date DESC
      `
    )
    const logs = result.records.map((record: any) => record.get('log'))
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching fuel logs:', error)
    return NextResponse.json({ error: 'Failed to fetch fuel logs' }, { status: 500 })
  } finally {
    await session.close()
  }
}

export async function POST(request: NextRequest) {
  const session = getSession()
  try {
    const body = await request.json()
    const parsed = createFuelLogSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 422 }
      )
    }

    const data = parsed.data
    const logId = `fuel_${crypto.randomUUID()}`

    const logResult = await session.executeWrite(async (tx: any) => {
      // 1. Verify vehicle exists
      const vehicleCheck = await tx.run(
        `
        MATCH (v:Vehicle {regNumber: $regNumber})
        RETURN v LIMIT 1
        `,
        { regNumber: data.vehicleId }
      )

      if (vehicleCheck.records.length === 0) {
        throw new Error('VEHICLE_NOT_FOUND')
      }

      // 2. Create FuelLog node and relationship
      const createQuery = await tx.run(
        `
        MATCH (v:Vehicle {regNumber: $regNumber})
        CREATE (f:FuelLog {
          id: $id,
          liters: $liters,
          cost: $cost,
          date: $date
        })
        CREATE (f)-[:FOR_VEHICLE]->(v)
        RETURN f { .*, vehicleReg: v.regNumber } AS log
        `,
        {
          id: logId,
          regNumber: data.vehicleId,
          liters: data.liters,
          cost: data.cost,
          date: data.date,
        }
      )

      return createQuery.records[0].get('log')
    })

    return NextResponse.json(logResult, { status: 201 })
  } catch (error: any) {
    console.error('Error creating fuel log:', error)

    if (error.message === 'VEHICLE_NOT_FOUND') {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 422 })
    }

    return NextResponse.json({ error: 'Failed to create fuel log' }, { status: 500 })
  } finally {
    await session.close()
  }
}
