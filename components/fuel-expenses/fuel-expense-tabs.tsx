"use client";

import { useState } from "react";
import { Fuel, Receipt } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import FuelLogTable from "./fuel-log-table";
import ExpenseTable from "./expense-table";
import AddFuelLogModal from "./add-fuel-log-modal";
import AddExpenseModal from "./add-expense-modal";
import CostByVehicle from "./cost-by-vehicle";
import EfficiencyInsight from "./efficiency-insight";
import type { FuelLog, OtherExpense } from "@/app/(dashboard)/fuel-expenses/page";
import type { Vehicle } from "@/lib/types";

interface Props {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  expenses: OtherExpense[];
  setFuelLogs: React.Dispatch<React.SetStateAction<FuelLog[]>>;
  setExpenses: React.Dispatch<React.SetStateAction<OtherExpense[]>>;
  costByVehicle: { vehicle: string; label: string; total: number }[];
}

export default function FuelExpenseTabs({
  vehicles,
  fuelLogs,
  expenses,
  setFuelLogs,
  setExpenses,
  costByVehicle,
}: Props) {
  const [tab, setTab] = useState("fuel");
  const [fuelOpen, setFuelOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  return (
    <>
      <Tabs value={tab} onValueChange={setTab} className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <TabsList className="bg-white border p-1 rounded-lg">
            <TabsTrigger value="fuel" className="data-[state=active]:bg-slate-100">
              Fuel logs
            </TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-slate-100">
              Other expenses
            </TabsTrigger>
          </TabsList>

          {tab === "fuel" ? (
            <Button
              onClick={() => setFuelOpen(true)}
              className="transition-all active:scale-95 hover:shadow-lg hover:shadow-blue-200"
            >
              <Fuel className="mr-2 h-4 w-4" />
              Add fuel log
            </Button>
          ) : (
            <Button
              onClick={() => setExpenseOpen(true)}
              className="transition-all active:scale-95 hover:shadow-lg hover:shadow-blue-200"
            >
              <Receipt className="mr-2 h-4 w-4" />
              Add expense
            </Button>
          )}
        </div>

        <TabsContent value="fuel" className="space-y-5">
          <FuelLogTable fuelLogs={fuelLogs} />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-5">
          <ExpenseTable expenses={expenses} />
        </TabsContent>

        <div className="grid lg:grid-cols-[1.1fr_1.4fr] gap-5">
          <CostByVehicle costByVehicle={costByVehicle} />
          <EfficiencyInsight fuelLogs={fuelLogs} />
        </div>
      </Tabs>

      <AddFuelLogModal
        open={fuelOpen}
        onOpenChange={setFuelOpen}
        vehicles={vehicles}
        onSubmit={(log) => setFuelLogs((prev) => [log, ...prev])}
      />

      <AddExpenseModal
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
        vehicles={vehicles}
        onSubmit={(expense) => setExpenses((prev) => [expense, ...prev])}
      />
    </>
  );
}