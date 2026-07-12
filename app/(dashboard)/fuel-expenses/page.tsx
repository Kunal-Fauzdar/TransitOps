"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
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

export default function FuelExpensesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<OtherExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [vehiclesRes, fuelLogsRes, expensesRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/fuel-logs"),
        fetch("/api/expenses"),
      ]);

      if (!vehiclesRes.ok || !fuelLogsRes.ok || !expensesRes.ok) {
        throw new Error("Failed to load operational costs data");
      }

      const vehiclesData = await vehiclesRes.json();
      const fuelLogsData = await fuelLogsRes.json();
      const expensesData = await expensesRes.json();

      setVehicles(vehiclesData);

      // Map Neo4j models to frontend interfaces
      const mappedFuel = fuelLogsData.map((log: any) => ({
        id: log.id,
        vehicle: log.vehicleReg || log.vehicle || "Unassigned",
        liters: Number(log.liters || 0),
        cost: Number(log.cost || 0),
        date: log.date || new Date().toISOString().split("T")[0],
        status: "Verified",
      }));

      const mappedExpenses = expensesData.map((e: any) => ({
        id: e.id,
        vehicle: e.vehicleReg || e.vehicle || "Unassigned",
        expenseType: e.type === "toll" ? "Toll" : e.type === "maintenance" ? "Maintenance" : "Other",
        amount: Number(e.amount || 0),
        date: e.date || new Date().toISOString().split("T")[0],
      }));

      setFuelLogs(mappedFuel);
      setExpenses(mappedExpenses);
    } catch (err: any) {
      setError(err.message || "An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddFuelLog = async (logInput: any) => {
    try {
      const res = await fetch("/api/fuel-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: logInput.vehicle,
          liters: Number(logInput.liters),
          cost: Number(logInput.cost),
          date: logInput.date,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to add fuel log");
        return;
      }

      fetchData();
    } catch {
      alert("Network error. Please try again.");
    }
  };

  const handleAddExpense = async (expenseInput: any) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: expenseInput.vehicle,
          type: expenseInput.expenseType.toLowerCase() === "toll" ? "toll" : "other",
          amount: Number(expenseInput.amount),
          date: expenseInput.date,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to add expense");
        return;
      }

      fetchData();
    } catch {
      alert("Network error. Please try again.");
    }
  };

  const costByVehicle = useMemo(() => {
    const totals = new Map<string, number>();

    fuelLogs.forEach((log) => {
      totals.set(log.vehicle, (totals.get(log.vehicle) || 0) + log.cost);
    });

    expenses.forEach((expense) => {
      totals.set(expense.vehicle, (totals.get(expense.vehicle) || 0) + expense.amount);
    });

    return Array.from(totals.entries())
      .map(([vehicle, total]) => {
        const vehicleMeta = vehicles.find((v) => v.regNumber === vehicle);
        return {
          vehicle,
          label: vehicleMeta ? `${vehicle} (${vehicleMeta.name})` : vehicle,
          total,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [fuelLogs, expenses, vehicles]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-xl font-semibold">Fuel & expenses</h1>
        <p className="text-sm text-muted-foreground">
          Track fuel usage, other operating expenses, and per-vehicle operational cost
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && fuelLogs.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground animate-pulse">
          Loading operational expense logs...
        </div>
      ) : (
        <FuelExpenseTabs
          vehicles={vehicles}
          fuelLogs={fuelLogs}
          expenses={expenses}
          setFuelLogs={setFuelLogs}
          setExpenses={setExpenses}
          costByVehicle={costByVehicle}
          onAddFuelLog={handleAddFuelLog}
          onAddExpense={handleAddExpense}
        />
      )}
    </div>
  );
}