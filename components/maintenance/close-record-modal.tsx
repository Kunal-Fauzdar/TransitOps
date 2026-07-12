"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import type { MaintenanceLog } from "@/lib/types";

interface Props {
  log: MaintenanceLog | null;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export default function CloseRecordModal({ log, onOpenChange, onClose }: Props) {
  const [endDate, setEndDate] = useState("");
  const [finalCost, setFinalCost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!log) return null;

  const handleClose = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/maintenance/${log.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endDate,
          cost: Number(finalCost) || log.cost,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to close maintenance record");
        return;
      }

      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const vehicleLabel = log.vehicleReg ?? log.vehicleId ?? "vehicle";

  return (
    <Dialog
      open={!!log}
      onOpenChange={(o) => {
        if (!o) {
          setEndDate("");
          setFinalCost("");
          setError("");
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
        >
          <DialogHeader>
            <DialogTitle>Close record</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Enter completion details for {vehicleLabel}
            </p>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>End date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Final cost</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  value={finalCost}
                  onChange={(e) => setFinalCost(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              onClick={handleClose}
              disabled={loading || !endDate}
              className="w-full transition-all active:scale-95 hover:shadow-md"
            >
              {loading ? "Closing..." : "Close record"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full transition-transform active:scale-95"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
