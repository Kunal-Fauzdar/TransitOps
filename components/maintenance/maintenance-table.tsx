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

type MaintenanceRow = MaintenanceLog & {
  vehicleId: string;
  vehicleName: string;
};

const MOCK_LOGS: MaintenanceRow[] = [
  { id: "1", vehicleId: "TX-4092", vehicleName: "Volvo VNL 780 (2023)", type: "Brake pad replacement", startDate: "Oct 24, 2023", cost: 842.0, isActive: true },
  { id: "2", vehicleId: "CA-1122", vehicleName: "Freightliner Cascadia", type: "Oil change & Filters", startDate: "Oct 22, 2023", endDate: "Oct 22, 2023", cost: 320.5, isActive: false },
  { id: "3", vehicleId: "FL-8839", vehicleName: "Ford F-550 Super Duty", type: "Transmission fluid flush", startDate: "Oct 25, 2023", cost: 510.0, isActive: true },
  { id: "4", vehicleId: "NY-0042", vehicleName: "Kenworth T680", type: "Annual DOT Inspection", startDate: "Oct 20, 2023", endDate: "Oct 21, 2023", cost: 1200.0, isActive: false },
  { id: "5", vehicleId: "TX-2291", vehicleName: "Volvo VNL 780 (2023)", type: "Tire rotation & alignment", startDate: "Oct 19, 2023", endDate: "Oct 19, 2023", cost: 450.0, isActive: false },
  { id: "6", vehicleId: "CA-9041", vehicleName: "Peterbilt 579", type: "A/C Compressor Repair", startDate: "Oct 26, 2023", cost: 1120.0, isActive: true },
];

interface Props {
  onRowClick: (log: MaintenanceLog) => void;
}

export default function MaintenanceTable({ onRowClick }: Props) {
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
          {MOCK_LOGS.map((log, i) => (
            <motion.tr
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onRowClick(log)}
              className="cursor-pointer hover:bg-slate-50 transition-colors border-b last:border-0"
            >
              <TableCell>
                <p className="font-medium text-sm">{log.vehicleId}</p>
                <p className="text-xs text-muted-foreground">{log.vehicleName}</p>
              </TableCell>
              <TableCell className="text-sm">{log.type}</TableCell>
              <TableCell className="text-sm">{log.startDate}</TableCell>
              <TableCell className="text-sm">{log.endDate ?? "—"}</TableCell>
              <TableCell className="text-sm font-medium">${log.cost.toFixed(2)}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}