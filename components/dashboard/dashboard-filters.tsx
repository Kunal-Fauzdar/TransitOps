"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardFilters() {
  const [type, setType] = useState("All Types");
  const [status, setStatus] = useState("Active");
  const [region, setRegion] = useState("North Metro");

  return (
    <div className="flex gap-2">
      <Select value={type} onValueChange={(val) => setType(val || "All Types")}>
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue>{type}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All Types">All Types</SelectItem>
          <SelectItem value="Bus">Bus</SelectItem>
          <SelectItem value="Truck">Truck</SelectItem>
          <SelectItem value="Van">Van</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(val) => setStatus(val || "Active")}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue>{status}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Idle">Idle</SelectItem>
          <SelectItem value="In Shop">In Shop</SelectItem>
        </SelectContent>
      </Select>

      <Select value={region} onValueChange={(val) => setRegion(val || "North Metro")}>
        <SelectTrigger className="w-[150px] h-8 text-xs">
          <SelectValue>{region}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="North Metro">North Metro</SelectItem>
          <SelectItem value="South Metro">South Metro</SelectItem>
          <SelectItem value="East Zone">East Zone</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}