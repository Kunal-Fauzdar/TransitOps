import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reg: string }> }
) {
  const { reg } = await params
  const session = getSession()
  try {
    // 1. Verify vehicle exists first
    const vehicleCheck = await session.run(
      `
      MATCH (v:Vehicle {regNumber: $reg})
      RETURN v LIMIT 1
      `,
      { reg }
    )

    if (vehicleCheck.records.length === 0) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // 2. Query aggregated sums
    const costQuery = await session.run(
      `
      MATCH (v:Vehicle {regNumber: $reg})
      OPTIONAL MATCH (f:FuelLog)-[:FOR_VEHICLE]->(v)
      WITH v, sum(f.cost) AS fuelTotal
      OPTIONAL MATCH (m:MaintenanceLog)-[:FOR_VEHICLE]->(v)
      WITH v, fuelTotal, sum(m.cost) AS maintenanceTotal
      OPTIONAL MATCH (e:Expense)-[:FOR_VEHICLE]->(v)
      WITH fuelTotal, maintenanceTotal, sum(e.amount) AS otherExpensesTotal
      RETURN 
        fuelTotal, 
        maintenanceTotal, 
        otherExpensesTotal, 
        (fuelTotal + maintenanceTotal + otherExpensesTotal) AS total
      `,
      { reg }
    )

    const record = costQuery.records[0]

    const getVal = (key: string) => {
      const val = record.get(key)
      return typeof val === 'object' && val !== null && 'toNumber' in val
        ? (val as any).toNumber()
        : Number(val || 0)
    }

    const fuelTotal = getVal('fuelTotal')
    const maintenanceTotal = getVal('maintenanceTotal')
    const otherExpensesTotal = getVal('otherExpensesTotal')
    const total = getVal('total')

    return NextResponse.json({
      fuelTotal,
      maintenanceTotal,
      otherExpensesTotal,
      total,
    })
  } catch (error) {
    console.error('Error fetching vehicle cost summary:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicle cost summary' }, { status: 500 })
  } finally {
    await session.close()
  }
}
