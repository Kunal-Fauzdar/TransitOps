"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { MaintenanceLog } from "@/lib/types";

function toNum(val: unknown): number {
  if (typeof val === "number") return val;
  if (val && typeof val === "object" && "toNumber" in val) return (val as { toNumber: () => number }).toNumber();
  return 0;
}

interface Props {
  logs: MaintenanceLog[];
  isLoading: boolean;
  onRowClick: (log: MaintenanceLog) => void;
}

export default function MaintenanceTable({ logs, isLoading, onRowClick }: Props) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Vehicle</TableHead>
            <TableHead>Service type</TableHead>
            <TableHead>Start date</TableHead>
            <TableHead>End date</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                Loading maintenance records...
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                No maintenance records found.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log, i) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => log.isActive && onRowClick(log)}
                className={cn(
                  "transition-colors border-b last:border-0",
                  log.isActive ? "cursor-pointer hover:bg-slate-50" : "cursor-default"
                )}
              >
                <TableCell>
                  <p className="font-medium text-sm">{log.vehicleReg ?? log.vehicleId}</p>
                  <p className="text-xs text-muted-foreground">{log.vehicleName}</p>
                </TableCell>
                <TableCell className="text-sm">{log.type}</TableCell>
                <TableCell className="text-sm">{log.startDate}</TableCell>
                <TableCell className="text-sm">{log.endDate ?? "\u2014"}</TableCell>
                <TableCell className="text-sm font-medium">${toNum(log.cost).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      "border-0 font-medium",
                      log.isActive
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        : "bg-green-100 text-green-700 hover:bg-green-100"
                    )}
                  >
                    {log.isActive ? "Active" : "Closed"}
                  </Badge>
                </TableCell>
              </motion.tr>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
