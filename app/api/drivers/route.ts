import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { getSession } from '@/lib/neo4j'

// Zod schema for validating POST /api/drivers payload
const createDriverSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  licenseNumber: z.string().min(1, 'License number is required').trim(),
  licenseCategory: z.string().min(1, 'License category is required').trim(),
  licenseExpiryDate: z.string().min(10, 'Invalid license expiry date format (YYYY-MM-DD)').trim(), // ISO date string expected
  contactNumber: z.string().min(1, 'Contact number is required').trim(),
  safetyScore: z.number().min(0).max(100, 'Safety score must be between 0 and 100'),
  status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']),
})

export async function GET(request: NextRequest) {
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (d:Driver)
      RETURN d { .* } AS driver
      ORDER BY d.name ASC
      `
    )
    const drivers = result.records.map((record: any) => record.get('driver'))
    return NextResponse.json(drivers)
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 })
  } finally {
    await session.close()
  }
}

export async function POST(request: NextRequest) {
  const session = getSession()
  try {
    const body = await request.json()
    const parsed = createDriverSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 422 }
      )
    }

    const data = parsed.data
    const driverId = `driver_${crypto.randomUUID()}`

    // Check for unique license number
    const checkResult = await session.run(
      `
      MATCH (d:Driver {licenseNumber: $licenseNumber})
      RETURN d LIMIT 1
      `,
      { licenseNumber: data.licenseNumber }
    )

    if (checkResult.records.length > 0) {
      return NextResponse.json(
        { error: 'Driver license number already exists' },
        { status: 422 }
      )
    }

    // Insert driver node
    const createResult = await session.run(
      `
      CREATE (d:Driver {
        id: $id,
        name: $name,
        licenseNumber: $licenseNumber,
        licenseCategory: $licenseCategory,
        licenseExpiryDate: $licenseExpiryDate,
        contactNumber: $contactNumber,
        safetyScore: $safetyScore,
        status: $status
      })
      RETURN d { .* } AS driver
      `,
      {
        id: driverId,
        name: data.name,
        licenseNumber: data.licenseNumber,
        licenseCategory: data.licenseCategory,
        licenseExpiryDate: data.licenseExpiryDate,
        contactNumber: data.contactNumber,
        safetyScore: data.safetyScore,
        status: data.status,
      }
    )

    const newDriver = createResult.records[0].get('driver')
    return NextResponse.json(newDriver, { status: 201 })
  } catch (error) {
    console.error('Error creating driver:', error)
    return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 })
  } finally {
    await session.close()
  }
}
