"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function FleetUtilizationCard({
  data,
}: {
  data: { type: string; utilizationPct: number }[];
}) {
  const avg = data.length
    ? Math.round(data.reduce((sum, item) => sum + item.utilizationPct, 0) / data.length)
    : 0;

  return (
    <div className="rounded-2xl border bg-white p-5 h-[320px]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Fleet Utilization</p>
          <h3 className="text-sm font-medium mt-1">% per vehicle type</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{avg}%</p>
          <p className="text-xs text-muted-foreground">Avg. daily active</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="78%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="type" tick={{ fontSize: 12 }} width={80} />
          <Tooltip />
          <Bar dataKey="utilizationPct" radius={[0, 8, 8, 0]} fill="#1d4ed8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}