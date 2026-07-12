import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { getSession } from '@/lib/neo4j'

const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle registration number is required').trim(),
  type: z.string().min(1, 'Service type is required').trim(),
  startDate: z.string().min(1, 'Start date is required').trim(), // ISO format expected
  cost: z.number().nonnegative('Cost must be non-negative'),
  notes: z.string().optional().default(''),
})

export async function GET(request: NextRequest) {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (m:MaintenanceLog)-[:FOR_VEHICLE]->(v:Vehicle)
      RETURN m { .*, vehicleReg: v.regNumber, vehicleName: v.name } AS log
      ORDER BY m.startDate DESC
      `
    )
    const logs = result.records.map((record) => record.get('log'))
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching maintenance logs:', error)
    return NextResponse.json({ error: 'Failed to fetch maintenance logs' }, { status: 500 })
  } finally {
    await session.close()
  }
}

export async function POST(request: NextRequest) {
  const session = getSession()
  try {
    const body = await request.json()
    const parsed = createMaintenanceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 422 }
      )
    }

    const data = parsed.data
    const logId = `maint_${crypto.randomUUID()}`

    // Wrap validation + mutations in a single write transaction to guarantee atomic updates
    const logResult = await session.executeWrite(async (tx) => {
      // 1. Check if vehicle exists and its current status
      const vehicleCheck = await tx.run(
        `
        MATCH (v:Vehicle {regNumber: $regNumber})
        RETURN v.status AS status LIMIT 1
        `,
        { regNumber: data.vehicleId }
      )

      if (vehicleCheck.records.length === 0) {
        throw new Error('VEHICLE_NOT_FOUND')
      }

      const vehicleStatus = vehicleCheck.records[0].get('status')
      if (vehicleStatus === 'Retired') {
        throw new Error('VEHICLE_RETIRED')
      }

      // 2. Create the MaintenanceLog node and set Vehicle status to "In Shop"
      const createQuery = await tx.run(
        `
        MATCH (v:Vehicle {regNumber: $regNumber})
        CREATE (m:MaintenanceLog {
          id: $id,
          type: $type,
          cost: $cost,
          startDate: $startDate,
          notes: $notes,
          isActive: true
        })
        CREATE (m)-[:FOR_VEHICLE]->(v)
        SET v.status = 'In Shop'
        RETURN m { .*, vehicleReg: v.regNumber } AS log
        `,
        {
          id: logId,
          regNumber: data.vehicleId,
          type: data.type,
          cost: data.cost,
          startDate: data.startDate,
          notes: data.notes,
        }
      )

      return createQuery.records[0].get('log')
    })

    return NextResponse.json(logResult, { status: 201 })
  } catch (error: any) {
    console.error('Error creating maintenance log:', error)

    if (error.message === 'VEHICLE_NOT_FOUND') {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 422 })
    }
    if (error.message === 'VEHICLE_RETIRED') {
      return NextResponse.json({ error: 'Cannot log maintenance for a retired vehicle' }, { status: 422 })
    }

    return NextResponse.json({ error: 'Failed to create maintenance record' }, { status: 500 })
  } finally {
    await session.close()
  }
}
