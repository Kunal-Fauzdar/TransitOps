"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardFilters() {
  return (
    <div className="flex gap-2">
      <Select defaultValue="all">
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Vehicle type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Vehicle type: All</SelectItem>
          <SelectItem value="bus">Bus</SelectItem>
          <SelectItem value="truck">Truck</SelectItem>
          <SelectItem value="van">Van</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="active">
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Status: Active</SelectItem>
          <SelectItem value="idle">Status: Idle</SelectItem>
          <SelectItem value="shop">Status: In Shop</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="north">
        <SelectTrigger className="w-[150px] h-8 text-xs">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="north">Region: North Metro</SelectItem>
          <SelectItem value="south">Region: South Metro</SelectItem>
          <SelectItem value="east">Region: East Zone</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}