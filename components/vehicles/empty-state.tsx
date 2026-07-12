"use client";

import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onAddVehicle: () => void;
}

export default function EmptyState({ onAddVehicle }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border bg-white flex flex-col items-center justify-center py-24 gap-4"
    >
      <div className="bg-slate-100 rounded-full p-4">
        <Truck className="h-8 w-8 text-slate-400" />
      </div>
      <p className="text-muted-foreground text-sm">No vehicles yet</p>
      <Button
        onClick={onAddVehicle}
        className="transition-all active:scale-95 hover:shadow-md"
      >
        Add your first vehicle
      </Button>
    </motion.div>
  );
}