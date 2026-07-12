"use client";

import { cn } from "@/lib/utils";

function roiTone(value: number) {
  if (value < 0) return "bg-red-50 text-red-600 border-red-100";
  if (value < 10) return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-green-50 text-green-700 border-green-100";
}

export default function VehicleRoiCard({
  data,
}: {
  data: { vehicle: string; roi: number }[];
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 h-[320px] overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Vehicle ROI</p>
          <h3 className="text-sm font-medium mt-1">Color-coded by return percentage</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
        </p>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="grid grid-cols-[1fr_120px] bg-slate-50 text-xs text-muted-foreground border-b">
          <div className="px-4 py-3 font-medium">Vehicle</div>
          <div className="px-4 py-3 font-medium text-right">ROI %</div>
        </div>

        {data.map((item) => (
          <div
            key={item.vehicle}
            className="grid grid-cols-[1fr_120px] border-b last:border-0"
          >
            <div className="px-4 py-3 text-sm font-medium">{item.vehicle}</div>
            <div className="px-4 py-3 flex justify-end">
              <span
                className={cn(
                  "text-sm font-semibold rounded-md px-2.5 py-1 border min-w-[72px] text-center",
                  roiTone(item.roi)
                )}
              >
                {item.roi > 0 ? `+${item.roi}%` : `${item.roi}%`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}