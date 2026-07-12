import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/neo4j'

export async function GET(request: NextRequest) {
  const session = getSession()
  try {
    const query = `
      CALL {
        MATCH (v:Vehicle {status: 'On Trip'})
        RETURN count(v) AS activeVehicles
      }
      CALL {
        MATCH (v:Vehicle {status: 'Available'})
        RETURN count(v) AS availableVehicles
      }
      CALL {
        MATCH (v:Vehicle {status: 'In Shop'})
        RETURN count(v) AS inMaintenance
      }
      CALL {
        MATCH (v:Vehicle)
        WHERE v.status <> 'Retired'
        RETURN count(v) AS totalActiveVehicles
      }
      CALL {
        MATCH (t:Trip {status: 'Dispatched'})
        RETURN count(t) AS activeTrips
      }
      CALL {
        MATCH (t:Trip {status: 'Draft'})
        RETURN count(t) AS pendingTrips
      }
      CALL {
        MATCH (d:Driver)
        WHERE d.status IN ['Available', 'On Trip']
        RETURN count(d) AS driversOnDuty
      }
      RETURN 
        activeVehicles, 
        availableVehicles, 
        inMaintenance, 
        totalActiveVehicles, 
        activeTrips, 
        pendingTrips, 
        driversOnDuty
    `

    const result = await session.run(query)
    
    if (result.records.length === 0) {
      return NextResponse.json({
        activeVehicles: 0,
        availableVehicles: 0,
        inMaintenance: 0,
        activeTrips: 0,
        pendingTrips: 0,
        driversOnDuty: 0,
        fleetUtilizationPct: 0,
      })
    }

    const record = result.records[0]
    
    const activeVehicles = record.get('activeVehicles').toNumber()
    const availableVehicles = record.get('availableVehicles').toNumber()
    const inMaintenance = record.get('inMaintenance').toNumber()
    const totalActiveVehicles = record.get('totalActiveVehicles').toNumber()
    const activeTrips = record.get('activeTrips').toNumber()
    const pendingTrips = record.get('pendingTrips').toNumber()
    const driversOnDuty = record.get('driversOnDuty').toNumber()

    // Fleet utilization percentage is (Active Vehicles / Total Non-Retired Vehicles) * 100
    const fleetUtilizationPct = totalActiveVehicles > 0 
      ? Math.round((activeVehicles / totalActiveVehicles) * 1000) / 10 // 1 decimal place precision
      : 0

    return NextResponse.json({
      activeVehicles,
      availableVehicles,
      inMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilizationPct,
    })
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard KPIs' }, { status: 500 })
  } finally {
    await session.close()
  }
}
