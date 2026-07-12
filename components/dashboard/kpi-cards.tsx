"use client";

import { motion } from "framer-motion";
import { Truck, Wrench, Route, Clock, Users, Gauge } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DashboardKpis {
  activeVehicles: number;
  availableVehicles: number;
  inMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilizationPct: number;
}

interface Props {
  kpis: DashboardKpis;
  loading?: boolean;
}

export default function KpiCards({ kpis, loading = false }: Props) {
  const items = [
    { label: "Active Vehicles", value: kpis.activeVehicles, icon: Truck },
    { label: "Available Vehicles", value: kpis.availableVehicles, icon: Truck },
    { label: "In Maintenance", value: kpis.inMaintenance, icon: Wrench },
    { label: "Active Trips", value: kpis.activeTrips, icon: Route },
    { label: "Pending Trips", value: kpis.pendingTrips, icon: Clock },
    { label: "Drivers On Duty", value: kpis.driversOnDuty, icon: Users },
    {
      label: "Fleet Utilization",
      value: `${kpis.fleetUtilizationPct}%`,
      icon: Gauge,
      progress: kpis.fleetUtilizationPct,
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            whileHover={{ y: -3 }}
            className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${
              item.highlight ? "bg-blue-600 text-white border-blue-600" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-xs font-medium ${item.highlight ? "text-blue-100" : "text-muted-foreground"}`}>
                {item.label}
              </p>
              <Icon className={`h-4 w-4 ${item.highlight ? "text-blue-100" : "text-muted-foreground"}`} />
            </div>

            <p className="text-2xl font-semibold mt-2">
              {loading ? "—" : item.value}
            </p>

            {typeof item.progress === "number" && !loading ? (
              <Progress value={item.progress} className="h-1.5 mt-3 bg-blue-500/30" />
            ) : (
              <div className="mt-3 h-1.5" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}