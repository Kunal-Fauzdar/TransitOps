"use client";

import { useMemo, useState } from "react";
import FuelExpenseTabs from "@/components/fuel-expenses/fuel-expense-tabs";
import type { Vehicle } from "@/lib/types";

export interface FuelLog {
  id: string;
  vehicle: string;
  liters: number;
  cost: number;
  date: string;
  status: "Verified" | "Pending";
}

export interface OtherExpense {
  id: string;
  vehicle: string;
  expenseType: "Toll" | "Maintenance" | "Other";
  amount: number;
  date: string;
}

const VEHICLES: Vehicle[] = [
  {
    regNumber: "TX-4592-L",
    name: "Freightliner M2",
    type: "Truck",
    maxLoadCapacity: 20000,
    odometer: 45320,
    acquisitionCost: 120000,
    status: "Available",
    region: "North",
  },
  {
    regNumber: "IL-7723-K",
    name: "Peterbilt 579",
    type: "Truck",
    maxLoadCapacity: 24000,
    odometer: 61240,
    acquisitionCost: 138000,
    status: "Available",
    region: "West",
  },
  {
    regNumber: "NY-8821-B",
    name: "Ford Transit",
    type: "Van",
    maxLoadCapacity: 3500,
    odometer: 28400,
    acquisitionCost: 52000,
    status: "Available",
    region: "East",
  },
  {
    regNumber: "CA-1104-Z",
    name: "Tesla Semi",
    type: "EV Truck",
    maxLoadCapacity: 30000,
    odometer: 18200,
    acquisitionCost: 180000,
    status: "Available",
    region: "South",
  },
  {
    regNumber: "WA-9902-X",
    name: "Volvo FH",
    type: "Truck",
    maxLoadCapacity: 26000,
    odometer: 55900,
    acquisitionCost: 145000,
    status: "On Trip",
    region: "West",
  },
];

const INITIAL_FUEL_LOGS: FuelLog[] = [
  { id: "1", vehicle: "TX-4592-L", liters: 145.5, cost: 206.61, date: "2026-10-24", status: "Verified" },
  { id: "2", vehicle: "NY-8821-B", liters: 88.2, cost: 130.54, date: "2026-10-23", status: "Pending" },
  { id: "3", vehicle: "CA-1104-Z", liters: 420, cost: 50.4, date: "2026-10-22", status: "Verified" },
  { id: "4", vehicle: "TX-4592-L", liters: 132, cost: 190.08, date: "2026-10-22", status: "Verified" },
  { id: "5", vehicle: "IL-7723-K", liters: 210, cost: 296.1, date: "2026-10-21", status: "Verified" },
];

const INITIAL_EXPENSES: OtherExpense[] = [
  { id: "1", vehicle: "TX-4592-L", expenseType: "Maintenance", amount: 2443.81, date: "2026-10-20" },
  { id: "2", vehicle: "IL-7723-K", expenseType: "Maintenance", amount: 1818.9, date: "2026-10-18" },
  { id: "3", vehicle: "NY-8821-B", expenseType: "Toll", amount: 1171.66, date: "2026-10-17" },
  { id: "4", vehicle: "CA-1104-Z", expenseType: "Other", amount: 929.75, date: "2026-10-15" },
  { id: "5", vehicle: "WA-9902-X", expenseType: "Maintenance", amount: 722.4, date: "2026-10-14" },
];

export default function FuelExpensesPage() {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(INITIAL_FUEL_LOGS);
  const [expenses, setExpenses] = useState<OtherExpense[]>(INITIAL_EXPENSES);

  const costByVehicle = useMemo(() => {
    const totals = new Map<string, number>();

    fuelLogs.forEach((log) => {
      totals.set(log.vehicle, (totals.get(log.vehicle) || 0) + log.cost);
    });

    expenses
      .filter((e) => e.expenseType === "Maintenance")
      .forEach((expense) => {
        totals.set(expense.vehicle, (totals.get(expense.vehicle) || 0) + expense.amount);
      });

    return Array.from(totals.entries())
      .map(([vehicle, total]) => {
        const vehicleMeta = VEHICLES.find((v) => v.regNumber === vehicle);
        return {
          vehicle,
          label: vehicleMeta ? `${vehicle} (${vehicleMeta.name})` : vehicle,
          total,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [fuelLogs, expenses]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-xl font-semibold">Fuel & expenses</h1>
        <p className="text-sm text-muted-foreground">
          Track fuel usage, other operating expenses, and per-vehicle operational cost
        </p>
      </div>

      <FuelExpenseTabs
        vehicles={VEHICLES}
        fuelLogs={fuelLogs}
        expenses={expenses}
        setFuelLogs={setFuelLogs}
        setExpenses={setExpenses}
        costByVehicle={costByVehicle}
      />
    </div>
  );
}