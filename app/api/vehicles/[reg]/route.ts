import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/neo4j'

// Vehicle validation schema for PATCH requests (all fields optional)
const updateVehicleSchema = z.object({
  name: z.string().min(1).trim().optional(),
  type: z.string().min(1).trim().optional(),
  maxLoadCapacity: z.number().positive().optional(),
  odometer: z.number().nonnegative().optional(),
  acquisitionCost: z.number().positive().optional(),
  status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired']).optional(),
  region: z.string().min(1).trim().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reg: string }> }
) {
  const { reg } = await params
  const session = getSession()
  try {
    const result = await session.run(
      `
      MATCH (v:Vehicle {regNumber: $regNumber})
      RETURN v { .* } AS vehicle
      LIMIT 1
      `,
      { regNumber: reg }
    )

    if (result.records.length === 0) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const vehicle = result.records[0].get('vehicle')
    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error fetching vehicle details:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicle details' }, { status: 500 })
  } finally {
    await session.close()
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reg: string }> }
) {
  const { reg } = await params
  const session = getSession()
  try {
    const body = await request.json()
    const parsed = updateVehicleSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 422 }
      )
    }

    const data = parsed.data

    // Verify vehicle exists before updating
    const checkResult = await session.run(
      `
      MATCH (v:Vehicle {regNumber: $regNumber})
      RETURN v LIMIT 1
      `,
      { regNumber: reg }
    )

    if (checkResult.records.length === 0) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Perform partial update using map update operator `+=`
    const updateResult = await session.run(
      `
      MATCH (v:Vehicle {regNumber: $regNumber})
      SET v += $properties
      RETURN v { .* } AS vehicle
      `,
      {
        regNumber: reg,
        properties: data,
      }
    )

    const updatedVehicle = updateResult.records[0].get('vehicle')
    return NextResponse.json(updatedVehicle)
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
  } finally {
    await session.close()
  }
}
