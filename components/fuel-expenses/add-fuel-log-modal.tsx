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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FuelLog } from "@/app/(dashboard)/fuel-expenses/page";
import type { Vehicle } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
  onSubmit: (log: FuelLog) => void;
}

export default function AddFuelLogModal({ open, onOpenChange, vehicles, onSubmit }: Props) {
  const [vehicle, setVehicle] = useState("");
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"Verified" | "Pending">("Verified");

  const reset = () => {
    setVehicle("");
    setLiters("");
    setCost("");
    setDate("");
    setStatus("Verified");
  };

  const handleSubmit = () => {
    if (!vehicle || !liters || !cost || !date) return;

    onSubmit({
      id: crypto.randomUUID(),
      vehicle,
      liters: Number(liters),
      cost: Number(cost),
      date,
      status,
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Fuel Log</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Vehicle</Label>
            <Select value={vehicle} onValueChange={(value) => setVehicle(value ?? "")}>
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
              <Label>Liters</Label>
              <Input type="number" value={liters} onChange={(e) => setLiters(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Cost</Label>
              <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v: "Verified" | "Pending" | null) =>
                  setStatus(((v ?? "Verified") as unknown) as "Verified" | "Pending")
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Verified">Verified</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Log</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}