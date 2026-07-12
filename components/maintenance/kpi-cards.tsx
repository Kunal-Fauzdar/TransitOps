"use client";

import { motion } from "framer-motion";
import { Wrench, Clock, TrendingDown, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  totalCost?: number;
  activeCount?: number;
}

export default function KpiCards({ totalCost = 0, activeCount = 0 }: Props) {
  const kpis = [
    { label: "Total Expenses (MTD)", value: `$${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Wrench, tone: "default" as const },
    { label: "Active in Service", value: String(activeCount), icon: Clock, tone: "default" as const },
    { label: "Avg. Downtime", value: "14.2 hrs", icon: TrendingDown, tone: "default" as const },
    { label: "Fleet Health", value: "94.2%", icon: HeartPulse, tone: "highlight" as const },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            whileHover={{ y: -3 }}
            className={cn(
              "rounded-xl border p-4 transition-shadow hover:shadow-md cursor-default",
              kpi.tone === "highlight" ? "bg-blue-600 text-white border-blue-600" : "bg-white"
            )}
          >
            <div className="flex items-center justify-between">
              <p className={cn("text-xs font-medium", kpi.tone === "highlight" ? "text-blue-100" : "text-muted-foreground")}>
                {kpi.label}
              </p>
              <Icon className={cn("h-4 w-4", kpi.tone === "highlight" ? "text-blue-100" : "text-muted-foreground")} />
            </div>
            <p className="text-2xl font-semibold mt-2">{kpi.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
