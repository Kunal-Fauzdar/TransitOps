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

export default function FuelEfficiencyCard({
  data,
}: {
  data: { vehicle: string; efficiency: number }[];
}) {
  const avg = data.length
    ? (data.reduce((sum, item) => sum + item.efficiency, 0) / data.length).toFixed(1)
    : "0.0";

  return (
    <div className="rounded-2xl border bg-white p-5 h-[320px]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Fuel Efficiency</p>
          <h3 className="text-sm font-medium mt-1">Distance / Fuel per vehicle</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{avg}</p>
          <p className="text-xs text-muted-foreground">Avg MPG</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="78%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="vehicle" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="efficiency" radius={[8, 8, 0, 0]} fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}