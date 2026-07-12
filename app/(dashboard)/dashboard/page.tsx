"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Database } from "lucide-react";
import KpiCards from "@/components/dashboard/kpi-cards";
import ActiveTrips from "@/components/dashboard/active-trips";
import NeedsAttention from "@/components/dashboard/needs-attention";
import DashboardFilters from "@/components/dashboard/dashboard-filters";

interface DashboardKpis {
  activeVehicles: number;
  availableVehicles: number;
  inMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilizationPct: number;
}

const EMPTY_KPIS: DashboardKpis = {
  activeVehicles: 0,
  availableVehicles: 0,
  inMaintenance: 0,
  activeTrips: 0,
  pendingTrips: 0,
  driversOnDuty: 0,
  fleetUtilizationPct: 0,
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis>(EMPTY_KPIS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/dashboard/kpis")
      .then((res) => (res.ok ? res.json() : EMPTY_KPIS))
      .then((data) => {
        if (!cancelled && data && !data.error) {
          setKpis(data);
        }
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading fleet overview..." : "Fleet operations at a glance"}
          </p>
        </div>
        <DashboardFilters />
      </div>

      <KpiCards kpis={kpis} loading={loading} />

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <ActiveTrips tripCount={kpis.activeTrips} loading={loading} />
        </motion.div>

        <NeedsAttention
          pendingTrips={kpis.pendingTrips}
          inMaintenance={kpis.inMaintenance}
          driversOnDuty={kpis.driversOnDuty}
        />
      </div>

      <div className="rounded-xl border bg-white flex flex-col items-center justify-center py-10 gap-2 text-center">
        <div className="bg-slate-100 rounded-full p-3">
          <Database className="h-5 w-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No further data to display</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          All fleet operations are currently accounted for in the live feed. Check the reports tab for historical analytics.
        </p>
      </div>
    </div>
  );
}