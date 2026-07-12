"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";

const data = [
  { month: "JUL", spend: 4200 },
  { month: "AUG", spend: 6100 },
  { month: "SEP", spend: 5400 },
  { month: "OCT", spend: 12480 },
];

export default function MaintenanceSpendChart() {
  return (
    <div className="rounded-xl border bg-white p-5">
      <h3 className="font-semibold text-sm">Maintenance Spend</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Visual overview of fleet operating costs for current quarter.
      </p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data}>
          <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(59,130,246,0.08)" }}
            contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e2e8f0" }}
          />
          <Bar dataKey="spend" radius={[4, 4, 0, 0]} fill="#bfdbfe" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}