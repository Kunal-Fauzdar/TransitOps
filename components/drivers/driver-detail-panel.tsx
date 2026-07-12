"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import DriverStatusBadge from "./driver-status-badge";
import type { Driver, DriverStatus } from "@/lib/types";

interface Props {
  driver: Driver | null;
  onClose: () => void;
  onSave: (driver: Driver) => void;
}

const STATUSES: DriverStatus[] = ["Available", "On Trip", "Off Duty", "Suspended"];

function getExpiryMeta(date: string) {
  const today = new Date();
  const expiry = new Date(date);
  const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    daysLeft: diff,
    expired: diff < 0,
    warning: diff >= 0 && diff < 30,
  };
}

export default function DriverDetailPanel({ driver, onClose, onSave }: Props) {
  const [form, setForm] = useState<Driver | null>(driver);

  useEffect(() => {
    setForm(driver);
  }, [driver]);

  if (!form) return null;

  const expiry = getExpiryMeta(form.licenseExpiryDate);

  return (
    <AnimatePresence>
      {driver && (
        <motion.div
          initial={{ x: 32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 32, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-[380px] rounded-xl border bg-white h-full flex flex-col"
        >
          <div className="h-14 px-5 border-b flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">{form.name}</h3>
              <p className="text-xs text-muted-foreground">{form.licenseNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {(expiry.expired || expiry.warning) && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">
                  {expiry.expired
                    ? "This license is expired and this driver cannot be dispatched."
                    : `License expires in ${expiry.daysLeft} days.`}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Driver Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as DriverStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">License Number</Label>
              <Input
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">License Category</Label>
                <Input
                  value={form.licenseCategory}
                  onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Expiry Date</Label>
                <Input
                  type="date"
                  value={form.licenseExpiryDate}
                  onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Contact Number</Label>
              <Input
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Safety Score</Label>
                <span className="text-xs font-medium">{form.safetyScore}/100</span>
              </div>
              <Progress value={form.safetyScore} className="h-2" />
              <Input
                type="number"
                min={0}
                max={100}
                value={form.safetyScore}
                onChange={(e) =>
                  setForm({ ...form, safetyScore: Math.max(0, Math.min(100, Number(e.target.value))) })
                }
              />
            </div>

            <div className="pt-1">
              <DriverStatusBadge status={form.status} />
            </div>
          </div>

          <div className="p-4 border-t flex gap-2">
            <Button
              className="flex-1 transition-all active:scale-95 hover:shadow-md"
              onClick={() => onSave(form)}
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              className="flex-1 transition-transform active:scale-95"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}