"use client";

import TripColumn from "./trip-column";
import type { Trip, TripStatus } from "@/lib/types";

interface TripView extends Trip {
  id: string;
  driverName: string;
  vehicleRegNumber: string;
}

interface Props {
  trips: TripView[];
  onDispatch: (id: string) => void;
  onComplete: (trip: TripView) => void;
  onCancel: (id: string) => void;
}

const columns: TripStatus[] = ["Draft", "Dispatched", "Completed", "Cancelled"];

export default function TripBoard({ trips, onDispatch, onComplete, onCancel }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {columns.map((status) => (
        <TripColumn
          key={status}
          title={status}
          trips={trips.filter((trip) => trip.status === status)}
          onDispatch={onDispatch}
          onComplete={onComplete}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}