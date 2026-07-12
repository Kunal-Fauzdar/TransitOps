"use client";

import { AlertTriangle, Clock3, Wrench, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  pendingTrips: number;
  inMaintenance: number;
  driversOnDuty: number;
}

export default function NeedsAttention({
  pendingTrips,
  inMaintenance,
  driversOnDuty,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-5 space-y-5">
      <h3 className="font-semibold text-sm">Needs Attention</h3>

      <div className="space-y-3">
        <div className="flex items-start gap-2.5 rounded-lg border p-3 bg-amber-50/60">
          <Clock3 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Pending Trips</p>
            <p className="text-xs text-muted-foreground">
              {pendingTrips} pending dispatch request{pendingTrips !== 1 ? "s" : ""}.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-lg border p-3 bg-red-50/50">
          <Wrench className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Vehicles in Maintenance</p>
            <p className="text-xs text-muted-foreground">
              {inMaintenance} vehicle{inMaintenance !== 1 ? "s are" : " is"} currently in the shop.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-lg border p-3 hover:bg-slate-50 transition-colors">
          <Users className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Drivers On Duty</p>
            <p className="text-xs text-muted-foreground">
              {driversOnDuty} driver{driversOnDuty !== 1 ? "s" : ""} currently available for operations.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-1">
        <Button
          variant="outline"
          className="w-full transition-all active:scale-95 hover:border-blue-400 hover:text-blue-600"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Review Operations
        </Button>
      </div>
    </div>
  );
}