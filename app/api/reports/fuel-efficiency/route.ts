import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(request: NextRequest) {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (v:Vehicle)
      OPTIONAL MATCH (t:Trip)-[:USES_VEHICLE]->(v)
      WHERE t.status = 'Completed'
      RETURN 
        v.regNumber AS regNumber,
        v.name AS name,
        sum(t.actualDistance) AS totalDistance,
        sum(t.fuelConsumed) AS totalFuel,
        CASE 
          WHEN sum(t.fuelConsumed) > 0 
          THEN toFloat(sum(t.actualDistance)) / sum(t.fuelConsumed) 
          ELSE 0.0 
        END AS efficiency
      ORDER BY efficiency DESC
      `
    )

    const parseNum = (val: any) => {
      return typeof val === 'object' && val !== null && 'toNumber' in val
        ? (val as any).toNumber()
        : Number(val || 0)
    }

    const report = result.records.map((record) => {
      const totalDistance = parseNum(record.get('totalDistance'))
      const totalFuel = parseNum(record.get('totalFuel'))
      const efficiency = parseNum(record.get('efficiency'))

      return {
        regNumber: record.get('regNumber'),
        name: record.get('name'),
        totalDistance,
        totalFuel,
        efficiency: Math.round(efficiency * 100) / 100, // 2 decimal precision
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching fuel efficiency report:', error)
    return NextResponse.json({ error: 'Failed to fetch fuel efficiency report' }, { status: 500 })
  } finally {
    await session.close()
  }
}
export async function getFuelEfficiencyData() {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (v:Vehicle)
      OPTIONAL MATCH (t:Trip)-[:USES_VEHICLE]->(v)
      WHERE t.status = 'Completed'
      RETURN 
        v.regNumber AS regNumber,
        v.name AS name,
        sum(t.actualDistance) AS totalDistance,
        sum(t.fuelConsumed) AS totalFuel,
        CASE 
          WHEN sum(t.fuelConsumed) > 0 
          THEN toFloat(sum(t.actualDistance)) / sum(t.fuelConsumed) 
          ELSE 0.0 
        END AS efficiency
      ORDER BY efficiency DESC
      `
    )

    const parseNum = (val: any) => {
      return typeof val === 'object' && val !== null && 'toNumber' in val
        ? (val as any).toNumber()
        : Number(val || 0)
    }

    return result.records.map((record) => {
      const totalDistance = parseNum(record.get('totalDistance'))
      const totalFuel = parseNum(record.get('totalFuel'))
      const efficiency = parseNum(record.get('efficiency'))

      return {
        regNumber: record.get('regNumber'),
        name: record.get('name'),
        totalDistance,
        totalFuel,
        efficiency: Math.round(efficiency * 100) / 100,
      }
    })
  } finally {
    await session.close()
  }
}
