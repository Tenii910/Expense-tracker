"use client";

import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { useExpenseStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import type { Expense } from "@/lib/types";

interface SpendingTrendProps {
  expenses?: Expense[];
}

export function SpendingTrend({ expenses: propExpenses }: SpendingTrendProps) {
  const allExpenses = useExpenseStore((s) => s.expenses);
  const expenses = propExpenses ?? allExpenses;

  const dailyTotals = new Map<string, number>();
  for (const exp of expenses) {
    const key = exp.date;
    dailyTotals.set(key, (dailyTotals.get(key) || 0) + exp.amount);
  }

  const data = Array.from(dailyTotals.entries())
    .map(([date, total]) => ({
      date,
      label: format(parseISO(date), "MMM d"),
      total,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (data.length < 2) return null;

  const maxTotal = Math.max(...data.map((d) => d.total));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-border bg-surface p-6 card-shadow"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="h-0.5 w-4 rounded-full bg-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Spending Trend
          </h3>
          <p className="text-xs text-text-tertiary">
            {data.length} days
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#40196d" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#40196d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e2e8f0", opacity: 0.5 }}
            tickLine={false}
            interval="preserveStartEnd"
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
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: "white",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              fontSize: 13,
              padding: "8px 12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#40196d"
            strokeWidth={2.5}
            fill="url(#trendGradient)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#40196d",
              stroke: "white",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
