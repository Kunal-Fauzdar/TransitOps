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
import type { Vehicle, VehicleStatus } from "@/lib/types";

const VEHICLE_TYPES = [
  "Heavy Truck",
  "Cargo Van",
  "Bus",
  "Articulated Bus",
  "Light Commercial",
];

const REGIONS = [
  "North-South Express",
  "City Loop B",
  "Airport Shuttle",
  "North-South Route",
  "Unassigned",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (vehicle: Vehicle) => void;
}

export default function AddVehicleModal({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const [regNumber, setRegNumber] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [maxLoadCapacity, setMaxLoadCapacity] = useState("");
  const [odometer, setOdometer] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setRegNumber("");
    setName("");
    setType("");
    setMaxLoadCapacity("");
    setOdometer("");
    setAcquisitionCost("");
    setRegion("");
    setError("");
  };

  const handleSubmit = async () => {
    setError("");

    if (!regNumber.trim() || !name.trim() || !type) {
      setError("Registration number, name, and type are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regNumber: regNumber.trim(),
          name: name.trim(),
          type,
          maxLoadCapacity: Number(maxLoadCapacity) || 1,
          odometer: Number(odometer) || 0,
          acquisitionCost: Number(acquisitionCost) || 1,
          status: "Available" as VehicleStatus,
          region: region || "Unassigned",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create vehicle");
        return;
      }

      onCreated(data);
      reset();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
        >
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Registration Number</Label>
              <Input
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. TRK-1234"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Name / Model</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Scania R500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Vehicle Type</Label>
                <Select value={type} onValueChange={(v) => setType(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Region</Label>
                <Select value={region} onValueChange={(v) => setRegion(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Max Load Capacity (kg)</Label>
                <Input
                  type="number"
                  value={maxLoadCapacity}
                  onChange={(e) => setMaxLoadCapacity(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Odometer (km)</Label>
                <Input
                  type="number"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Acquisition Cost ($)</Label>
              <Input
                type="number"
                value={acquisitionCost}
                onChange={(e) => setAcquisitionCost(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="transition-transform active:scale-95"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !regNumber.trim() || !name.trim() || !type}
              className="transition-all active:scale-95 hover:shadow-md"
            >
              {loading ? "Adding..." : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
