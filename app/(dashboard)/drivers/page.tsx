"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DriverTable from "@/components/drivers/driver-table";
import DriverDetailPanel from "@/components/drivers/driver-detail-panel";
import AddDriverModal from "@/components/drivers/add-driver-modal";
import ExpiredLicenseBanner from "@/components/drivers/expired-license-banner";
import type { Driver } from "@/lib/types";

const MOCK_DRIVERS: Driver[] = [
  {
    id: "1",
    name: "Marcus Knight",
    licenseNumber: "TX-49201-92",
    licenseCategory: "CDL-A",
    licenseExpiryDate: "2025-10-12",
    contactNumber: "m.knight@transitops.com",
    safetyScore: 82,
    status: "Suspended",
  },
  {
    id: "2",
    name: "Sarah Rivera",
    licenseNumber: "CA-81726-55",
    licenseCategory: "CDL-A",
    licenseExpiryDate: "2026-05-28",
    contactNumber: "s.rivera@transitops.com",
    safetyScore: 94,
    status: "On Trip",
  },
  {
    id: "3",
    name: "Thomas Baker",
    licenseNumber: "NY-11234-00",
    licenseCategory: "CDL-B",
    licenseExpiryDate: "2026-08-15",
    contactNumber: "(555) 012-3456",
    safetyScore: 76,
    status: "Available",
  },
  {
    id: "4",
    name: "Anita Lee",
    licenseNumber: "FL-09823-11",
    licenseCategory: "CDL-A",
    licenseExpiryDate: "2026-12-01",
    contactNumber: "a.lee@transitops.com",
    safetyScore: 88,
    status: "Available",
  },
  {
    id: "5",
    name: "David Thompson",
    licenseNumber: "CDL-3391",
    licenseCategory: "CDL-B",
    licenseExpiryDate: "2025-07-01",
    contactNumber: "+1 (555) 231-9988",
    safetyScore: 82,
    status: "Off Duty",
  },
];

function isExpired(date: string) {
  return new Date(date).getTime() < new Date().getTime();
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Driver | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filteredDrivers = useMemo(() => {
    const q = search.toLowerCase();
    return drivers.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.licenseNumber.toLowerCase().includes(q) ||
        d.contactNumber.toLowerCase().includes(q)
    );
  }, [drivers, search]);

  const expiredCount = drivers.filter((d) => isExpired(d.licenseExpiryDate)).length;

  const handleAddDriver = (driver: Driver) => {
    setDrivers((prev) => [...prev, driver]);
  };

  const handleSaveDriver = (updated: Driver) => {
    setDrivers((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    setSelected(updated);
  };

  return (
    <div className="p-6 space-y-5 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Drivers</h1>
          <p className="text-sm text-muted-foreground">
            Manage driver credentials and safety performance
          </p>
        </div>

        <Button
          onClick={() => setAddOpen(true)}
          className="transition-all active:scale-95 hover:shadow-lg hover:shadow-blue-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </div>

      <ExpiredLicenseBanner count={expiredCount} />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search drivers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1">
          <DriverTable drivers={filteredDrivers} selected={selected} onRowClick={setSelected} />
        </div>

        <DriverDetailPanel
          driver={selected}
          onClose={() => setSelected(null)}
          onSave={handleSaveDriver}
        />
      </div>

      <AddDriverModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddDriver}
      />
    </div>
  );
}