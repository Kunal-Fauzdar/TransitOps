"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Plus, Search } from "lucide-react";
import VehicleTable from "@/components/vehicles/vehicle-table";
import VehicleDetailPanel from "@/components/vehicles/vehicle-detail-panel";
import AddVehicleModal from "@/components/vehicles/add-vehicle-modal";
import EmptyState from "@/components/vehicles/empty-state";
import type { Vehicle } from "@/lib/types";

const MOCK_VEHICLES: Vehicle[] = [
  { regNumber: "BUS-2042", name: "Mercedes-Benz Citaro G Articulated", type: "Articulated Bus", maxLoadCapacity: 28000, odometer: 45230, acquisitionCost: 220000, status: "Available", region: "City Loop B" },
  { regNumber: "TRK-8812", name: "Scania R500", type: "Heavy Truck", maxLoadCapacity: 40000, odometer: 62110, acquisitionCost: 130000, status: "On Trip", region: "North-South Express" },
  { regNumber: "VAN-3011", name: "Ford Transit", type: "Cargo Van", maxLoadCapacity: 3500, odometer: 38900, acquisitionCost: 32000, status: "Available", region: "Airport Shuttle" },
  { regNumber: "BUS-4012", name: "MAN Lion City", type: "Bus", maxLoadCapacity: 18000, odometer: 51200, acquisitionCost: 180000, status: "In Shop", region: "North-South Route" },
  { regNumber: "TRK-9901", name: "Volvo FH16", type: "Heavy Truck", maxLoadCapacity: 44000, odometer: 71000, acquisitionCost: 145000, status: "Retired", region: "Unassigned" },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = vehicles.filter(
    (v) => v.regNumber.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (v: Vehicle) => setVehicles((prev) => [...prev, v]);
  const handleSave = (updated: Vehicle) => {
    setVehicles((prev) => prev.map((v) => (v.regNumber === updated.regNumber ? updated : v)));
    setSelected(updated);
  };

  return (
    <div className="p-6 space-y-5 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vehicles</h1>
          <p className="text-sm text-muted-foreground">{vehicles.length} vehicles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="transition-all active:scale-95">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button
            onClick={() => setAddOpen(true)}
            className="transition-all active:scale-95 hover:shadow-lg hover:shadow-blue-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search vehicles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {vehicles.length === 0 ? (
        <EmptyState onAddVehicle={() => setAddOpen(true)} />
      ) : (
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <VehicleTable vehicles={filtered} onRowClick={setSelected} />
          </div>
          <VehicleDetailPanel
            key={selected?.regNumber ?? "vehicle-panel-closed"}
            vehicle={selected}
            onClose={() => setSelected(null)}
            onSave={handleSave}
          />
        </div>
      )}

      <AddVehicleModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
        existingRegNumbers={vehicles.map((v) => v.regNumber)}
      />
    </div>
  );
}