"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  MapPin,
  Wrench,
  BarChart3,
  Settings,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicles", label: "Fleet Assets", icon: Truck },
  { href: "/live-map", label: "Live Map", icon: MapPin },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 h-screen border-r bg-white flex flex-col">
      <div className="flex items-center gap-2 px-5 h-16 border-b">
        <div className="bg-blue-600 p-1.5 rounded-md">
          <Truck className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm leading-none">TransitOps</p>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
            FLEET MANAGEMENT
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:translate-x-0.5"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 space-y-0.5">
        <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 w-full transition-colors">
          <LifeBuoy className="h-4 w-4" />
          Support
        </button>
        <div className="flex items-center gap-2 px-3 py-2 mt-2 border-t pt-3">
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
            AR
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Alex Rivera</p>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">
              Fleet Manager
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}