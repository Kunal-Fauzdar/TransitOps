import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(request: NextRequest) {
  const session = getSession()
  try {
    // Compute cutoff: today + 30 days
    const today = new Date()
    const cutoff = new Date(today)
    cutoff.setDate(cutoff.getDate() + 30)
    const todayStr = today.toISOString().split('T')[0]
    const cutoffStr = cutoff.toISOString().split('T')[0]

    const result = await session.run(
      `
      MATCH (d:Driver)
      WHERE d.licenseExpiryDate <= $cutoff
      RETURN d { .* } AS driver,
             CASE 
               WHEN d.licenseExpiryDate < $today THEN 'expired'
               ELSE 'expiring_soon'
             END AS alertType
      ORDER BY d.licenseExpiryDate ASC
      `,
      { today: todayStr, cutoff: cutoffStr }
    )

    const drivers = result.records.map((record) => ({
      ...record.get('driver'),
      alertType: record.get('alertType'),
      daysUntilExpiry: Math.ceil(
        (new Date(record.get('driver').licenseExpiryDate).getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    }))

    return NextResponse.json({
      total: drivers.length,
      expired: drivers.filter((d) => d.alertType === 'expired').length,
      expiringSoon: drivers.filter((d) => d.alertType === 'expiring_soon').length,
      drivers,
    })
  } catch (error) {
    console.error('Error fetching expiring licenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expiring licenses' }, { status: 500 })
  } finally {
    await session.close()
  }
}
