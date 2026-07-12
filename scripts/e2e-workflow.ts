/**
 * e2e-workflow.ts
 * End-to-end integration test for TransitOps — validates all Business Rules from Section 5.
 * Follows the Van-05 / Alex canonical demo workflow from the hackathon PDF.
 *
 * Run with: npx tsx scripts/e2e-workflow.ts
 *
 * Business Rules Tested:
 *  Rule #2 — Retired/In Shop vehicles excluded from dispatch pool
 *  Rule #3 — Suspended/Expired-license drivers excluded from dispatch pool
 *  Rule #4 — Vehicle/Driver already On Trip cannot be dispatched again
 *  Rule #5 — cargoWeight > maxLoadCapacity returns 422
 *  Rule #6 — Dispatch → both vehicle + driver set to On Trip (single txn)
 *  Rule #7 — Complete → both revert to Available, odometer updated (single txn)
 *  Rule #8 — Cancel → both revert to Available (single txn)
 *  Rule #9 — Create MaintenanceLog → vehicle.status = In Shop (single txn)
 *  Rule #10 — Close MaintenanceLog → vehicle.status = Available (unless Retired)
 */

const BASE_URL = 'http://localhost:3000/api'

let passed = 0
let failed = 0

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✅ ${label}`)
    passed++
  } else {
    console.log(`  ❌ ${label}${detail ? ` → ${detail}` : ''}`)
    failed++
  }
}

async function get(path: string) {
  const res = await fetch(`${BASE_URL}${path}`)
  return { status: res.status, data: await res.json() }
}

async function post(path: string, body?: any) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json() }
}

async function runWorkflow() {
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  TransitOps — Full End-to-End Workflow QA (Van-05 / Alex)')
  console.log('  PDF Section 5 Business Rules: #2, #3, #4, #5, #6, #7, #8, #9, #10')
  console.log('═══════════════════════════════════════════════════════════════\n')

  // ─── STEP 1: Verify Dispatch Pools (Rules #2, #3) ──────────────────────────
  console.log('── STEP 1: Verify Dispatch Pools ─────────────────────────────')

  const { data: vehPool } = await get('/vehicles/dispatch-pool')
  const van05InPool = Array.isArray(vehPool) && vehPool.some((v: any) => v.regNumber === 'VAN-05')
  const truck03InPool = Array.isArray(vehPool) && vehPool.some((v: any) => v.regNumber === 'TRUCK-03')
  const van04InPool = Array.isArray(vehPool) && vehPool.some((v: any) => v.regNumber === 'VAN-04')
  assert('Rule #2 — VAN-05 (Available) is in vehicle dispatch pool', van05InPool)
  assert('Rule #2 — TRUCK-03 (In Shop) is NOT in vehicle dispatch pool', !truck03InPool, JSON.stringify(truck03InPool))
  assert('Rule #2 — VAN-04 (Retired) is NOT in vehicle dispatch pool', !van04InPool, JSON.stringify(van04InPool))

  const { data: drvPool } = await get('/drivers/dispatch-pool')
  const alexInPool = Array.isArray(drvPool) && drvPool.some((d: any) => d.id === 'driver_alex_001')
  const saraInPool = Array.isArray(drvPool) && drvPool.some((d: any) => d.id === 'driver_sara_004')
  const tomInPool = Array.isArray(drvPool) && drvPool.some((d: any) => d.id === 'driver_tom_005')
  assert('Rule #3 — Alex (Available + valid license) is in driver dispatch pool', alexInPool)
  assert('Rule #3 — Sara (expired license) is NOT in driver dispatch pool', !saraInPool, JSON.stringify(saraInPool))
  assert('Rule #3 — Tom (Suspended) is NOT in driver dispatch pool', !tomInPool, JSON.stringify(tomInPool))

  // ─── STEP 2: Test Cargo Capacity (Rule #5) ─────────────────────────────────
  console.log('\n── STEP 2: Test Cargo Capacity Limit (Rule #5) ───────────────')

  const overweightRes = await post('/trips', {
    source: 'Delhi',
    destination: 'Agra',
    vehicleId: 'VAN-05',         // maxLoadCapacity = 1500
    driverId: 'driver_alex_001',
    cargoWeight: 2000,            // exceeds 1500 → must 422
    plannedDistance: 200,
  })
  assert('Rule #5 — cargoWeight > maxLoad returns 422', overweightRes.status === 422, `Got ${overweightRes.status}`)

  // ─── STEP 3: Draft a Valid Trip ─────────────────────────────────────────────
  console.log('\n── STEP 3: Draft Valid Trip (Van-05 + Alex, 800kg) ───────────')

  const draftRes = await post('/trips', {
    source: 'Mumbai',
    destination: 'Nashik',
    vehicleId: 'VAN-05',
    driverId: 'driver_alex_001',
    cargoWeight: 800,
    plannedDistance: 170,
  })
  assert('Trip drafted successfully (201)', draftRes.status === 201, `Got ${draftRes.status}`)
  assert('Trip status is Draft', draftRes.data?.status === 'Draft', draftRes.data?.status)
  const tripId = draftRes.data?.id
  console.log(`  📋 Trip ID: ${tripId}`)

  // ─── STEP 4: Dispatch Trip (Rule #6) ───────────────────────────────────────
  console.log('\n── STEP 4: Dispatch Trip (Rule #6) ───────────────────────────')

  const dispatchRes = await post(`/trips/${tripId}/dispatch`)
  assert('Rule #6 — Trip dispatched successfully (200)', dispatchRes.status === 200, `Got ${dispatchRes.status}`)
  assert('Rule #6 — Vehicle status changed to On Trip', dispatchRes.data?.vehicleStatus === 'On Trip', dispatchRes.data?.vehicleStatus)
  assert('Rule #6 — Driver status changed to On Trip', dispatchRes.data?.driverStatus === 'On Trip', dispatchRes.data?.driverStatus)

  // Verify statuses via direct GET
  const { data: van05 } = await get('/vehicles/VAN-05')
  const { data: allDrivers } = await get('/drivers')
  const alex = allDrivers?.find?.((d: any) => d.id === 'driver_alex_001')
  assert('Rule #6 — VAN-05 status verified as On Trip in DB', van05?.status === 'On Trip', van05?.status)
  assert('Rule #6 — Alex status verified as On Trip in DB', alex?.status === 'On Trip', alex?.status)

  // ─── STEP 5: Test Rule #4 — Can't Dispatch Same Vehicle/Driver Again ───────
  console.log('\n── STEP 5: Test Double-Dispatch Block (Rule #4) ──────────────')

  // Draft a second trip for same Van-05 + Alex
  const draft2Res = await post('/trips', {
    source: 'Pune',
    destination: 'Kolhapur',
    vehicleId: 'VAN-05',
    driverId: 'driver_alex_001',
    cargoWeight: 500,
    plannedDistance: 230,
  })
  if (draft2Res.status === 201) {
    const trip2Id = draft2Res.data?.id
    const dispatch2Res = await post(`/trips/${trip2Id}/dispatch`)
    assert('Rule #4 — Dispatching while On Trip returns 422', dispatch2Res.status === 422, `Got ${dispatch2Res.status}`)
  } else {
    // If draft fails for another reason, still log
    console.log('  ⚠️  Second draft trip could not be created:', draft2Res.data)
  }

  // Verify Van-05 still NOT in dispatch pool (it's on a trip)
  const { data: vehPool2 } = await get('/vehicles/dispatch-pool')
  const van05StillInPool = Array.isArray(vehPool2) && vehPool2.some((v: any) => v.regNumber === 'VAN-05')
  assert('Rule #4 — VAN-05 excluded from dispatch pool while On Trip', !van05StillInPool, JSON.stringify(van05StillInPool))

  // ─── STEP 6: Complete Trip (Rule #7) ───────────────────────────────────────
  console.log('\n── STEP 6: Complete Trip (Rule #7) ───────────────────────────')

  const completeRes = await post(`/trips/${tripId}/complete`, {
    finalOdometer: 45370,   // Van-05 started at 45200, trip was 170km
    fuelConsumed: 18,
  })
  assert('Rule #7 — Trip completed successfully (200)', completeRes.status === 200, `Got ${completeRes.status}`)
  assert('Rule #7 — Vehicle status reverted to Available', completeRes.data?.vehicleStatus === 'Available', completeRes.data?.vehicleStatus)
  assert('Rule #7 — Driver status reverted to Available', completeRes.data?.driverStatus === 'Available', completeRes.data?.driverStatus)
  assert('Rule #7 — Vehicle odometer updated to 45370', completeRes.data?.vehicleOdometer === 45370, String(completeRes.data?.vehicleOdometer))

  // ─── STEP 7: Test Cancel Flow (Rule #8) ────────────────────────────────────
  console.log('\n── STEP 7: Test Cancel Trip Flow (Rule #8) ───────────────────')

  // Draft + Dispatch a new trip for Van-05 + Alex
  const draft3Res = await post('/trips', {
    source: 'Mumbai',
    destination: 'Surat',
    vehicleId: 'VAN-05',
    driverId: 'driver_alex_001',
    cargoWeight: 1000,
    plannedDistance: 280,
  })
  const trip3Id = draft3Res.data?.id
  await post(`/trips/${trip3Id}/dispatch`)

  const cancelRes = await post(`/trips/${trip3Id}/cancel`)
  assert('Rule #8 — Trip cancelled successfully (200)', cancelRes.status === 200, `Got ${cancelRes.status}`)
  assert('Rule #8 — Vehicle reverted to Available after cancel', cancelRes.data?.vehicleStatus === 'Available', cancelRes.data?.vehicleStatus)
  assert('Rule #8 — Driver reverted to Available after cancel', cancelRes.data?.driverStatus === 'Available', cancelRes.data?.driverStatus)

  // ─── STEP 8: Test Maintenance Rules (Rules #9, #10) ────────────────────────
  console.log('\n── STEP 8: Maintenance Lifecycle (Rules #9, #10) ─────────────')

  // Create maintenance log for Van-05
  const maintRes = await post('/maintenance', {
    vehicleId: 'VAN-05',
    type: 'Oil Change & Inspection',
    startDate: '2026-07-12',
    cost: 5500,
    notes: 'Scheduled full service',
  })
  assert('Rule #9 — Maintenance log created (201)', maintRes.status === 201, `Got ${maintRes.status}`)
  const maintId = maintRes.data?.id

  const { data: van05AfterMaint } = await get('/vehicles/VAN-05')
  assert('Rule #9 — VAN-05 status is In Shop after maintenance', van05AfterMaint?.status === 'In Shop', van05AfterMaint?.status)

  // Verify excluded from dispatch pool
  const { data: vehPool3 } = await get('/vehicles/dispatch-pool')
  const van05InPool3 = Array.isArray(vehPool3) && vehPool3.some((v: any) => v.regNumber === 'VAN-05')
  assert('Rule #2 — VAN-05 excluded from dispatch pool while In Shop', !van05InPool3, JSON.stringify(van05InPool3))

  // Close maintenance log
  const closeRes = await post(`/maintenance/${maintId}/close`, {
    endDate: '2026-07-12',
    cost: 5500,
  })
  assert('Rule #10 — Maintenance closed successfully (200)', closeRes.status === 200, `Got ${closeRes.status}`)
  assert('Rule #10 — VAN-05 reverted to Available after close', closeRes.data?.vehicleStatus === 'Available', closeRes.data?.vehicleStatus)

  // ─── STEP 9: Verify Dashboard KPIs ─────────────────────────────────────────
  console.log('\n── STEP 9: Verify Dashboard KPIs ─────────────────────────────')

  const { data: kpis } = await get('/dashboard/kpis')
  assert('Dashboard KPIs returned successfully', kpis && typeof kpis.activeVehicles === 'number')
  assert('fleetUtilizationPct is a number', typeof kpis.fleetUtilizationPct === 'number')
  console.log(`  📊 KPIs: Active=${kpis.activeVehicles}, Available=${kpis.availableVehicles}, InShop=${kpis.inMaintenance}, Utilization=${kpis.fleetUtilizationPct}%`)

  // ─── STEP 10: Verify Cost Summary ──────────────────────────────────────────
  console.log('\n── STEP 10: Verify Vehicle Cost Summary ──────────────────────')

  const { data: costSummary } = await get('/vehicles/VAN-05/cost-summary')
  assert('Cost summary returned for VAN-05', costSummary && typeof costSummary.total === 'number')
  console.log(`  💰 VAN-05 Cost Summary: Fuel=₹${costSummary.fuelTotal}, Maintenance=₹${costSummary.maintenanceTotal}, Expenses=₹${costSummary.otherExpensesTotal}, Total=₹${costSummary.total}`)

  // ─── SUMMARY ───────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════')
  console.log(`  RESULTS: ${passed} passed ✅  |  ${failed} failed ❌`)
  if (failed === 0) {
    console.log('  🎉 ALL BUSINESS RULES VALIDATED — Demo ready!')
  } else {
    console.log('  ⚠️  Some assertions failed. Review the output above.')
  }
  console.log('═══════════════════════════════════════════════════════════════')
}

runWorkflow().catch(console.error)
