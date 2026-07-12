"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from "recharts";
import { 
  Download, 
  Loader2, 
  FileSpreadsheet, 
  FileText, 
  Fuel, 
  Percent, 
  DollarSign, 
  TrendingUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Interface definitions matching backend DTO schemas
interface FuelEfficiencyItem {
  regNumber: string;
  name: string;
  totalDistance: number;
  totalFuel: number;
  efficiency: number;
}

interface UtilizationItem {
  type: string;
  totalType: number;
  activeType: number;
  utilizationPct: number;
}

interface OperationalCostItem {
  regNumber: string;
  name: string;
  fuelCost: number;
  maintenanceCost: number;
  otherExpenses: number;
  totalCost: number;
}

interface RoiItem {
  regNumber: string;
  name: string;
  acquisitionCost: number;
  revenue: number;
  totalCost: number;
  roi: number;
}

export default function ReportsPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [fuelEfficiency, setFuelEfficiency] = useState<FuelEfficiencyItem[]>([]);
  const [utilization, setUtilization] = useState<UtilizationItem[]>([]);
  const [operationalCost, setOperationalCost] = useState<OperationalCostItem[]>([]);
  const [roi, setRoi] = useState<RoiItem[]>([]);

  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");
  const [selectedReportType, setSelectedReportType] = useState("fuel-efficiency");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReportData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [vehRes, feRes, utRes, ocRes, roiRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/reports/fuel-efficiency"),
        fetch("/api/reports/utilization"),
        fetch("/api/reports/operational-cost"),
        fetch("/api/reports/roi"),
      ]);

      if (!vehRes.ok || !feRes.ok || !utRes.ok || !ocRes.ok || !roiRes.ok) {
        throw new Error("Failed to load one or more reports. Please verify database connection.");
      }

      const vehData = await vehRes.json();
      const feData = await feRes.json();
      const utData = await utRes.json();
      const ocData = await ocRes.json();
      const roiData = await roiRes.json();

      setVehicles(vehData);
      setFuelEfficiency(feData);
      setUtilization(utData);
      setOperationalCost(ocData);
      setRoi(roiData);
    } catch (err: any) {
      setError(err.message || "An error occurred while loading reports data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const handleExport = (type: string, format: "csv" | "pdf") => {
    const url = `/api/reports/export.${format}?type=${type}`;
    window.open(url, "_blank");
  };

  // Dynamic filter logic based on selected vehicle type
  const filteredFuelEfficiency = useMemo(() => {
    if (vehicleTypeFilter === "all") return fuelEfficiency;
    return fuelEfficiency.filter(item => {
      const v = vehicles.find(veh => veh.regNumber === item.regNumber);
      return v?.type?.toLowerCase() === vehicleTypeFilter.toLowerCase();
    });
  }, [fuelEfficiency, vehicleTypeFilter, vehicles]);

  const filteredUtilization = useMemo(() => {
    if (vehicleTypeFilter === "all") return utilization;
    return utilization.filter(item => item.type.toLowerCase() === vehicleTypeFilter.toLowerCase());
  }, [utilization, vehicleTypeFilter]);

  const filteredOperationalCost = useMemo(() => {
    if (vehicleTypeFilter === "all") return operationalCost;
    return operationalCost.filter(item => {
      const v = vehicles.find(veh => veh.regNumber === item.regNumber);
      return v?.type?.toLowerCase() === vehicleTypeFilter.toLowerCase();
    });
  }, [operationalCost, vehicleTypeFilter, vehicles]);

  const filteredRoi = useMemo(() => {
    if (vehicleTypeFilter === "all") return roi;
    return roi.filter(item => {
      const v = vehicles.find(veh => veh.regNumber === item.regNumber);
      return v?.type?.toLowerCase() === vehicleTypeFilter.toLowerCase();
    });
  }, [roi, vehicleTypeFilter, vehicles]);

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Monitor real-time fleet metrics, asset utilization, operational cost breakdown, and ROI
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadReportData}
          disabled={loading}
          className="self-start md:self-auto transition-transform active:scale-95"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <TrendingUp className="h-4 w-4 mr-2" />
          )}
          Refresh Analytics
        </Button>
      </div>

      {/* Top Filter & Export Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Type</span>
            <select 
              value={vehicleTypeFilter} 
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-slate-50 text-slate-700 outline-none w-40 h-8 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <option value="all">All Vehicles</option>
              <option value="Bus">Bus</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Export Report Target</span>
            <select 
              value={selectedReportType} 
              onChange={(e) => setSelectedReportType(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-slate-50 text-slate-700 outline-none w-48 h-8 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <option value="fuel-efficiency">Fuel Efficiency</option>
              <option value="utilization">Fleet Utilization</option>
              <option value="operational-cost">Operational Cost</option>
              <option value="roi">Vehicle ROI</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExport(selectedReportType, "csv")}
            className="h-8 text-xs border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport(selectedReportType, "pdf")}
            className="h-8 text-xs border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-colors font-medium"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5 text-rose-600" />
            Export PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {loading && fuelEfficiency.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-sm text-muted-foreground">Compiling reports metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          
          {/* Card 1: Fuel Efficiency */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-blue-600" />
                  Fuel Efficiency
                </CardTitle>
                <CardDescription>Average distance traveled per liter of fuel consumed</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  title="Export CSV" 
                  onClick={() => handleExport("fuel-efficiency", "csv")}
                  className="h-8 w-8"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  title="Export PDF" 
                  onClick={() => handleExport("fuel-efficiency", "pdf")}
                  className="h-8 w-8"
                >
                  <FileText className="h-4 w-4 text-rose-600" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredFuelEfficiency.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No completed trip data to compute efficiency for this type.</p>
              ) : (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={filteredFuelEfficiency}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="regNumber" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: "km/L", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#64748b" } }} />
                      <Tooltip formatter={(value) => [`${value} km/L`, "Efficiency"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Bar dataKey="efficiency" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {filteredFuelEfficiency.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.efficiency > 4 ? "#10b981" : "#3b82f6"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="text-xs">Vehicle</TableHead>
                          <TableHead className="text-xs text-right">Distance (km)</TableHead>
                          <TableHead className="text-xs text-right">Fuel (L)</TableHead>
                          <TableHead className="text-xs text-right">Avg. Efficiency</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFuelEfficiency.slice(0, 4).map((item) => (
                          <TableRow key={item.regNumber}>
                            <TableCell className="text-xs font-medium">{item.regNumber} ({item.name})</TableCell>
                            <TableCell className="text-xs text-right">{item.totalDistance.toLocaleString()} km</TableCell>
                            <TableCell className="text-xs text-right">{item.totalFuel.toLocaleString()} L</TableCell>
                            <TableCell className="text-xs text-right font-semibold text-slate-800">{item.efficiency.toFixed(2)} km/L</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Fleet Utilization */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Percent className="h-4 w-4 text-blue-600" />
                  Fleet Utilization
                </CardTitle>
                <CardDescription>Active vs Total vehicles in fleet by vehicle type</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  title="Export CSV" 
                  onClick={() => handleExport("utilization", "csv")}
                  className="h-8 w-8"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  title="Export PDF" 
                  onClick={() => handleExport("utilization", "pdf")}
                  className="h-8 w-8"
                >
                  <FileText className="h-4 w-4 text-rose-600" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredUtilization.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No active fleet vehicles registered for this type.</p>
              ) : (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart layout="vertical" data={filteredUtilization}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
                      <Tooltip formatter={(value) => [`${value}%`, "Utilization"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Bar dataKey="utilizationPct" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20}>
                        {filteredUtilization.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.utilizationPct > 60 ? "#4f46e5" : "#818cf8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="text-xs">Vehicle Type</TableHead>
                          <TableHead className="text-xs text-right">Active Vehicles</TableHead>
                          <TableHead className="text-xs text-right">Total Fleet</TableHead>
                          <TableHead className="text-xs text-right">Utilization %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUtilization.map((item) => (
                          <TableRow key={item.type}>
                            <TableCell className="text-xs font-medium">{item.type}</TableCell>
                            <TableCell className="text-xs text-right">{item.activeType}</TableCell>
                            <TableCell className="text-xs text-right">{item.totalType}</TableCell>
                            <TableCell className="text-xs text-right">
                              <Badge className="border-0 bg-indigo-50 text-indigo-700 hover:bg-indigo-50 font-semibold">
                                {item.utilizationPct.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Operational Cost breakdown */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  Operational Cost
                </CardTitle>
                <CardDescription>Breakdown of Fuel, Maintenance, and Toll/Other costs per asset</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  title="Export CSV" 
                  onClick={() => handleExport("operational-cost", "csv")}
                  className="h-8 w-8"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  title="Export PDF" 
                  onClick={() => handleExport("operational-cost", "pdf")}
                  className="h-8 w-8"
                >
                  <FileText className="h-4 w-4 text-rose-600" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredOperationalCost.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No operational cost entries logged for this type.</p>
              ) : (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={filteredOperationalCost.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="regNumber" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value) => [`$${value}`, "Cost"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="fuelCost" name="Fuel" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="maintenanceCost" name="Maintenance" stackId="a" fill="#eab308" />
                      <Bar dataKey="otherExpenses" name="Tolls & Other" stackId="a" fill="#94a3b8" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="text-xs">Vehicle</TableHead>
                          <TableHead className="text-xs text-right">Fuel</TableHead>
                          <TableHead className="text-xs text-right">Maintenance</TableHead>
                          <TableHead className="text-xs text-right">Other</TableHead>
                          <TableHead className="text-xs text-right">Total Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOperationalCost.slice(0, 4).map((item) => (
                          <TableRow key={item.regNumber}>
                            <TableCell className="text-xs font-medium">{item.regNumber} ({item.name})</TableCell>
                            <TableCell className="text-xs text-right">${item.fuelCost.toLocaleString()}</TableCell>
                            <TableCell className="text-xs text-right">${item.maintenanceCost.toLocaleString()}</TableCell>
                            <TableCell className="text-xs text-right">${item.otherExpenses.toLocaleString()}</TableCell>
                            <TableCell className="text-xs text-right font-semibold text-slate-900">${item.totalCost.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 4: Vehicle ROI Heatmap */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Vehicle ROI
                </CardTitle>
                <CardDescription>Rate of return: (Revenue - Total Cost) / Acquisition Cost</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  title="Export CSV" 
                  onClick={() => handleExport("roi", "csv")}
                  className="h-8 w-8"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  title="Export PDF" 
                  onClick={() => handleExport("roi", "pdf")}
                  className="h-8 w-8"
                >
                  <FileText className="h-4 w-4 text-rose-600" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredRoi.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No financial acquisitions or trip logs found to calculate ROI for this type.</p>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="text-xs">Vehicle</TableHead>
                          <TableHead className="text-xs text-right">Acquisition</TableHead>
                          <TableHead className="text-xs text-right">Revenue</TableHead>
                          <TableHead className="text-xs text-right">Costs</TableHead>
                          <TableHead className="text-xs text-right">ROI (%)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRoi.map((item) => {
                          const isPositive = item.roi >= 0;
                          return (
                            <TableRow key={item.regNumber}>
                              <TableCell className="text-xs font-semibold">{item.regNumber} ({item.name})</TableCell>
                              <TableCell className="text-xs text-right">${item.acquisitionCost.toLocaleString()}</TableCell>
                              <TableCell className="text-xs text-right">${item.revenue.toLocaleString()}</TableCell>
                              <TableCell className="text-xs text-right">${item.totalCost.toLocaleString()}</TableCell>
                              <TableCell className="text-xs text-right">
                                <span 
                                  className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                                    isPositive 
                                      ? "bg-green-50 text-green-700 border border-green-200" 
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}
                                >
                                  {isPositive ? "+" : ""}{item.roi.toFixed(1)}%
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1">
                    <p className="font-semibold">💡 ROI Calculation Rule:</p>
                    <p>Revenues are estimated based on completed trips at a flat standard rate of **$15 per kilometer** traveled.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
