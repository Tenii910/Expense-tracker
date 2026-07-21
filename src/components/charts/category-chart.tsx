"use client";

import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useExpenseStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import type { Expense } from "@/lib/types";
import { getCategoryColor } from "@/lib/types";
import { useAllCategories, useCategoryStore } from "@/lib/category-store";

interface CategoryChartProps {
  expenses?: Expense[];
}

export function CategoryChart({ expenses: propExpenses }: CategoryChartProps) {
  const allExpenses = useExpenseStore((s) => s.expenses);
  const expenses = propExpenses ?? allExpenses;
  const categories = useAllCategories();
  const customs = useCategoryStore((s) => s.customs);

  const totals = categories
    .map((cat) => {
      const custom = customs.find((c) => c.name === cat);
      const color = custom?.color ?? getCategoryColor(cat);
      return {
        name: cat,
        value: expenses
          .filter((e) => e.category === cat)
          .reduce((sum, e) => sum + e.amount, 0),
        color,
      };
    })
    .filter((c) => c.value > 0);

  const grandTotal = totals.reduce((s, c) => s + c.value, 0);

  if (totals.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-surface p-6 card-shadow"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="h-3 w-3 rounded-full bg-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Spending by Category
          </h3>
          <p className="text-xs text-text-tertiary">
            {totals.length} categories
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="shrink-0">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={totals}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                animationBegin={200}
                animationDuration={800}
              >
                {totals.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  fontSize: 13,
                  padding: "8px 12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2.5 self-stretch">
          {totals.map((cat) => {
            const pct =
              grandTotal > 0 ? ((cat.value / grandTotal) * 100).toFixed(1) : 0;
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-surface-hover"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-3 w-3 rounded-full shrink-0 ring-2 ring-white/50"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm text-text-primary truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-right shrink-0">
                  <span className="text-xs text-text-tertiary w-10 tabular-nums">
                    {pct}%
                  </span>
                  <span className="text-sm font-semibold text-text-primary w-28 tabular-nums">
                    {formatCurrency(cat.value)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
