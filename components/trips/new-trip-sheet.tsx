"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  MapPinned,
  Route,
  ShieldAlert,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Driver, Trip, Vehicle } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TripView extends Trip {
  id: string;
  driverName: string;
  vehicleRegNumber: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  onCreate: (trip: TripView) => void;
}

function isExpired(date: string) {
  return new Date(date).getTime() < new Date().getTime();
}

function daysUntil(date: string) {
  const today = new Date();
  const target = new Date(date);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function NewTripSheet({
  open,
  onOpenChange,
  vehicles,
  drivers,
  onCreate,
}: Props) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleRegNumber, setVehicleRegNumber] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [plannedDistance, setPlannedDistance] = useState("");

  const availableVehicles = useMemo(
    () =>
      vehicles.filter(
        (v) => v.status === "Available"
      ),
    [vehicles]
  );

  const availableDrivers = useMemo(
    () =>
      drivers.filter(
        (d) => d.status === "Available" && !isExpired(d.licenseExpiryDate)
      ),
    [drivers]
  );

  const selectedVehicle = availableVehicles.find((v) => v.regNumber === vehicleRegNumber);
  const selectedDriver = availableDrivers.find((d) => d.id === driverId);

  const weightNumber = Number(cargoWeight || 0);
  const distanceNumber = Number(plannedDistance || 0);

  const exceedsCapacity =
    !!selectedVehicle && weightNumber > selectedVehicle.maxLoadCapacity;

  const capacityOverBy =
    selectedVehicle && exceedsCapacity
      ? weightNumber - selectedVehicle.maxLoadCapacity
      : 0;

  const driverExpiryDays = selectedDriver ? daysUntil(selectedDriver.licenseExpiryDate) : null;

  const estimatedEta =
    distanceNumber > 0 ? `${Math.max(2, Math.ceil(distanceNumber / 55))} hrs` : "—";

  const fuelEstimate =
    distanceNumber > 0 ? `~${(distanceNumber * 0.18).toFixed(1)} L` : "—";

  const canCreate =
    source.trim() &&
    destination.trim() &&
    selectedVehicle &&
    selectedDriver &&
    cargoWeight &&
    plannedDistance &&
    !exceedsCapacity;

  const reset = () => {
    setSource("");
    setDestination("");
    setVehicleRegNumber("");
    setDriverId("");
    setCargoWeight("");
    setPlannedDistance("");
  };

  const handleCreate = () => {
    if (!canCreate || !selectedVehicle || !selectedDriver) return;

    onCreate({
      id: `TRIP-${Date.now()}`,
      source,
      destination,
      cargoWeight: Number(cargoWeight),
      plannedDistance: Number(plannedDistance),
      status: "Draft",
      createdAt: new Date().toISOString(),
      driverName: selectedDriver.name,
      vehicleRegNumber: selectedVehicle.regNumber,
    });

    reset();
    onOpenChange(false);
  };

  const handleSaveDraft = () => {
    if (!source.trim() || !destination.trim()) return;

    onCreate({
      id: `TRIP-${Date.now()}`,
      source,
      destination,
      cargoWeight: Number(cargoWeight || 0),
      plannedDistance: Number(plannedDistance || 0),
      status: "Draft",
      createdAt: new Date().toISOString(),
      driverName: selectedDriver?.name || "Unassigned",
      vehicleRegNumber: selectedVehicle?.regNumber || "Unassigned",
    });

    reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 overflow-hidden">
        <div className="flex h-full flex-col bg-white">
          <SheetHeader className="border-b px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-xl font-semibold">New trip</SheetTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Create and validate a dispatch-ready trip
                </p>
              </div>

              <button
                onClick={() => onOpenChange(false)}
                className="rounded-md p-2 text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors"
                aria-label="Close"
              >
              </button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <div className="rounded-xl border bg-slate-50 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold">Route Details</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Source</Label>
                  <Input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="San Francisco Depot"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Destination</Label>
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter arrival hub..."
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold">Assignment</h3>
              </div>

              <div className="space-y-1.5">
                <Label>Vehicle</Label>
                <Select value={vehicleRegNumber} onValueChange={(value) => value && setVehicleRegNumber(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.regNumber} value={vehicle.regNumber}>
                        {vehicle.regNumber} ({vehicle.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedVehicle && (
                  <p className="text-xs text-muted-foreground">
                    Max load {selectedVehicle.maxLoadCapacity} kg
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Driver</Label>
                <Select value={driverId} onValueChange={(value) => value && setDriverId(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedDriver && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      driverExpiryDays !== null && driverExpiryDays <= 14
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    )}
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    <span>License expires in {driverExpiryDays} days</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold">Load & Distance</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Cargo Weight (kg)</Label>
                  <Input
                    type="number"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    placeholder="550"
                    className={cn(
                      exceedsCapacity && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {exceedsCapacity && selectedVehicle && (
                    <p className="text-xs text-red-600 flex items-start gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>
                        Exceeds {selectedVehicle.regNumber} capacity by {capacityOverBy} kg
                      </span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>Planned Distance (km)</Label>
                  <Input
                    type="number"
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(e.target.value)}
                    placeholder="124.5"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-blue-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                  Estimated ETA
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{estimatedEta}</p>
              </div>

              <div className="rounded-xl border bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Fuel Estimate
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{fuelEstimate}</p>
              </div>
            </div>

            {exceedsCapacity && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">
                  Cannot create trip while cargo weight exceeds vehicle capacity.
                </p>
              </div>
            )}
          </div>

          <div className="border-t bg-white px-5 py-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 transition-all active:scale-95"
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>
              <Button
                className="flex-1 transition-all active:scale-95 hover:shadow-md"
                onClick={handleCreate}
                disabled={!canCreate}
              >
                Create Trip
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}