"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, subMonths, parseISO } from "date-fns";
import { useExpenseStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import type { Expense } from "@/lib/types";

interface MonthlyComparisonProps {
  expenses?: Expense[];
}

export function MonthlyComparison({ expenses: propExpenses }: MonthlyComparisonProps) {
  const allExpenses = useExpenseStore((s) => s.expenses);
  const expenses = propExpenses ?? allExpenses;

  const data = useMemo(() => {
    const months: { key: string; label: string; total: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const key = format(date, "yyyy-MM");
      const label = format(date, "MMM");
      const total = expenses
        .filter((e) => e.date.startsWith(key))
        .reduce((s, e) => s + e.amount, 0);
      months.push({ key, label, total });
    }

    return months;
  }, [expenses]);

  const maxTotal = Math.max(...data.map((d) => d.total));
  if (maxTotal === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border bg-surface p-6 card-shadow"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <div className="h-0.5 w-4 rounded-full bg-amber-500" />
          <div className="h-0.5 w-4 rounded-full bg-amber-500 -mt-1" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Monthly Comparison
          </h3>
          <p className="text-xs text-text-tertiary">
            Last 6 months
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="monthlyBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#40196d" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e2e8f0", opacity: 0.5 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₦${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            width={44}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(label) => `Month: ${label}`}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: "white",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              fontSize: 13,
              padding: "8px 12px",
            }}
          />
          <Bar
            dataKey="total"
            fill="url(#monthlyBar)"
            radius={[6, 6, 0, 0]}
            maxBarSize={56}
            animationBegin={400}
            animationDuration={600}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
