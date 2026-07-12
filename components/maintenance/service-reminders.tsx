"use client";

import { Wrench } from "lucide-react";
import { motion } from "framer-motion";
import type { MaintenanceLog } from "@/lib/types";

function toNum(val: unknown): number {
  if (typeof val === "number") return val;
  if (val && typeof val === "object" && "toNumber" in val) return (val as { toNumber: () => number }).toNumber();
  return 0;
}

interface Props {
  logs: MaintenanceLog[];
}

export default function ServiceReminders({ logs }: Props) {
  const activeLogs = logs.filter((l) => l.isActive);

  if (activeLogs.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <h3 className="font-semibold text-sm mb-4">Service Reminders</h3>
        <p className="text-sm text-muted-foreground text-center py-4">No active services</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-5">
      <h3 className="font-semibold text-sm mb-4">Active Services</h3>
      <div className="space-y-3">
        {activeLogs.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <Wrench className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{log.type}</p>
                <p className="text-xs text-muted-foreground">
                  {log.vehicleReg ?? log.vehicleId} &bull; ${toNum(log.cost).toFixed(2)}
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {log.startDate}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
