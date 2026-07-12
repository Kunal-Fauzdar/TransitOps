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
