"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { OtherExpense } from "@/app/(dashboard)/fuel-expenses/page";
import type { Vehicle } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
  onSubmit: (expense: OtherExpense) => void;
}

export default function AddExpenseModal({ open, onOpenChange, vehicles, onSubmit }: Props) {
  const [vehicle, setVehicle] = useState("");
  const [expenseType, setExpenseType] = useState<"Toll" | "Maintenance" | "Other">("Toll");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");

  const reset = () => {
    setVehicle("");
    setExpenseType("Toll");
    setAmount("");
    setDate("");
  };

  const handleSubmit = () => {
    if (!vehicle || !amount || !date) return;

    onSubmit({
      id: crypto.randomUUID(),
      vehicle,
      expenseType,
      amount: Number(amount),
      date,
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Vehicle</Label>
            <Select value={vehicle} onValueChange={(value) => value && setVehicle(value)}>
              <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.regNumber} value={v.regNumber}>
                    {v.regNumber} ({v.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Expense Type</Label>
              <Select
                value={expenseType}
                onValueChange={(v) => v && setExpenseType(v as "Toll" | "Maintenance" | "Other")}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Toll">Toll</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}