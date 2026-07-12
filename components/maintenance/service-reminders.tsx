"use client";

import { AlertTriangle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const reminders = [
  { type: "overdue", title: "Overdue: Annual Safety Inspection", subtitle: "Vehicle TX-1002 • Due 3 days ago", action: "Schedule" },
  { type: "upcoming", title: "Upcoming: Preventative Maintenance", subtitle: "Vehicle CA-4001 • in 12 days", action: "Manage" },
];

export default function ServiceReminders() {
  return (
    <div className="rounded-xl border bg-white p-5">
      <h3 className="font-semibold text-sm mb-4">Service Reminders</h3>
      <div className="space-y-3">
        {reminders.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start gap-2.5">
              {r.type === "overdue" ? (
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
              ) : (
                <Wrench className="h-4 w-4 text-blue-500 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.subtitle}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 transition-transform active:scale-95 hover:border-blue-400 hover:text-blue-600"
            >
              {r.action}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}