"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type VehicleType = "All" | "Truck" | "Van" | "Bus" | "EV Truck";

interface Props {
  dateRange: string;
  setDateRange: (value: string) => void;
  vehicleType: VehicleType;
  setVehicleType: (value: VehicleType) => void;
}

export default function ReportsFilterBar({
  dateRange,
  setDateRange,
  vehicleType,
  setVehicleType,
}: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Select value={dateRange} onValueChange={setDateRange}>
        <SelectTrigger className="w-[220px] bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Oct 01, 2023 - Oct 31, 2023">Oct 01, 2023 - Oct 31, 2023</SelectItem>
          <SelectItem value="Sep 01, 2023 - Sep 30, 2023">Sep 01, 2023 - Sep 30, 2023</SelectItem>
          <SelectItem value="Last 90 days">Last 90 days</SelectItem>
        </SelectContent>
      </Select>

      <Select value={vehicleType} onValueChange={(value) => setVehicleType(value as VehicleType)}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Vehicles</SelectItem>
          <SelectItem value="Truck">Truck</SelectItem>
          <SelectItem value="Van">Van</SelectItem>
          <SelectItem value="Bus">Bus</SelectItem>
          <SelectItem value="EV Truck">EV Truck</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}