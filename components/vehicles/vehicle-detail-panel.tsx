"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Vehicle, VehicleStatus, MaintenanceLog, Trip } from "@/lib/types";

function toNum(val: unknown): number {
  if (typeof val === "number") return val;
  if (val && typeof val === "object" && "toNumber" in val)
    return (val as { toNumber: () => number }).toNumber();
  return 0;
}

const STATUSES: VehicleStatus[] = ["Available", "On Trip", "In Shop", "Retired"];

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}

export default function VehicleDetailPanel({ vehicle, onClose, onSave }: Props) {
  const [form, setForm] = useState<Vehicle | null>(vehicle);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    if (!vehicle) return;
    Promise.all([
      fetch("/api/maintenance").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/trips").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([maintData, tripData]) => {
        if (Array.isArray(maintData)) {
          setMaintenanceLogs(
            maintData.filter(
              (l: MaintenanceLog) =>
                l.vehicleReg === vehicle.regNumber ||
                l.vehicleId === vehicle.regNumber
            )
          );
        }
        if (Array.isArray(tripData)) {
          setTrips(
            tripData.filter((t: Trip & { vehicleReg?: string }) =>
              t.vehicleReg === vehicle.regNumber
            )
          );
        }
        setHistoryLoaded(true);
      })
      .catch(() => {
        setHistoryLoaded(true);
      });
  }, [vehicle]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/vehicles/${encodeURIComponent(form.regNumber)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          maxLoadCapacity: form.maxLoadCapacity,
          odometer: form.odometer,
          acquisitionCost: form.acquisitionCost,
          status: form.status,
          region: form.region,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "Failed to save");
        return;
      }
      onSave(data);
    } catch {
      setSaveError("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {vehicle && form && (
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-95 border rounded-lg bg-white h-full flex flex-col"
        >
          <div className="flex items-center justify-between px-5 h-14 border-b">
            <h3 className="font-semibold text-sm">{form.regNumber}</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-3 mx-4 mt-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="trips">Trips</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Registration number</Label>
                  <Input value={form.regNumber} disabled className="bg-slate-50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as VehicleStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Model / manufacturer</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Type</Label>
                  <Input
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Region</Label>
                  <Input
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  DIMENSIONS & LOAD
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max load capacity (kg)</Label>
                    <Input
                      type="number"
                      value={form.maxLoadCapacity}
                      onChange={(e) =>
                        setForm({ ...form, maxLoadCapacity: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Odometer (km)</Label>
                    <Input
                      type="number"
                      value={form.odometer}
                      onChange={(e) =>
                        setForm({ ...form, odometer: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Acquisition cost ($)</Label>
                <Input
                  type="number"
                  value={form.acquisitionCost}
                  onChange={(e) =>
                    setForm({ ...form, acquisitionCost: Number(e.target.value) })
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {!historyLoaded ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading...
                </p>
              ) : maintenanceLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No maintenance records
                </p>
              ) : (
                maintenanceLogs.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-md border p-3 flex justify-between items-center text-sm"
                  >
                    <div>
                      <p className="font-medium">{m.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.startDate}
                        {m.endDate ? ` — ${m.endDate}` : " (ongoing)"}
                      </p>
                    </div>
                    <span className="font-medium">
                      ${toNum(m.cost).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="trips" className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {!historyLoaded ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading...
                </p>
              ) : trips.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No trip records
                </p>
              ) : (
                trips.map((t) => (
                  <div key={t.id} className="rounded-md border p-3 text-sm">
                    <p className="font-medium">
                      {t.source} → {t.destination}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{t.createdAt?.split("T")[0] ?? "—"}</span>
                      <span>{t.status}</span>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 p-4 border-t">
            {saveError && (
              <p className="text-xs text-red-500 absolute bottom-16 left-4 right-4">
                {saveError}
              </p>
            )}
            <Button
              className="flex-1 transition-all active:scale-95 hover:shadow-md"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
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
