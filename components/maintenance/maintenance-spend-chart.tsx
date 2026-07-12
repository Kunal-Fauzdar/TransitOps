"use client";

import { useMemo } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import type { MaintenanceLog } from "@/lib/types";

function toNum(val: unknown): number {
  if (typeof val === "number") return val;
  if (val && typeof val === "object" && "toNumber" in val) return (val as { toNumber: () => number }).toNumber();
  return 0;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Props {
  logs: MaintenanceLog[];
}

export default function MaintenanceSpendChart({ logs }: Props) {
  const data = useMemo(() => {
    const monthMap = new Map<string, number>();
    for (const log of logs) {
      if (!log.startDate) continue;
      const d = new Date(log.startDate);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthMap.set(key, (monthMap.get(key) || 0) + toNum(log.cost));
    }
    const entries = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
    return entries.map(([, val], i) => ({
      month: MONTHS[parseInt(entries[i][0].split("-")[1], 10)],
      spend: Math.round(val),
    }));
  }, [logs]);

  return (
    <div className="rounded-xl border bg-white p-5">
      <h3 className="font-semibold text-sm">Maintenance Spend</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Visual overview of fleet operating costs.
      </p>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No spend data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(59,130,246,0.08)" }}
              contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e2e8f0" }}
              formatter={(value) => [`$${Number(value).toLocaleString()}`, "Spend"]}
            />
            <Bar dataKey="spend" radius={[4, 4, 0, 0]} fill="#bfdbfe" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
