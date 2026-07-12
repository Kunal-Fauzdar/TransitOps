"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Vehicle, VehicleStatus } from "@/lib/types";

const STATUSES: VehicleStatus[] = ["Available", "On Trip", "In Shop", "Retired"];

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}

const MOCK_MAINTENANCE = [
  { date: "Nov 2, 2025", desc: "Brake pads replaced", cost: 420 },
  { date: "Aug 14, 2025", desc: "Annual inspection", cost: 1200 },
];

const MOCK_TRIPS = [
  { date: "Jun 1, 2026", route: "Chicago, IL → Houston, TX", status: "Completed" },
  { date: "Apr 18, 2026", route: "Dallas, TX → Miami, FL", status: "Completed" },
];

export default function VehicleDetailPanel({ vehicle, onClose, onSave }: Props) {
  const [form, setForm] = useState<Vehicle | null>(vehicle);

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
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4 mt-3 grid w-auto grid-cols-3 gap-1 bg-slate-100 p-1 rounded-md">
              <TabsTrigger
                value="details"
                className="text-xs px-2 py-1.5 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="maintenance"
                className="text-xs px-2 py-1.5 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Maintenance
              </TabsTrigger>
              <TabsTrigger
                value="trips"
                className="text-xs px-2 py-1.5 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Trip history
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Registration number</Label>
                  <Input value={form.regNumber} disabled className="bg-slate-50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as VehicleStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Model / manufacturer</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Type</Label>
                  <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Region</Label>
                  <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">DIMENSIONS & LOAD</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Max load capacity (kg)</Label>
                    <Input
                      type="number"
                      value={form.maxLoadCapacity}
                      onChange={(e) => setForm({ ...form, maxLoadCapacity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Odometer (km)</Label>
                    <Input
                      type="number"
                      value={form.odometer}
                      onChange={(e) => setForm({ ...form, odometer: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Acquisition cost ($)</Label>
                <Input
                  type="number"
                  value={form.acquisitionCost}
                  onChange={(e) => setForm({ ...form, acquisitionCost: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Internal notes</Label>
                <Textarea rows={3} placeholder="Scheduled for annual inspection in November..." />
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {MOCK_MAINTENANCE.map((m, i) => (
                <div key={i} className="rounded-md border p-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{m.desc}</p>
                    <p className="text-xs text-muted-foreground">{m.date}</p>
                  </div>
                  <span className="font-medium">${m.cost}</span>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="trips" className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {MOCK_TRIPS.map((t, i) => (
                <div key={i} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{t.route}</p>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{t.date}</span>
                    <span>{t.status}</span>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 p-4 border-t">
            <Button
              className="flex-1 transition-all active:scale-95 hover:shadow-md"
              onClick={() => onSave(form)}
            >
              Save Changes
            </Button>
            <Button variant="outline" className="flex-1 transition-transform active:scale-95" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}