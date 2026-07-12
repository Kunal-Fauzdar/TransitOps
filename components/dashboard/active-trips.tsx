"use client";

import { motion } from "framer-motion";

interface Props {
  tripCount: number;
  loading?: boolean;
}

export default function ActiveTrips({ tripCount, loading = false }: Props) {
  return (
    <div className="rounded-xl border bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h3 className="font-semibold text-sm">Active Trips</h3>
        <button className="text-xs text-blue-600 font-medium hover:underline transition-colors">
          View All
        </button>
      </div>

      <div className="px-5 py-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-dashed border-slate-200 p-6 text-center"
        >
          <p className="text-sm font-medium text-slate-700">
            {loading ? "Loading trips..." : tripCount === 0 ? "No active trips" : `${tripCount} trip${tripCount !== 1 ? "s" : ""} in progress`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Live trip table can be connected once trip dispatch endpoints are integrated.
          </p>
        </motion.div>
      </div>
    </div>
  );
}