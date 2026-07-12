import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/neo4j'

const closeMaintenanceSchema = z.object({
  endDate: z.string().min(1, 'End date is required').trim(), // ISO format expected
  cost: z.number().nonnegative('Final cost must be non-negative'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = getSession()
  try {
    const body = await request.json()
    const parsed = closeMaintenanceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 422 }
      )
    }

    const data = parsed.data

    // Close the log and update vehicle status in a single transaction
    const closeResult = await session.executeWrite(async (tx: any) => {
      // 1. Check if maintenance log exists and is active
      const logCheck = await tx.run(
        `
        MATCH (m:MaintenanceLog {id: $id})-[:FOR_VEHICLE]->(v:Vehicle)
        RETURN m.isActive AS isActive, v.regNumber AS regNumber LIMIT 1
        `,
        { id }
      )

      if (logCheck.records.length === 0) {
        throw new Error('MAINTENANCE_LOG_NOT_FOUND')
      }

      const isActive = logCheck.records[0].get('isActive')
      if (!isActive) {
        throw new Error('MAINTENANCE_LOG_ALREADY_CLOSED')
      }

      // 2. Perform updates
      const closeQuery = await tx.run(
        `
        MATCH (m:MaintenanceLog {id: $id})-[:FOR_VEHICLE]->(v:Vehicle)
        SET m.isActive = false,
            m.endDate = $endDate,
            m.cost = $cost
        SET v.status = CASE WHEN v.status = 'Retired' THEN 'Retired' ELSE 'Available' END
        RETURN m { .*, vehicleReg: v.regNumber } AS log, v.status AS vehicleStatus
        `,
        {
          id,
          endDate: data.endDate,
          cost: data.cost,
        }
      )

      return closeQuery.records[0]
    })

    const log = closeResult.get('log')
    const vehicleStatus = closeResult.get('vehicleStatus')

    return NextResponse.json({ log, vehicleStatus })
  } catch (error: any) {
    console.error('Error closing maintenance log:', error)

    if (error.message === 'MAINTENANCE_LOG_NOT_FOUND') {
      return NextResponse.json({ error: 'Maintenance record not found' }, { status: 404 })
    }
    if (error.message === 'MAINTENANCE_LOG_ALREADY_CLOSED') {
      return NextResponse.json({ error: 'Maintenance record is already closed' }, { status: 422 })
    }

    return NextResponse.json({ error: 'Failed to close maintenance record' }, { status: 500 })
  } finally {
    await session.close()
  }
}
