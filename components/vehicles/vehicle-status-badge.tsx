import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VehicleStatus } from "@/lib/types";

const statusStyles: Record<VehicleStatus, string> = {
  Available: "bg-green-100 text-green-700 hover:bg-green-100",
  "On Trip": "bg-blue-100 text-blue-700 hover:bg-blue-100",
  "In Shop": "bg-amber-100 text-amber-700 hover:bg-amber-100",
  Retired: "bg-gray-100 text-gray-600 hover:bg-gray-100",
};

export default function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <Badge className={cn("border-0 font-medium", statusStyles[status])}>
      {status}
    </Badge>
  );
}