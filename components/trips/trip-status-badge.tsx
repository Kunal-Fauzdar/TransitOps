import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TripStatus } from "@/lib/types";

const styles: Record<TripStatus, string> = {
  Draft: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  Dispatched: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  Completed: "bg-green-100 text-green-700 hover:bg-green-100",
  Cancelled: "bg-red-100 text-red-700 hover:bg-red-100",
};

export default function TripStatusBadge({ status }: { status: TripStatus }) {
  return <Badge className={cn("border-0 font-medium", styles[status])}>{status}</Badge>;
}