"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Plus, Search } from "lucide-react";
import VehicleTable from "@/components/vehicles/vehicle-table";
import VehicleDetailPanel from "@/components/vehicles/vehicle-detail-panel";
import AddVehicleModal from "@/components/vehicles/add-vehicle-modal";
import EmptyState from "@/components/vehicles/empty-state";
import type { Vehicle } from "@/lib/types";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/vehicles")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setVehicles(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = vehicles.filter(
    (v) =>
      v.regNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase()) ||
      v.region.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (v: Vehicle) => {
    setVehicles((prev) => [...prev, v]);
  };

  const handleSave = (updated: Vehicle) => {
    setVehicles((prev) =>
      prev.map((v) => (v.regNumber === updated.regNumber ? updated : v))
    );
    setSelected(updated);
  };

  const handleExport = () => {
    const headers = [
      "Reg Number",
      "Name",
      "Type",
      "Status",
      "Region",
      "Max Load (t)",
      "Odometer (km)",
      "Acquisition Cost",
    ];
    const rows = filtered.map((v) => [
      v.regNumber,
      v.name,
      v.type,
      v.status,
      v.region,
      v.maxLoadCapacity,
      v.odometer,
      v.acquisitionCost,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vehicles-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-5 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vehicles</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${vehicles.length} vehicles`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="transition-all active:scale-95"
            onClick={handleExport}
          >
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
        <Input
          placeholder="Search vehicles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {!loading && vehicles.length === 0 ? (
        <EmptyState onAddVehicle={() => setAddOpen(true)} />
      ) : (
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <VehicleTable
              vehicles={filtered}
              isLoading={loading}
              onRowClick={setSelected}
            />
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
        onCreated={(v) => {
          handleAdd(v);
          setAddOpen(false);
        }}
      />
    </div>
  );
}
