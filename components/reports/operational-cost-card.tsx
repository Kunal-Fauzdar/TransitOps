"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function OperationalCostCard({
  data,
}: {
  data: { vehicle: string; fuel: number; maintenance: number }[];
}) {
  const total = data.reduce((sum, item) => sum + item.fuel + item.maintenance, 0);

  return (
    <div className="rounded-2xl border bg-white p-5 h-[320px]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Operational Cost</p>
          <h3 className="text-sm font-medium mt-1">Fuel vs Maintenance per vehicle</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">${(total / 1000).toFixed(1)}k</p>
          <p className="text-xs text-muted-foreground">Total spend</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="78%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="vehicle" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="fuel" stackId="a" fill="#2563eb" radius={[6, 6, 0, 0]} />
          <Bar dataKey="maintenance" stackId="a" fill="#f97316" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}