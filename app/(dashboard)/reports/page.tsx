"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportsFilterBar from "@/components/reports/reports-filter-bar";
import FuelEfficiencyCard from "@/components/reports/fuel-efficiency-card";
import FleetUtilizationCard from "@/components/reports/fleet-utilization-card";
import OperationalCostCard from "@/components/reports/operational-cost-card";
import VehicleRoiCard from "@/components/reports/vehicle-roi-card";

type VehicleType = "All" | "Truck" | "Van" | "Bus" | "EV Truck";

interface ReportVehicle {
  regNumber: string;
  name: string;
  type: VehicleType;
  distance: number;
  fuel: number;
  utilizationPct: number;
  fuelCost: number;
  maintenanceCost: number;
  revenue: number;
  acquisitionCost: number;
}

const REPORT_DATA: ReportVehicle[] = [
  {
    regNumber: "TX-4592-L",
    name: "Freightliner M2",
    type: "Truck",
    distance: 6840,
    fuel: 482,
    utilizationPct: 88,
    fuelCost: 2840,
    maintenanceCost: 1240,
    revenue: 35600,
    acquisitionCost: 120000,
  },
  {
    regNumber: "IL-7723-K",
    name: "Peterbilt 579",
    type: "Truck",
    distance: 6210,
    fuel: 455,
    utilizationPct: 82,
    fuelCost: 2115,
    maintenanceCost: 980,
    revenue: 32800,
    acquisitionCost: 138000,
  },
  {
    regNumber: "NY-8821-B",
    name: "Ford Transit",
    type: "Van",
    distance: 3080,
    fuel: 217,
    utilizationPct: 74,
    fuelCost: 1432,
    maintenanceCost: 410,
    revenue: 18600,
    acquisitionCost: 52000,
  },
  {
    regNumber: "CA-1104-Z",
    name: "Tesla Semi",
    type: "EV Truck",
    distance: 7120,
    fuel: 390,
    utilizationPct: 91,
    fuelCost: 980,
    maintenanceCost: 220,
    revenue: 41800,
    acquisitionCost: 180000,
  },
  {
    regNumber: "BUS-4012",
    name: "MAN Lion City",
    type: "Bus",
    distance: 4980,
    fuel: 560,
    utilizationPct: 67,
    fuelCost: 1640,
    maintenanceCost: 1320,
    revenue: 22400,
    acquisitionCost: 180000,
  },
];

export default function ReportsPage() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("All");
  const [dateRange, setDateRange] = useState("Oct 01, 2023 - Oct 31, 2023");

  const filteredData = useMemo(() => {
    if (vehicleType === "All") return REPORT_DATA;
    return REPORT_DATA.filter((v) => v.type === vehicleType);
  }, [vehicleType]);

  const utilizationByType = useMemo(() => {
    const grouped = new Map<string, { total: number; count: number }>();

    filteredData.forEach((item) => {
      const current = grouped.get(item.type) || { total: 0, count: 0 };
      grouped.set(item.type, {
        total: current.total + item.utilizationPct,
        count: current.count + 1,
      });
    });

    return Array.from(grouped.entries()).map(([type, value]) => ({
      type,
      utilizationPct: Number((value.total / value.count).toFixed(1)),
    }));
  }, [filteredData]);

  const operationalCost = filteredData.map((item) => ({
    vehicle: item.regNumber,
    fuel: item.fuelCost,
    maintenance: item.maintenanceCost,
  }));

  const fuelEfficiency = filteredData.map((item) => ({
    vehicle: item.regNumber,
    efficiency: Number((item.distance / item.fuel).toFixed(1)),
  }));

  const roiData = filteredData.map((item) => ({
    vehicle: `${item.regNumber} (${item.name})`,
    roi: Number(
      (((item.revenue - (item.maintenanceCost + item.fuelCost)) / item.acquisitionCost) * 100).toFixed(1)
    ),
  }));

  const handleExportCsv = () => {
    const headers = [
      "Vehicle",
      "Type",
      "Distance",
      "Fuel",
      "Utilization %",
      "Fuel Cost",
      "Maintenance Cost",
      "Revenue",
      "Acquisition Cost",
    ];

    const rows = filteredData.map((item) => [
      item.regNumber,
      item.type,
      item.distance,
      item.fuel,
      item.utilizationPct,
      item.fuelCost,
      item.maintenanceCost,
      item.revenue,
      item.acquisitionCost,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reports-analytics.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Analyze fuel efficiency, utilization, operating cost, and vehicle ROI
          </p>
        </div>

        <Button
          onClick={handleExportCsv}
          className="transition-all active:scale-95 hover:shadow-lg hover:shadow-blue-200"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <ReportsFilterBar
        dateRange={dateRange}
        setDateRange={setDateRange}
        vehicleType={vehicleType}
        setVehicleType={setVehicleType}
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <FuelEfficiencyCard data={fuelEfficiency} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <FleetUtilizationCard data={utilizationByType} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <OperationalCostCard data={operationalCost} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <VehicleRoiCard data={roiData} />
        </motion.div>
      </div>
    </div>
  );
}