import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/neo4j'

// Zod schema for validating PATCH requests (all fields optional)
const updateDriverSchema = z.object({
  name: z.string().min(1).trim().optional(),
  licenseNumber: z.string().min(1).trim().optional(),
  licenseCategory: z.string().min(1).trim().optional(),
  licenseExpiryDate: z.string().min(10).trim().optional(),
  contactNumber: z.string().min(1).trim().optional(),
  safetyScore: z.number().min(0).max(100).optional(),
  status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = getSession()
  try {
    const body = await request.json()
    const parsed = updateDriverSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 422 }
      )
    }

    const data = parsed.data

    // Verify driver exists
    const checkResult = await session.run(
      `
      MATCH (d:Driver {id: $id})
      RETURN d LIMIT 1
      `,
      { id }
    )

    if (checkResult.records.length === 0) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    // Perform partial update
    const updateResult = await session.run(
      `
      MATCH (d:Driver {id: $id})
      SET d += $properties
      RETURN d { .* } AS driver
      `,
      {
        id,
        properties: data,
      }
    )

    const updatedDriver = updateResult.records[0].get('driver')
    return NextResponse.json(updatedDriver)
  } catch (error) {
    console.error('Error updating driver details:', error)
    return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 })
  } finally {
    await session.close()
  }
}
