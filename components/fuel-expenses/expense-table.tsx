"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { OtherExpense } from "@/app/(dashboard)/fuel-expenses/page";

const toneMap: Record<OtherExpense["expenseType"], string> = {
  Toll: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  Maintenance: "bg-red-100 text-red-700 hover:bg-red-100",
  Other: "bg-slate-100 text-slate-700 hover:bg-slate-100",
};

export default function ExpenseTable({ expenses }: { expenses: OtherExpense[] }) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b text-xs text-muted-foreground">
            <th className="text-left font-medium px-4 py-3">Date</th>
            <th className="text-left font-medium px-4 py-3">Vehicle</th>
            <th className="text-left font-medium px-4 py-3">Expense Type</th>
            <th className="text-left font-medium px-4 py-3">Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, i) => (
            <motion.tr
              key={expense.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="border-b last:border-0 hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-3 text-sm">{expense.date}</td>
              <td className="px-4 py-3 text-sm font-medium">{expense.vehicle}</td>
              <td className="px-4 py-3">
                <Badge className={`border-0 ${toneMap[expense.expenseType]}`}>
                  {expense.expenseType}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm">${expense.amount.toFixed(2)}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      <div className="px-4 py-3 border-t text-xs text-muted-foreground">
        Showing {expenses.length} of {expenses.length} expenses
      </div>
    </div>
  );
}