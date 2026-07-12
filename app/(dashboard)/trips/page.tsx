"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TripBoard from "@/components/trips/trip-board";
import NewTripSheet from "@/components/trips/new-trip-sheet";
import CompleteTripModal from "@/components/trips/complete-trip-modal";
import type { Driver, Trip, Vehicle } from "@/lib/types";

interface TripView extends Trip {
  id: string;
  driverName: string;
  vehicleRegNumber: string;
}

const MOCK_VEHICLES: Vehicle[] = [
  {
    regNumber: "VAN-05",
    name: "Ford Transit",
    type: "Cargo Van",
    maxLoadCapacity: 500,
    odometer: 18200,
    acquisitionCost: 32000,
    status: "Available",
    region: "West",
  },
  {
    regNumber: "MH-12-PC-8832",
    name: "Eicher Pro",
    type: "Truck",
    maxLoadCapacity: 1200,
    odometer: 38200,
    acquisitionCost: 54000,
    status: "Available",
    region: "North",
  },
  {
    regNumber: "GJ-05-MM-1209",
    name: "Tata Ace",
    type: "Mini Truck",
    maxLoadCapacity: 850,
    odometer: 22100,
    acquisitionCost: 28000,
    status: "Available",
    region: "Central",
  },
  {
    regNumber: "BUS-4012",
    name: "MAN Lion City",
    type: "Bus",
    maxLoadCapacity: 18000,
    odometer: 51200,
    acquisitionCost: 180000,
    status: "In Shop",
    region: "South",
  },
];

const MOCK_DRIVERS: Driver[] = [
  {
    id: "1",
    name: "Rajesh K",
    licenseNumber: "CDL-A-1042",
    licenseCategory: "CDL-A",
    licenseExpiryDate: "2026-12-20",
    contactNumber: "+91 9988 112233",
    safetyScore: 91,
    status: "Available",
  },
  {
    id: "2",
    name: "Marcus Chen",
    licenseNumber: "CDL-B-9921",
    licenseCategory: "CDL-B",
    licenseExpiryDate: "2026-07-24",
    contactNumber: "+91 8877 445566",
    safetyScore: 88,
    status: "Available",
  },
  {
    id: "3",
    name: "R. Patel",
    licenseNumber: "CDL-A-5511",
    licenseCategory: "CDL-A",
    licenseExpiryDate: "2025-02-14",
    contactNumber: "+91 7766 332211",
    safetyScore: 79,
    status: "Suspended",
  },
];

const MOCK_TRIPS: TripView[] = [
  {
    id: "TRIP-90214",
    source: "Pune",
    destination: "Mumbai",
    cargoWeight: 420,
    plannedDistance: 156,
    status: "Draft",
    createdAt: new Date().toISOString(),
    driverName: "Rajesh K",
    vehicleRegNumber: "MH-12-PC-8832",
  },
  {
    id: "TRIP-55126",
    source: "Delhi",
    destination: "Jaipur",
    cargoWeight: 480,
    plannedDistance: 281,
    status: "Dispatched",
    createdAt: new Date().toISOString(),
    driverName: "Marcus Chen",
    vehicleRegNumber: "VAN-05",
  },
  {
    id: "TRIP-77129",
    source: "Hyderabad",
    destination: "Pune",
    cargoWeight: 300,
    plannedDistance: 560,
    status: "Completed",
    createdAt: new Date().toISOString(),
    driverName: "Rajesh K",
    vehicleRegNumber: "GJ-05-MM-1209",
    actualDistance: 558,
    fuelConsumed: 42,
  },
];

export default function TripsPage() {
  const [trips, setTrips] = useState<TripView[]>(MOCK_TRIPS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [completingTrip, setCompletingTrip] = useState<TripView | null>(null);

  const handleCreateTrip = (trip: TripView) => {
    setTrips((prev) => [trip, ...prev]);
  };

  const handleDispatch = (id: string) => {
    setTrips((prev) =>
      prev.map((trip) =>
        trip.id === id ? { ...trip, status: "Dispatched" } : trip
      )
    );
  };

  const handleCancel = (id: string) => {
    setTrips((prev) =>
      prev.map((trip) =>
        trip.id === id ? { ...trip, status: "Cancelled" } : trip
      )
    );
  };

  const handleComplete = (tripId: string, finalOdometer: number, fuelConsumed: number) => {
    setTrips((prev) =>
      prev.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              status: "Completed",
              actualDistance: trip.plannedDistance,
              fuelConsumed,
            }
          : trip
      )
    );
    setCompletingTrip(null);
  };

  return (
    <div className="p-6 space-y-5 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Trips</h1>
          <p className="text-sm text-muted-foreground">
            Manage trip requests and dispatch workflow
          </p>
        </div>

        <Button
          onClick={() => setSheetOpen(true)}
          className="transition-all active:scale-95 hover:shadow-lg hover:shadow-blue-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      <TripBoard
        trips={trips}
        onDispatch={handleDispatch}
        onComplete={setCompletingTrip}
        onCancel={handleCancel}
      />

      <NewTripSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        vehicles={MOCK_VEHICLES}
        drivers={MOCK_DRIVERS}
        onCreate={handleCreateTrip}
      />

      <CompleteTripModal
        trip={completingTrip}
        onOpenChange={(open) => !open && setCompletingTrip(null)}
        onSubmit={handleComplete}
      />
    </div>
  );
}