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
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { Driver, DriverStatus } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (driver: Driver) => void;
}

const STATUSES: DriverStatus[] = ["Available", "On Trip", "Off Duty", "Suspended"];

export default function AddDriverModal({ open, onOpenChange, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseCategory, setLicenseCategory] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [safetyScore, setSafetyScore] = useState("90");
  const [status, setStatus] = useState<DriverStatus>("Available");
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setLicenseNumber("");
    setLicenseCategory("");
    setLicenseExpiryDate("");
    setContactNumber("");
    setSafetyScore("90");
    setStatus("Available");
    setError("");
  };

  const handleSubmit = () => {
    if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
      setError("Please fill all required fields.");
      return;
    }

    onSubmit({
      id: crypto.randomUUID(),
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore: Number(safetyScore),
      status,
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
        >
          <DialogHeader>
            <DialogTitle>Add Driver</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Marcus Jensen" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>License Number</Label>
                <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="CDL-8892" />
              </div>
              <div className="space-y-1.5">
                <Label>License Category</Label>
                <Input value={licenseCategory} onChange={(e) => setLicenseCategory(e.target.value)} placeholder="CDL-A" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>License Expiry</Label>
                <Input type="date" value={licenseExpiryDate} onChange={(e) => setLicenseExpiryDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as DriverStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Contact Number</Label>
              <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="+1 (555) 012-3456" />
            </div>

            <div className="space-y-1.5">
              <Label>Safety Score</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={safetyScore}
                onChange={(e) => setSafetyScore(e.target.value)}
                placeholder="90"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="transition-transform active:scale-95">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="transition-all active:scale-95 hover:shadow-md">
              Add Driver
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}