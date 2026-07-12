import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DriverStatus } from "@/lib/types";

const styles: Record<DriverStatus, string> = {
  Available: "bg-green-100 text-green-700 hover:bg-green-100",
  "On Trip": "bg-blue-100 text-blue-700 hover:bg-blue-100",
  "Off Duty": "bg-slate-100 text-slate-600 hover:bg-slate-100",
  Suspended: "bg-red-100 text-red-700 hover:bg-red-100",
};

export default function DriverStatusBadge({ status }: { status: DriverStatus }) {
  return <Badge className={cn("border-0 font-medium", styles[status])}>{status}</Badge>;
}