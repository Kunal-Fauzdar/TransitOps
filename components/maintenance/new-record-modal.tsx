"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

const SERVICE_TYPES = ["Oil Change", "Brake Repair", "Tire Rotation", "DOT Inspection", "Transmission Service", "A/C Repair"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: () => void;
}

export default function NewRecordModal({ open, onOpenChange, onCreate }: Props) {
  const [vehicles, setVehicles] = useState<{ regNumber: string; name: string }[]>([]);
  const [vehicle, setVehicle] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vehiclesFetched, setVehiclesFetched] = useState(false);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch("/api/vehicles?status=Available", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVehicles(data);
        }
        setVehiclesFetched(true);
      })
      .catch(() => {
        setVehiclesFetched(true);
      });
    return () => controller.abort();
  }, [open]);

  const resetForm = () => {
    setVehicle("");
    setServiceType("");
    setStartDate("");
    setEstimatedCost("");
    setNotes("");
    setError("");
  };

  const handleCreate = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle,
          type: serviceType,
          startDate,
          cost: Number(estimatedCost) || 0,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create maintenance record");
        return;
      }

      resetForm();
      onCreate();
      onOpenChange(false);
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
        if (!o) resetForm();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
        >
          <DialogHeader>
            <DialogTitle>New Maintenance Record</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Vehicle</Label>
              <Select value={vehicle} onValueChange={(val) => setVehicle(val ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder={!vehiclesFetched ? "Loading vehicles..." : "Select vehicle..."} />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.regNumber} value={v.regNumber}>
                      {v.regNumber} &mdash; {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Service type</Label>
              <Select value={serviceType} onValueChange={(val) => setServiceType(val ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type..." />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Estimated cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe the maintenance issues or specific tasks..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="transition-transform active:scale-95">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading || !vehicle || !serviceType || !startDate}
              className="transition-all active:scale-95 hover:shadow-md"
            >
              {loading ? "Creating..." : "Create record"}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
