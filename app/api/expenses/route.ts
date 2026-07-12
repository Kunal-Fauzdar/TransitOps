import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { getSession } from '@/lib/neo4j'

const createExpenseSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle registration is required').trim(),
  type: z.enum(['toll', 'other']),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().min(10, 'Invalid date format (YYYY-MM-DD)').trim(), // ISO date expected
})

export async function GET(request: NextRequest) {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (e:Expense)-[:FOR_VEHICLE]->(v:Vehicle)
      RETURN e { .*, vehicleReg: v.regNumber } AS expense
      ORDER BY e.date DESC
      `
    )
    const expenses = result.records.map((record: any) => record.get('expense'))
    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  } finally {
    await session.close()
  }
}

export async function POST(request: NextRequest) {
  const session = getSession()
  try {
    const body = await request.json()
    const parsed = createExpenseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 422 }
      )
    }

    const data = parsed.data
    const expenseId = `expense_${crypto.randomUUID()}`

    const expenseResult = await session.executeWrite(async (tx: any) => {
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

      // 2. Create Expense node and relationship
      const createQuery = await tx.run(
        `
        MATCH (v:Vehicle {regNumber: $regNumber})
        CREATE (e:Expense {
          id: $id,
          type: $type,
          amount: $amount,
          date: $date
        })
        CREATE (e)-[:FOR_VEHICLE]->(v)
        RETURN e { .*, vehicleReg: v.regNumber } AS expense
        `,
        {
          id: expenseId,
          regNumber: data.vehicleId,
          type: data.type,
          amount: data.amount,
          date: data.date,
        }
      )

      return createQuery.records[0].get('expense')
    })

    return NextResponse.json(expenseResult, { status: 201 })
  } catch (error: any) {
    console.error('Error creating expense:', error)

    if (error.message === 'VEHICLE_NOT_FOUND') {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 422 })
    }

    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  } finally {
    await session.close()
  }
}
