import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(request: NextRequest) {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (v:Vehicle)
      WHERE v.status <> 'Retired'
      WITH v.type AS type, count(v) AS totalType, sum(CASE WHEN v.status = 'On Trip' THEN 1 ELSE 0 END) AS activeType
      RETURN 
        type,
        totalType,
        activeType,
        CASE 
          WHEN totalType > 0 
          THEN (toFloat(activeType) / totalType) * 100 
          ELSE 0.0 
        END AS utilizationPct
      ORDER BY type ASC
      `
    )

    const parseNum = (val: any) => {
      return typeof val === 'object' && val !== null && 'toNumber' in val
        ? (val as any).toNumber()
        : Number(val || 0)
    }

    const report = result.records.map((record: any) => {
      const totalType = parseNum(record.get('totalType'))
      const activeType = parseNum(record.get('activeType'))
      const utilizationPct = parseNum(record.get('utilizationPct'))

      return {
        type: record.get('type'),
        totalType,
        activeType,
        utilizationPct: Math.round(utilizationPct * 10) / 10, // 1 decimal place
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching fleet utilization report:', error)
    return NextResponse.json({ error: 'Failed to fetch fleet utilization report' }, { status: 500 })
  } finally {
    await session.close()
  }
}

export async function getUtilizationData() {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (v:Vehicle)
      WHERE v.status <> 'Retired'
      WITH v.type AS type, count(v) AS totalType, sum(CASE WHEN v.status = 'On Trip' THEN 1 ELSE 0 END) AS activeType
      RETURN 
        type,
        totalType,
        activeType,
        CASE 
          WHEN totalType > 0 
          THEN (toFloat(activeType) / totalType) * 100 
          ELSE 0.0 
        END AS utilizationPct
      ORDER BY type ASC
      `
    )

    const parseNum = (val: any) => {
      return typeof val === 'object' && val !== null && 'toNumber' in val
        ? (val as any).toNumber()
        : Number(val || 0)
    }

    return result.records.map((record: any) => {
      const totalType = parseNum(record.get('totalType'))
      const activeType = parseNum(record.get('activeType'))
      const utilizationPct = parseNum(record.get('utilizationPct'))

      return {
        type: record.get('type'),
        totalType,
        activeType,
        utilizationPct: Math.round(utilizationPct * 10) / 10,
      }
    })
  } finally {
    await session.close()
  }
}
