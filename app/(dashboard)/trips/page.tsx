"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TripBoard from "@/components/trips/trip-board";
import NewTripSheet from "@/components/trips/new-trip-sheet";
import CompleteTripModal from "@/components/trips/complete-trip-modal";
import type { Driver, Trip, Vehicle } from "@/lib/types";

interface TripView extends Trip {
  id: string;
  driverName: string;
  vehicleRegNumber: string;
  driverId?: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<TripView[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [completingTrip, setCompletingTrip] = useState<TripView | null>(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        fetch("/api/trips"),
        fetch("/api/vehicles"),
        fetch("/api/drivers"),
      ]);

      if (!tripsRes.ok || !vehiclesRes.ok || !driversRes.ok) {
        throw new Error("Failed to fetch operational data");
      }

      const tripsData = await tripsRes.json();
      const vehiclesData = await vehiclesRes.json();
      const driversData = await driversRes.json();

      // Map vehicleReg from API to vehicleRegNumber for client compatibility
      const mappedTrips = tripsData.map((t: any) => ({
        ...t,
        vehicleRegNumber: t.vehicleReg || t.vehicleRegNumber || "Unassigned",
      }));

      setTrips(mappedTrips);
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (err: any) {
      setError(err.message || "An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTrip = async (tripInput: any) => {
    setError("");
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: tripInput.source,
          destination: tripInput.destination,
          vehicleId: tripInput.vehicleRegNumber,
          driverId: tripInput.driverId,
          cargoWeight: tripInput.cargoWeight,
          plannedDistance: tripInput.plannedDistance,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create trip");
        return;
      }

      fetchData();
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleDispatch = async (id: string) => {
    setError("");
    try {
      const res = await fetch(`/api/trips/${id}/dispatch`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to dispatch trip");
        return;
      }

      fetchData();
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleCancel = async (id: string) => {
    setError("");
    try {
      const res = await fetch(`/api/trips/${id}/cancel`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to cancel trip");
        return;
      }

      fetchData();
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleComplete = async (tripId: string, finalOdometer: number, fuelConsumed: number) => {
    setError("");
    try {
      const res = await fetch(`/api/trips/${tripId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finalOdometer,
          fuelConsumed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to complete trip");
        return;
      }

      setCompletingTrip(null);
      fetchData();
    } catch {
      setError("Network error. Please try again.");
    }
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
          disabled={loading}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading trips data...</p>
        </div>
      ) : (
        <TripBoard
          trips={trips}
          onDispatch={handleDispatch}
          onComplete={setCompletingTrip}
          onCancel={handleCancel}
        />
      )}

      <NewTripSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        vehicles={vehicles}
        drivers={drivers}
        onCreate={handleCreateTrip}
      />

      <CompleteTripModal
        key={completingTrip?.id || "complete-modal"}
        trip={completingTrip}
        onOpenChange={(open) => !open && setCompletingTrip(null)}
        onSubmit={handleComplete}
      />
    </div>
  );
}