"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export default function ExpiredLicenseBanner({ count }: { count: number }) {
  const [open, setOpen] = useState(true);

  if (!open || count === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start justify-between">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-medium">{count} drivers</span> have expired licenses and cannot be dispatched.
        </p>
      </div>
      <button
        onClick={() => setOpen(false)}
        className="text-amber-700 hover:text-amber-900 transition-colors"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}