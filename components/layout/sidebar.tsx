"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["FleetManager", "Driver", "SafetyOfficer", "FinancialAnalyst"] },
  { href: "/vehicles", label: "Vehicle Registry", icon: Truck, roles: ["FleetManager", "Driver"] },
  { href: "/drivers", label: "Drivers & Safety", icon: Users, roles: ["FleetManager", "SafetyOfficer"] },
  { href: "/trips", label: "Trip Dispatcher", icon: Route, roles: ["FleetManager", "Driver"] },
  { href: "/maintenance", label: "Maintenance", icon: Wrench, roles: ["FleetManager"] },
  { href: "/reports", label: "Reports & Analytics", icon: BarChart3, roles: ["FleetManager", "FinancialAnalyst"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const visibleItems = navItems.filter((item) => !role || item.roles.includes(role));

  return (
    <aside className="w-64 h-screen border-r bg-slate-950 text-slate-100 flex flex-col">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-800">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Truck className="h-5 w-5 text-white" />
        </div>
        <span className="font-semibold text-lg">TransitOps</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-400">
        Logged in as <span className="font-medium text-slate-200">{role || "Guest"}</span>
      </div>
    </aside>
  );
}