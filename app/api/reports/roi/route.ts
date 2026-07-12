import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(request: NextRequest) {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (v:Vehicle)
      OPTIONAL MATCH (t:Trip)-[:USES_VEHICLE]->(v) WHERE t.status = 'Completed'
      WITH v, sum(t.actualDistance * 15) AS revenue
      OPTIONAL MATCH (f:FuelLog)-[:FOR_VEHICLE]->(v)
      WITH v, revenue, sum(f.cost) AS fuelCost
      OPTIONAL MATCH (m:MaintenanceLog)-[:FOR_VEHICLE]->(v)
      WITH v, revenue, fuelCost, sum(m.cost) AS maintenanceCost
      RETURN 
        v.regNumber AS regNumber,
        v.name AS name,
        v.acquisitionCost AS acquisitionCost,
        revenue,
        (fuelCost + maintenanceCost) AS totalCost,
        CASE 
          WHEN v.acquisitionCost > 0 
          THEN (toFloat(revenue) - (fuelCost + maintenanceCost)) / v.acquisitionCost 
          ELSE 0.0 
        END AS roi
      ORDER BY roi DESC
      `
    )

    const parseNum = (val: any) => {
      return typeof val === 'object' && val !== null && 'toNumber' in val
        ? (val as any).toNumber()
        : Number(val || 0)
    }

    const report = result.records.map((record) => {
      const acquisitionCost = parseNum(record.get('acquisitionCost'))
      const revenue = parseNum(record.get('revenue'))
      const totalCost = parseNum(record.get('totalCost'))
      const roi = parseNum(record.get('roi'))

      return {
        regNumber: record.get('regNumber'),
        name: record.get('name'),
        acquisitionCost,
        revenue,
        totalCost,
        roi: Math.round(roi * 1000) / 10, // converted to % with 1 decimal precision
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching vehicle ROI report:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicle ROI report' }, { status: 500 })
  } finally {
    await session.close()
  }
}

export async function getRoiData() {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (v:Vehicle)
      OPTIONAL MATCH (t:Trip)-[:USES_VEHICLE]->(v) WHERE t.status = 'Completed'
      WITH v, sum(t.actualDistance * 15) AS revenue
      OPTIONAL MATCH (f:FuelLog)-[:FOR_VEHICLE]->(v)
      WITH v, revenue, sum(f.cost) AS fuelCost
      OPTIONAL MATCH (m:MaintenanceLog)-[:FOR_VEHICLE]->(v)
      WITH v, revenue, fuelCost, sum(m.cost) AS maintenanceCost
      RETURN 
        v.regNumber AS regNumber,
        v.name AS name,
        v.acquisitionCost AS acquisitionCost,
        revenue,
        (fuelCost + maintenanceCost) AS totalCost,
        CASE 
          WHEN v.acquisitionCost > 0 
          THEN (toFloat(revenue) - (fuelCost + maintenanceCost)) / v.acquisitionCost 
          ELSE 0.0 
        END AS roi
      ORDER BY roi DESC
      `
    )

    const parseNum = (val: any) => {
      return typeof val === 'object' && val !== null && 'toNumber' in val
        ? (val as any).toNumber()
        : Number(val || 0)
    }

    return result.records.map((record) => {
      const acquisitionCost = parseNum(record.get('acquisitionCost'))
      const revenue = parseNum(record.get('revenue'))
      const totalCost = parseNum(record.get('totalCost'))
      const roi = parseNum(record.get('roi'))

      return {
        regNumber: record.get('regNumber'),
        name: record.get('name'),
        acquisitionCost,
        revenue,
        totalCost,
        roi: Math.round(roi * 1000) / 10,
      }
    })
  } finally {
    await session.close()
  }
}
