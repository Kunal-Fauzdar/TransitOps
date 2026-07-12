"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import VehicleStatusBadge from "./vehicle-status-badge";
import { Eye, Pencil } from "lucide-react";
import type { Vehicle } from "@/lib/types";

interface Props {
  vehicles: Vehicle[];
  onRowClick: (vehicle: Vehicle) => void;
}

export default function VehicleTable({ vehicles, onRowClick }: Props) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reg. Number</TableHead>
            <TableHead>Name/Model</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Region</TableHead>
            <TableHead className="text-right">Max Load (kg)</TableHead>
            <TableHead className="text-right">Odometer</TableHead>
            <TableHead className="text-right">Acquisition Cost</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow
              key={vehicle.regNumber}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(vehicle)}
            >
              <TableCell className="font-medium">{vehicle.regNumber}</TableCell>
              <TableCell>{vehicle.name}</TableCell>
              <TableCell>{vehicle.type}</TableCell>
              <TableCell>{vehicle.region}</TableCell>
              <TableCell className="text-right">{vehicle.maxLoadCapacity.toLocaleString()}</TableCell>
              <TableCell className="text-right">{vehicle.odometer.toLocaleString()} km</TableCell>
              <TableCell className="text-right">${vehicle.acquisitionCost.toLocaleString()}</TableCell>
              <TableCell>
                <VehicleStatusBadge status={vehicle.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRowClick(vehicle)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRowClick(vehicle)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {vehicles.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No vehicles found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}