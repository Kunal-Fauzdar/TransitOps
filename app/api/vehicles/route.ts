import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/neo4j'

// Vehicle validation schema for POST requests
const createVehicleSchema = z.object({
  regNumber: z.string().min(1, 'Registration number is required').trim(),
  name: z.string().min(1, 'Name/Model is required').trim(),
  type: z.string().min(1, 'Vehicle type is required').trim(),
  maxLoadCapacity: z.number().positive('Max load capacity must be positive'),
  odometer: z.number().nonnegative('Odometer must be non-negative'),
  acquisitionCost: z.number().positive('Acquisition cost must be positive'),
  status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired']),
  region: z.string().min(1, 'Region is required').trim(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const status = searchParams.get('status')
  const region = searchParams.get('region')

  const session = getSession()
  try {
    const filters: string[] = []
    const params: Record<string, any> = {}

    if (type) {
      filters.push('v.type = $type')
      params.type = type
    }
    if (status) {
      filters.push('v.status = $status')
      params.status = status
    }
    if (region) {
      filters.push('v.region = $region')
      params.region = region
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
    const query = `
      MATCH (v:Vehicle)
      ${whereClause}
      RETURN v { .* } AS vehicle
      ORDER BY v.regNumber ASC
    `

    const result = await session.run(query, params)
    const vehicles = result.records.map((record: any) => record.get('vehicle'))

    return NextResponse.json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
  } finally {
    await session.close()
  }
}

export async function POST(request: NextRequest) {
  const session = getSession()
  try {
    const body = await request.json()
    const parsed = createVehicleSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 422 }
      )
    }

    const data = parsed.data

    // Check for unique registration number
    const checkResult = await session.run(
      `
      MATCH (v:Vehicle {regNumber: $regNumber})
      RETURN v LIMIT 1
      `,
      { regNumber: data.regNumber }
    )

    if (checkResult.records.length > 0) {
      return NextResponse.json(
        { error: 'Vehicle registration number already exists' },
        { status: 422 }
      )
    }

    // Create the vehicle node
    const createResult = await session.run(
      `
      CREATE (v:Vehicle {
        regNumber: $regNumber,
        name: $name,
        type: $type,
        maxLoadCapacity: $maxLoadCapacity,
        odometer: $odometer,
        acquisitionCost: $acquisitionCost,
        status: $status,
        region: $region
      })
      RETURN v { .* } AS vehicle
      `,
      {
        regNumber: data.regNumber,
        name: data.name,
        type: data.type,
        maxLoadCapacity: data.maxLoadCapacity,
        odometer: data.odometer,
        acquisitionCost: data.acquisitionCost,
        status: data.status,
        region: data.region,
      }
    )

    const newVehicle = createResult.records[0].get('vehicle')
    return NextResponse.json(newVehicle, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 })
  } finally {
    await session.close()
  }
}
