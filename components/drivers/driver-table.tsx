"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Pencil } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import DriverStatusBadge from "./driver-status-badge";
import { cn } from "@/lib/utils";
import type { Driver } from "@/lib/types";

interface Props {
  drivers: Driver[];
  selected: Driver | null;
  onRowClick: (driver: Driver) => void;
}

function getExpiryMeta(date: string) {
  const today = new Date();
  const expiry = new Date(date);
  const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return {
    daysLeft: diff,
    expired: diff < 0,
    warning: diff >= 0 && diff < 30,
  };
}

export default function DriverTable({ drivers, selected, onRowClick }: Props) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b text-xs text-muted-foreground">
            <th className="text-left font-medium px-4 py-3">Name</th>
            <th className="text-left font-medium px-4 py-3">License Number</th>
            <th className="text-left font-medium px-4 py-3">License Category</th>
            <th className="text-left font-medium px-4 py-3">License Expiry</th>
            <th className="text-left font-medium px-4 py-3">Contact Number</th>
            <th className="text-left font-medium px-4 py-3">Safety Score</th>
            <th className="text-left font-medium px-4 py-3">Status</th>
            <th className="text-right font-medium px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {drivers.map((driver, i) => {
            const expiry = getExpiryMeta(driver.licenseExpiryDate);

            return (
              <motion.tr
                key={driver.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "border-b last:border-0 hover:bg-slate-50 transition-colors",
                  selected?.id === driver.id && "bg-blue-50"
                )}
              >
                <td
                  className="px-4 py-3 text-sm font-medium cursor-pointer"
                  onClick={() => onRowClick(driver)}
                >
                  {driver.name}
                </td>
                <td className="px-4 py-3 text-sm cursor-pointer" onClick={() => onRowClick(driver)}>
                  {driver.licenseNumber}
                </td>
                <td className="px-4 py-3 text-sm cursor-pointer" onClick={() => onRowClick(driver)}>
                  {driver.licenseCategory}
                </td>
                <td className="px-4 py-3 text-sm cursor-pointer" onClick={() => onRowClick(driver)}>
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      (expiry.expired || expiry.warning) ? "text-red-600 font-medium" : "text-foreground"
                    )}
                  >
                    <span>{driver.licenseExpiryDate}</span>
                    {(expiry.expired || expiry.warning) && <AlertTriangle className="h-3.5 w-3.5" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm cursor-pointer" onClick={() => onRowClick(driver)}>
                  {driver.contactNumber}
                </td>
                <td className="px-4 py-3 text-sm cursor-pointer min-w-[140px]" onClick={() => onRowClick(driver)}>
                  <div className="flex items-center gap-2">
                    <Progress value={driver.safetyScore} className="h-2 w-20" />
                    <span className="text-xs font-medium">{driver.safetyScore}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <DriverStatusBadge status={driver.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 transition-all active:scale-95 hover:bg-blue-50"
                    onClick={() => onRowClick(driver)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}