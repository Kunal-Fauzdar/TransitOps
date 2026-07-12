"use client";

import { motion } from "framer-motion";
import TripCard from "./trip-card";
import type { TripStatus, Trip } from "@/lib/types";

interface TripView extends Trip {
  id: string;
  driverName: string;
  vehicleRegNumber: string;
}

interface Props {
  title: TripStatus;
  trips: TripView[];
  onDispatch: (id: string) => void;
  onComplete: (trip: TripView) => void;
  onCancel: (id: string) => void;
}

export default function TripColumn({
  title,
  trips,
  onDispatch,
  onComplete,
  onCancel,
}: Props) {
  return (
    <div className="min-w-[300px] lg:min-w-0 rounded-xl border bg-slate-50/80 p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground">{trips.length}</span>
      </div>

      <motion.div layout className="space-y-3 min-h-[200px]">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onDispatch={onDispatch}
            onComplete={onComplete}
            onCancel={onCancel}
          />
        ))}

        {trips.length === 0 && (
          <div className="rounded-lg border border-dashed bg-white/70 p-4 text-center text-xs text-muted-foreground">
            No trips
          </div>
        )}
      </motion.div>
    </div>
  );
}