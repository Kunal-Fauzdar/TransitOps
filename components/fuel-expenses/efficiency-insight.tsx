"use client";

import { motion } from "framer-motion";
import { FuelLog } from "@/app/(dashboard)/fuel-expenses/page";

export default function EfficiencyInsight({ fuelLogs }: { fuelLogs: FuelLog[] }) {
  const totalLiters = fuelLogs.reduce((sum, log) => sum + log.liters, 0);
  const totalSpend = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
  const avgPerLog = fuelLogs.length ? totalLiters / fuelLogs.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-blue-700 text-white p-5 relative overflow-hidden"
    >
      <div className="absolute right-0 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute right-10 bottom-6 h-16 w-16 rounded-full bg-white/10 blur-xl" />

      <div className="relative">
        <h3 className="font-semibold text-sm">Efficiency Insight</h3>
        <p className="mt-2 text-sm text-blue-100 max-w-md">
          Vehicle TX-4592-L has shown a 12% increase in fuel consumption over the last 30 days.
          Maintenance scheduling is recommended.
        </p>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-wide text-blue-100">Avg liters/log</p>
            <p className="mt-1 text-2xl font-semibold">{avgPerLog.toFixed(1)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-wide text-blue-100">Total spend</p>
            <p className="mt-1 text-2xl font-semibold">${(totalSpend / 1000).toFixed(1)}k</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-wide text-blue-100">Active cards</p>
            <p className="mt-1 text-2xl font-semibold">{fuelLogs.length}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}