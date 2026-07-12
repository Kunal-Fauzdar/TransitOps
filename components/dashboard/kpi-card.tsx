"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "highlight";
  delay?: number;
}

export default function KpiCard({ label, value, icon: Icon, tone = "default", delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -3 }}
      className={cn(
        "rounded-xl border p-4 transition-shadow hover:shadow-md cursor-default",
        tone === "highlight" ? "bg-blue-600 text-white border-blue-600" : "bg-white"
      )}
    >
      <div className="flex items-center justify-between">
        <p className={cn("text-xs font-medium", tone === "highlight" ? "text-blue-100" : "text-muted-foreground")}>
          {label}
        </p>
        <Icon className={cn("h-4 w-4", tone === "highlight" ? "text-blue-100" : "text-muted-foreground")} />
      </div>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </motion.div>
  );
}
