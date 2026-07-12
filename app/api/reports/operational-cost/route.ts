import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(request: NextRequest) {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (v:Vehicle)
      OPTIONAL MATCH (f:FuelLog)-[:FOR_VEHICLE]->(v)
      WITH v, sum(f.cost) AS fuelCost
      OPTIONAL MATCH (m:MaintenanceLog)-[:FOR_VEHICLE]->(v)
      WITH v, fuelCost, sum(m.cost) AS maintenanceCost
      OPTIONAL MATCH (e:Expense)-[:FOR_VEHICLE]->(v)
      WITH v, fuelCost, maintenanceCost, sum(e.amount) AS otherExpenses
      RETURN 
        v.regNumber AS regNumber,
        v.name AS name,
        fuelCost,
        maintenanceCost,
        otherExpenses,
        (fuelCost + maintenanceCost + otherExpenses) AS totalCost
      ORDER BY totalCost DESC
      `
    )

    const parseNum = (val: any) => {
      return typeof val === 'object' && val !== null && 'toNumber' in val
        ? (val as any).toNumber()
        : Number(val || 0)
    }

    const report = result.records.map((record: any) => {
      const fuelCost = parseNum(record.get('fuelCost'))
      const maintenanceCost = parseNum(record.get('maintenanceCost'))
      const otherExpenses = parseNum(record.get('otherExpenses'))
      const totalCost = parseNum(record.get('totalCost'))

      return {
        regNumber: record.get('regNumber'),
        name: record.get('name'),
        fuelCost,
        maintenanceCost,
        otherExpenses,
        totalCost,
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching operational cost report:', error)
    return NextResponse.json({ error: 'Failed to fetch operational cost report' }, { status: 500 })
  } finally {
    await session.close()
  }
}

export async function getOperationalCostData() {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (v:Vehicle)
      OPTIONAL MATCH (f:FuelLog)-[:FOR_VEHICLE]->(v)
      WITH v, sum(f.cost) AS fuelCost
      OPTIONAL MATCH (m:MaintenanceLog)-[:FOR_VEHICLE]->(v)
      WITH v, fuelCost, sum(m.cost) AS maintenanceCost
      OPTIONAL MATCH (e:Expense)-[:FOR_VEHICLE]->(v)
      WITH v, fuelCost, maintenanceCost, sum(e.amount) AS otherExpenses
      RETURN 
        v.regNumber AS regNumber,
        v.name AS name,
        fuelCost,
        maintenanceCost,
        otherExpenses,
        (fuelCost + maintenanceCost + otherExpenses) AS totalCost
      ORDER BY totalCost DESC
      `
    )

    const parseNum = (val: any) => {
      return typeof val === 'object' && val !== null && 'toNumber' in val
        ? (val as any).toNumber()
        : Number(val || 0)
    }

    return result.records.map((record: any) => {
      const fuelCost = parseNum(record.get('fuelCost'))
      const maintenanceCost = parseNum(record.get('maintenanceCost'))
      const otherExpenses = parseNum(record.get('otherExpenses'))
      const totalCost = parseNum(record.get('totalCost'))

      return {
        regNumber: record.get('regNumber'),
        name: record.get('name'),
        fuelCost,
        maintenanceCost,
        otherExpenses,
        totalCost,
      }
    })
  } finally {
    await session.close()
  }
}
