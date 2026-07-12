"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { FuelLog } from "@/app/(dashboard)/fuel-expenses/page";

export default function FuelLogTable({ fuelLogs }: { fuelLogs: FuelLog[] }) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b text-xs text-muted-foreground">
            <th className="text-left font-medium px-4 py-3">Date</th>
            <th className="text-left font-medium px-4 py-3">Vehicle</th>
            <th className="text-left font-medium px-4 py-3">Liters</th>
            <th className="text-left font-medium px-4 py-3">Cost</th>
            <th className="text-left font-medium px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {fuelLogs.map((log, i) => (
            <motion.tr
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="border-b last:border-0 hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-3 text-sm">{log.date}</td>
              <td className="px-4 py-3 text-sm font-medium">{log.vehicle}</td>
              <td className="px-4 py-3 text-sm">{log.liters.toFixed(2)} L</td>
              <td className="px-4 py-3 text-sm">${log.cost.toFixed(2)}</td>
              <td className="px-4 py-3">
                <Badge
                  className={
                    log.status === "Verified"
                      ? "border-0 bg-green-100 text-green-700 hover:bg-green-100"
                      : "border-0 bg-amber-100 text-amber-700 hover:bg-amber-100"
                  }
                >
                  {log.status}
                </Badge>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      <div className="px-4 py-3 border-t text-xs text-muted-foreground">
        Showing {fuelLogs.length} of {fuelLogs.length} logs
      </div>
    </div>
  );
}