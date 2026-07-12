"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import KpiCards from "@/components/maintenance/kpi-cards";
import MaintenanceTable from "@/components/maintenance/maintenance-table";
import ServiceReminders from "@/components/maintenance/service-reminders";
import MaintenanceSpendChart from "@/components/maintenance/maintenance-spend-chart";
import NewRecordModal from "@/components/maintenance/new-record-modal";
import CloseRecordModal from "@/components/maintenance/close-record-modal";
import type { MaintenanceLog } from "@/lib/types";

export default function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [closingLog, setClosingLog] = useState<MaintenanceLog | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/maintenance")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) setLogs(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshLogs = useCallback(() => {
    setLoading(true);
    fetch("/api/maintenance")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setLogs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCount = logs.filter((l) => l.isActive).length;
  const totalCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Maintenance</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
            {loading && logs.length === 0
              ? "Loading..."
              : `${activeCount} Active service${activeCount !== 1 ? "s" : ""} currently in progress`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="transition-all active:scale-95 hover:border-slate-400"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button
            onClick={() => setNewModalOpen(true)}
            className="transition-all active:scale-95 hover:shadow-lg hover:shadow-blue-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Record
          </Button>
        </div>
      </div>

      <KpiCards totalCost={totalCost} activeCount={activeCount} />

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <MaintenanceTable logs={logs} isLoading={loading} onRowClick={setClosingLog} />
        </motion.div>

        <div className="space-y-6">
          <ServiceReminders logs={logs} />
          <MaintenanceSpendChart logs={logs} />
        </div>
      </div>

      <NewRecordModal
        open={newModalOpen}
        onOpenChange={setNewModalOpen}
        onCreate={refreshLogs}
      />

      <CloseRecordModal
        key={closingLog?.id ?? "closed"}
        log={closingLog}
        onOpenChange={(open) => !open && setClosingLog(null)}
        onClose={() => {
          setClosingLog(null);
          refreshLogs();
        }}
      />
    </div>
  );
}
