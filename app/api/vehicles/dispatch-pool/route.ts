import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(request: NextRequest) {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (v:Vehicle {status: 'Available'})
      RETURN v { .* } AS vehicle
      ORDER BY v.regNumber ASC
      `
    )
    const vehicles = result.records.map((record: any) => record.get('vehicle'))
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicle dispatch pool:', error)
    return NextResponse.json({ error: 'Failed to fetch dispatch pool vehicles' }, { status: 500 })
  } finally {
    await session.close()
  }
}
