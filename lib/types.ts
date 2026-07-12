export type UserRole = 'FleetManager' | 'Driver' | 'SafetyOfficer' | 'FinancialAnalyst'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  role: UserRole
}

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired'

export interface Vehicle {
  regNumber: string
  name: string
  type: string
  maxLoadCapacity: number
  odometer: number
  acquisitionCost: number
  status: VehicleStatus
  region: string
}

export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended'

export interface Driver {
  id: string
  name: string
  licenseNumber: string
  licenseCategory: string
  licenseExpiryDate: string // ISO date string (YYYY-MM-DD)
  contactNumber: string
  safetyScore: number // 0 to 100
  status: DriverStatus
}

export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled'

export interface Trip {
  id: string
  source: string
  destination: string
  cargoWeight: number
  plannedDistance: number
  actualDistance?: number
  fuelConsumed?: number
  status: TripStatus
  createdAt: string // ISO date string
}

export interface MaintenanceLog {
  id: string
  vehicleId?: string
  vehicleReg?: string
  vehicleName?: string
  type: string
  cost: number
  startDate: string // ISO date string
  endDate?: string // ISO date string if closed
  isActive: boolean
}

export interface FuelLog {
  id: string
  liters: number
  cost: number
  date: string // ISO date string
}

export interface Expense {
  id: string
  type: 'toll' | 'other'
  amount: number
  date: string // ISO date string
}

// NextAuth type augmentation
declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role: UserRole
  }
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: UserRole
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}

// ─── DTOs for API Requests & Responses ──────────────────────────────────────

export interface LoginRequest {
  email: string
  passwordHash: string
  csrfToken: string
}

export interface CsrfTokenResponse {
  csrfToken: string
}

export interface CreateVehicleRequest {
  regNumber: string
  name: string
  type: string
  maxLoadCapacity: number
  odometer: number
  acquisitionCost: number
  status: VehicleStatus
  region: string
}

export interface UpdateVehicleRequest {
  name?: string
  status?: VehicleStatus
  odometer?: number
}

export interface CreateDriverRequest {
  name: string
  licenseNumber: string
  licenseCategory: string
  licenseExpiryDate: string
  contactNumber: string
  safetyScore: number
  status: DriverStatus
}

export interface UpdateDriverRequest {
  name?: string
  licenseNumber?: string
  licenseCategory?: string
  licenseExpiryDate?: string
  contactNumber?: string
  safetyScore?: number
  status?: DriverStatus
}

export interface CreateTripRequest {
  source: string
  destination: string
  vehicleId: string
  driverId: string
  cargoWeight: number
  plannedDistance: number
}

export interface CompleteTripRequest {
  finalOdometer: number
  fuelConsumed: number
}

export interface CreateMaintenanceRequest {
  vehicleId: string
  type: string
  startDate: string
  cost: number
  notes?: string
}

export interface CloseMaintenanceRequest {
  endDate: string
  cost: number
}

export interface CreateFuelLogRequest {
  vehicleId: string
  liters: number
  cost: number
  date: string
}

export interface CreateExpenseRequest {
  vehicleId: string
  type: 'toll' | 'other'
  amount: number
  date: string
}

export interface CostSummaryResponse {
  fuelTotal: number
  maintenanceTotal: number
  otherExpensesTotal: number
  total: number
}

export interface DashboardKpisResponse {
  activeVehicles: number
  availableVehicles: number
  inMaintenance: number
  activeTrips: number
  pendingTrips: number
  driversOnDuty: number
  fleetUtilizationPct: number
}

export interface FuelEfficiencyReportItem {
  regNumber: string
  name: string
  totalDistance: number
  totalFuel: number
  efficiency: number
}

export interface UtilizationReportItem {
  type: string
  totalType: number
  activeType: number
  utilizationPct: number
}

export interface OperationalCostReportItem {
  regNumber: string
  name: string
  fuelCost: number
  maintenanceCost: number
  otherExpenses: number
  totalCost: number
}

export interface RoiReportItem {
  regNumber: string
  name: string
  acquisitionCost: number
  revenue: number
  totalCost: number
  roi: number
}

export interface ExpiringDriver extends Driver {
  alertType: 'expired' | 'expiring_soon'
  daysUntilExpiry: number
}

export interface ExpiringLicensesResponse {
  total: number
  expired: number
  expiringSoon: number
  drivers: ExpiringDriver[]
}

export interface SendExpiryRemindersResponse {
  sent: boolean
  message: string
  count: number
  drivers: {
    name: string
    licenseExpiryDate: string
    alertType: string
  }[]
}
