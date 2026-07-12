"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
import type { Vehicle } from "@/lib/types";

const ROUTES = ["North-South Express", "City Loop B", "Airport Shuttle", "North-South Route", "Unassigned"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (vehicle: Vehicle) => void;
  existingRegNumbers: string[];
}

export default function AddVehicleModal({ open, onOpenChange, onSubmit, existingRegNumbers }: Props) {
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [vin, setVin] = useState("");
  const [route, setRoute] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setModel(""); setYear(""); setPlate(""); setVin(""); setRoute(""); setError("");
  };

  const handleSubmit = async () => {
    if (!model || !plate) {
      setError("Model and License Plate are required.");
      return;
    }
    if (existingRegNumbers.includes(plate)) {
      setError("A vehicle with this plate already exists.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);

    onSubmit({
      regNumber: plate,
      name: model,
      type: "Bus",
      maxLoadCapacity: 0,
      odometer: 0,
      acquisitionCost: 0,
      status: "Available",
      region: route || "Unassigned",
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.18 }}>
          <DialogHeader>
            <DialogTitle>Add vehicle</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Model</Label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Mercedes-Benz Citaro" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Year</Label>
                <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" />
              </div>
              <div className="space-y-1.5">
                <Label>License Plate</Label>
                <Input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="ABC-1234" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>VIN</Label>
              <Input value={vin} onChange={(e) => setVin(e.target.value)} placeholder="17-digit vehicle identification number" />
            </div>

            <div className="space-y-1.5">
              <Label>Primary Route</Label>
              <Select value={route} onValueChange={(value) => setRoute(value ?? "")}>
                <SelectTrigger><SelectValue placeholder="Select a route" /></SelectTrigger>
                <SelectContent>
                  {ROUTES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="transition-transform active:scale-95">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="transition-all active:scale-95 hover:shadow-md">
              {loading ? "Adding..." : "Add vehicle"}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}