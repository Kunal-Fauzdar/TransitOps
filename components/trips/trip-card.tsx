"use client";

import { motion } from "framer-motion";
import { MapPin, Truck, User, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TripStatusBadge from "./trip-status-badge";
import type { Trip, Driver, Vehicle } from "@/lib/types";

interface TripView extends Trip {
  id: string;
  driverName: string;
  vehicleRegNumber: string;
}

interface Props {
  trip: TripView;
  onDispatch: (id: string) => void;
  onComplete: (trip: TripView) => void;
  onCancel: (id: string) => void;
}

export default function TripCard({ trip, onDispatch, onComplete, onCancel }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">
            {trip.source} <span className="text-muted-foreground">→</span> {trip.destination}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">ID: {trip.id}</p>
        </div>
        <TripStatusBadge status={trip.status} />
      </div>

      <div className="mt-3 space-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5" />
          <span>{trip.driverName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5" />
          <span>{trip.vehicleRegNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <Weight className="h-3.5 w-3.5" />
          <span>{trip.cargoWeight} kg</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {trip.status === "Draft" && (
          <Button
            onClick={() => onDispatch(trip.id)}
            className="w-full transition-all active:scale-95 hover:shadow-md"
          >
            Dispatch
          </Button>
        )}

        {trip.status === "Dispatched" && (
          <>
            <Button
              onClick={() => onComplete(trip)}
              className="flex-1 transition-all active:scale-95 hover:shadow-md"
            >
              Complete
            </Button>
            <Button
              variant="outline"
              onClick={() => onCancel(trip.id)}
              className="flex-1 transition-all active:scale-95"
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}