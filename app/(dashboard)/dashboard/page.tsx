"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Truck, Wrench, Route, Clock, Users, Gauge } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import KpiCard from "@/components/dashboard/kpi-card";

interface DashboardKpis {
  activeVehicles: number;
  availableVehicles: number;
  inMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilizationPct: number;
}

const EMPTY_KPIs: DashboardKpis = {
  activeVehicles: 0,
  availableVehicles: 0,
  inMaintenance: 0,
  activeTrips: 0,
  pendingTrips: 0,
  driversOnDuty: 0,
  fleetUtilizationPct: 0,
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis>(EMPTY_KPIs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/kpis")
      .then((res) => (res.ok ? res.json() : EMPTY_KPIs))
      .then((data) => {
        if (!cancelled && data && !data.error) setKpis(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading fleet overview..." : "Fleet operations at a glance"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Active Vehicles" value={kpis.activeVehicles} icon={Truck} delay={0} />
        <KpiCard label="Available Vehicles" value={kpis.availableVehicles} icon={Truck} delay={0.06} />
        <KpiCard label="In Maintenance" value={kpis.inMaintenance} icon={Wrench} delay={0.12} />
        <KpiCard label="Active Trips" value={kpis.activeTrips} icon={Route} delay={0.18} />
        <KpiCard label="Pending Trips" value={kpis.pendingTrips} icon={Clock} delay={0.24} />
        <KpiCard label="Drivers On Duty" value={kpis.driversOnDuty} icon={Users} delay={0.30} />
        <KpiCard
          label="Fleet Utilization"
          value={`${kpis.fleetUtilizationPct}%`}
          icon={Gauge}
          tone="highlight"
          delay={0.36}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-white overflow-hidden"
        >
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Active Trips</h3>
            <p className="text-xs text-muted-foreground">Currently dispatched routes</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Route</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpis.activeTrips === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-sm text-muted-foreground">
                    No active trips
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-sm text-muted-foreground">
                    {kpis.activeTrips} trip{kpis.activeTrips !== 1 ? "s" : ""} in progress
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border bg-white overflow-hidden"
        >
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Fleet Status Summary</h3>
            <p className="text-xs text-muted-foreground">Vehicle distribution by status</p>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: "Available", count: kpis.availableVehicles, color: "bg-green-500" },
              { label: "On Trip", count: kpis.activeVehicles, color: "bg-blue-500" },
              { label: "In Maintenance", count: kpis.inMaintenance, color: "bg-amber-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", item.color)} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="text-sm font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
