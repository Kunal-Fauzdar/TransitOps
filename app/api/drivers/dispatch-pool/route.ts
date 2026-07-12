import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(request: NextRequest) {
  const session = getSession()
  try {
    // Current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    const result = await session.run(
      `
      MATCH (d:Driver)
      WHERE d.status = 'Available' AND d.licenseExpiryDate >= $today
      RETURN d { .* } AS driver
      ORDER BY d.name ASC
      `,
      { today }
    )
    const drivers = result.records.map((record: any) => record.get('driver'))
    return NextResponse.json(drivers)
  } catch (error) {
    console.error('Error fetching driver dispatch pool:', error)
    return NextResponse.json({ error: 'Failed to fetch dispatch pool drivers' }, { status: 500 })
  } finally {
    await session.close()
  }
}
