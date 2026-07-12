"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Trip } from "@/lib/types";

interface TripView extends Trip {
  id: string;
  driverName: string;
  vehicleRegNumber: string;
}

interface Props {
  trip: TripView | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (tripId: string, finalOdometer: number, fuelConsumed: number) => void;
}

export default function CompleteTripModal({ trip, onOpenChange, onSubmit }: Props) {
  const [finalOdometer, setFinalOdometer] = useState("");
  const [fuelConsumed, setFuelConsumed] = useState("");

  if (!trip) return null;

  const handleSubmit = () => {
    onSubmit(trip.id, Number(finalOdometer), Number(fuelConsumed));
    setFinalOdometer("");
    setFuelConsumed("");
  };

  return (
    <Dialog open={!!trip} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Complete Trip</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-sm text-muted-foreground">
            {trip.source} → {trip.destination}
          </div>

          <div className="space-y-1.5">
            <Label>Final Odometer</Label>
            <Input
              type="number"
              value={finalOdometer}
              onChange={(e) => setFinalOdometer(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Fuel Consumed</Label>
            <Input
              type="number"
              value={fuelConsumed}
              onChange={(e) => setFuelConsumed(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 transition-all active:scale-95"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 transition-all active:scale-95 hover:shadow-md"
              onClick={handleSubmit}
            >
              Complete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}