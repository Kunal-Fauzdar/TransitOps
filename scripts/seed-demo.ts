/**
 * seed-demo.ts
 * Populates the Neo4j database with a full demo fleet for the TransitOps hackathon showcase.
 * Scenario: Van-05 / Alex is the canonical demo workflow vehicle+driver pair.
 *
 * Run with: npx tsx scripts/seed-demo.ts
 */
import fs from 'fs'
import path from 'path'
import neo4j from 'neo4j-driver'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Load .env.local manually
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    envConfig.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        let value = match[2] || ''
        value = value.replace(/^["']|["']$/g, '')
        process.env[key] = value
      }
    })
  }
}

loadEnvLocal()

const uri = process.env.NEO4J_URI!
const user = process.env.NEO4J_USERNAME!
const password = process.env.NEO4J_PASSWORD!
const database = process.env.NEO4J_DATABASE

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

async function seed() {
  const session = driver.session(database ? { database } : {})
  console.log('🌱 Starting TransitOps Demo Data Seeding (Van-05 / Alex scenario)...\n')

  try {
    // ─── 1. SEED USERS ────────────────────────────────────────────────────────
    console.log('👤 Seeding users...')
    const users = [
      { email: 'manager@transitops.com', name: 'Fleet Manager', role: 'FleetManager' },
      { email: 'driver@transitops.com', name: 'Driver User', role: 'Driver' },
      { email: 'safety@transitops.com', name: 'Safety Officer', role: 'SafetyOfficer' },
      { email: 'analyst@transitops.com', name: 'Financial Analyst', role: 'FinancialAnalyst' },
    ]
    for (const u of users) {
      const hash = await bcrypt.hash('password123', 10)
      await session.run(
        `MERGE (u:User {email: $email})
         SET u.id = coalesce(u.id, $id), u.name = $name, u.role = $role, u.passwordHash = $hash`,
        { id: `user_${crypto.randomUUID()}`, email: u.email, name: u.name, role: u.role, hash }
      )
      console.log(`  ✅ ${u.name} (${u.email})`)
    }

    // ─── 2. SEED VEHICLES ─────────────────────────────────────────────────────
    console.log('\n🚗 Seeding vehicles...')
    const vehicles = [
      {
        regNumber: 'VAN-05',
        name: 'Transit Van 05',
        type: 'Van',
        maxLoadCapacity: 1500,
        odometer: 45200,
        acquisitionCost: 850000,
        status: 'Available',
        region: 'North',
      },
      {
        regNumber: 'TRUCK-01',
        name: 'Heavy Hauler 01',
        type: 'Truck',
        maxLoadCapacity: 12000,
        odometer: 120500,
        acquisitionCost: 3200000,
        status: 'Available',
        region: 'West',
      },
      {
        regNumber: 'BUS-02',
        name: 'City Express Bus 02',
        type: 'Bus',
        maxLoadCapacity: 0,
        odometer: 88000,
        acquisitionCost: 1400000,
        status: 'Available',
        region: 'South',
      },
      {
        regNumber: 'TRUCK-03',
        name: 'Cargo King 03',
        type: 'Truck',
        maxLoadCapacity: 8000,
        odometer: 62000,
        acquisitionCost: 2500000,
        status: 'In Shop',
        region: 'East',
      },
      {
        regNumber: 'VAN-04',
        name: 'Delivery Van 04',
        type: 'Van',
        maxLoadCapacity: 1200,
        odometer: 200000,
        acquisitionCost: 750000,
        status: 'Retired',
        region: 'North',
      },
    ]
    for (const v of vehicles) {
      await session.run(
        `MERGE (v:Vehicle {regNumber: $regNumber})
         SET v += $props`,
        { regNumber: v.regNumber, props: v }
      )
      console.log(`  ✅ ${v.regNumber} — ${v.name} [${v.status}]`)
    }

    // ─── 3. SEED DRIVERS ──────────────────────────────────────────────────────
    console.log('\n🧑‍✈️ Seeding drivers...')
    const drivers = [
      {
        id: 'driver_alex_001',
        name: 'Alex Johnson',
        licenseNumber: 'LIC-ALEX-001',
        licenseCategory: 'Light Commercial',
        licenseExpiryDate: '2028-06-30',
        contactNumber: '+919876543210',
        safetyScore: 96,
        status: 'Available',
      },
      {
        id: 'driver_maria_002',
        name: 'Maria Garcia',
        licenseNumber: 'LIC-MARIA-002',
        licenseCategory: 'Heavy Commercial',
        licenseExpiryDate: '2027-12-31',
        contactNumber: '+919876543211',
        safetyScore: 88,
        status: 'Available',
      },
      {
        id: 'driver_raj_003',
        name: 'Raj Patel',
        licenseNumber: 'LIC-RAJ-003',
        licenseCategory: 'Heavy Commercial',
        licenseExpiryDate: '2026-08-15',
        contactNumber: '+919876543212',
        safetyScore: 74,
        status: 'On Trip',
      },
      {
        id: 'driver_sara_004',
        name: 'Sara Chen',
        licenseNumber: 'LIC-SARA-004',
        licenseCategory: 'Light Commercial',
        licenseExpiryDate: '2025-03-01', // Expired — excluded from dispatch
        contactNumber: '+919876543213',
        safetyScore: 81,
        status: 'Available',
      },
      {
        id: 'driver_tom_005',
        name: 'Tom Williams',
        licenseNumber: 'LIC-TOM-005',
        licenseCategory: 'Bus',
        licenseExpiryDate: '2029-01-01',
        contactNumber: '+919876543214',
        safetyScore: 91,
        status: 'Suspended', // Suspended — excluded from dispatch
      },
    ]
    for (const d of drivers) {
      await session.run(
        `MERGE (d:Driver {id: $id})
         SET d += $props`,
        { id: d.id, props: d }
      )
      console.log(`  ✅ ${d.name} [${d.status}] — License: ${d.licenseExpiryDate}`)
    }

    // ─── 4. SEED COMPLETED TRIP (Van-05 + Alex — historical) ──────────────────
    console.log('\n🗺️ Seeding historical completed trip (Van-05 / Alex)...')
    const tripId = 'trip_van05_alex_historical'
    await session.run(
      `MERGE (t:Trip {id: $id})
       SET t += $props`,
      {
        id: tripId,
        props: {
          id: tripId,
          source: 'Mumbai',
          destination: 'Pune',
          cargoWeight: 800,
          plannedDistance: 148,
          actualDistance: 152,
          fuelConsumed: 22,
          status: 'Completed',
          createdAt: '2026-07-10T08:00:00.000Z',
        },
      }
    )
    await session.run(
      `MATCH (t:Trip {id: $tripId}), (v:Vehicle {regNumber: 'VAN-05'})
       MERGE (t)-[:USES_VEHICLE]->(v)`,
      { tripId }
    )
    await session.run(
      `MATCH (t:Trip {id: $tripId}), (d:Driver {id: 'driver_alex_001'})
       MERGE (t)-[:ASSIGNED_DRIVER]->(d)`,
      { tripId }
    )
    console.log('  ✅ Mumbai → Pune trip (Completed) for Van-05 + Alex')

    // ─── 5. SEED MAINTENANCE LOG FOR TRUCK-03 (Active) ───────────────────────
    console.log('\n🔧 Seeding active maintenance log for TRUCK-03...')
    const maintId = 'maint_truck03_active'
    await session.run(
      `MERGE (m:MaintenanceLog {id: $id})
       SET m += $props`,
      {
        id: maintId,
        props: {
          id: maintId,
          type: 'Engine Overhaul',
          cost: 45000,
          startDate: '2026-07-08',
          notes: 'Major engine work, estimated 5 days',
          isActive: true,
        },
      }
    )
    await session.run(
      `MATCH (m:MaintenanceLog {id: $maintId}), (v:Vehicle {regNumber: 'TRUCK-03'})
       MERGE (m)-[:FOR_VEHICLE]->(v)`,
      { maintId }
    )
    console.log('  ✅ Active maintenance log for TRUCK-03')

    // ─── 6. SEED FUEL LOGS ────────────────────────────────────────────────────
    console.log('\n⛽ Seeding fuel logs...')
    const fuelLogs = [
      { id: 'fuel_001', vehicleReg: 'VAN-05', liters: 40, cost: 4800, date: '2026-07-09' },
      { id: 'fuel_002', vehicleReg: 'VAN-05', liters: 35, cost: 4200, date: '2026-07-11' },
      { id: 'fuel_003', vehicleReg: 'TRUCK-01', liters: 120, cost: 14400, date: '2026-07-10' },
      { id: 'fuel_004', vehicleReg: 'BUS-02', liters: 90, cost: 10800, date: '2026-07-11' },
    ]
    for (const f of fuelLogs) {
      await session.run(
        `MERGE (fl:FuelLog {id: $id})
         SET fl += $props`,
        { id: f.id, props: { id: f.id, liters: f.liters, cost: f.cost, date: f.date } }
      )
      await session.run(
        `MATCH (fl:FuelLog {id: $id}), (v:Vehicle {regNumber: $reg})
         MERGE (fl)-[:FOR_VEHICLE]->(v)`,
        { id: f.id, reg: f.vehicleReg }
      )
      console.log(`  ✅ Fuel log for ${f.vehicleReg}: ${f.liters}L @ ₹${f.cost}`)
    }

    // ─── 7. SEED EXPENSES ─────────────────────────────────────────────────────
    console.log('\n💸 Seeding expenses...')
    const expenses = [
      { id: 'exp_001', vehicleReg: 'VAN-05', type: 'toll', amount: 240, date: '2026-07-10' },
      { id: 'exp_002', vehicleReg: 'TRUCK-01', type: 'toll', amount: 480, date: '2026-07-10' },
      { id: 'exp_003', vehicleReg: 'BUS-02', type: 'other', amount: 1200, date: '2026-07-11' },
    ]
    for (const e of expenses) {
      await session.run(
        `MERGE (exp:Expense {id: $id})
         SET exp += $props`,
        { id: e.id, props: { id: e.id, type: e.type, amount: e.amount, date: e.date } }
      )
      await session.run(
        `MATCH (exp:Expense {id: $id}), (v:Vehicle {regNumber: $reg})
         MERGE (exp)-[:FOR_VEHICLE]->(v)`,
        { id: e.id, reg: e.vehicleReg }
      )
      console.log(`  ✅ Expense for ${e.vehicleReg}: ₹${e.amount} [${e.type}]`)
    }

    console.log('\n🎉 Demo seeding complete! Database is ready for the Van-05 / Alex workflow demo.')
    console.log('\n📋 Fleet Summary:')
    console.log('  Vehicles: VAN-05 (Available), TRUCK-01 (Available), BUS-02 (Available), TRUCK-03 (In Shop), VAN-04 (Retired)')
    console.log('  Drivers:  Alex (Available), Maria (Available), Raj (On Trip), Sara (Expired license), Tom (Suspended)')
    console.log('  Dispatch Pool: VAN-05, TRUCK-01, BUS-02 | Alex, Maria')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
  } finally {
    await session.close()
    await driver.close()
  }
}

seed()
