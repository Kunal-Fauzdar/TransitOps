"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function CostByVehicle({
  costByVehicle,
}: {
  costByVehicle: { vehicle: string; label: string; total: number }[];
}) {
  const max = costByVehicle[0]?.total || 1;

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Cost by vehicle</h3>
        <span className="text-[11px] rounded-md bg-slate-100 px-2 py-1 text-slate-600">
          Monthly
        </span>
      </div>

      <div className="space-y-4">
        {costByVehicle.map((item, i) => (
          <motion.div
            key={item.vehicle}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="space-y-1.5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-700 truncate">{item.label}</p>
              <p className="text-xs font-medium text-slate-800">${item.total.toFixed(2)}</p>
            </div>
            <Progress value={(item.total / max) * 100} className="h-2" />
          </motion.div>
        ))}
      </div>

      <button className="mt-5 text-xs text-blue-600 font-medium hover:underline transition-colors">
        View all vehicle costs
      </button>
    </div>
  );
}