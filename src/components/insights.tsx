"use client";

import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, ArrowUpRight, Zap } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Expense } from "@/lib/types";
import { getCategoryColor } from "@/lib/types";
import { useAllCategories, useCategoryStore } from "@/lib/category-store";
import { useFormatCurrency } from "@/lib/utils";

interface InsightsProps {
  expenses: Expense[];
  month: string;
  viewMode?: "month" | "year" | "all" | "week";
}

const insetVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.08 },
  }),
};

export function Insights({ expenses, month, viewMode = "month" }: InsightsProps) {
  const formatCurrency = useFormatCurrency();
  const categories = useAllCategories();
  const customs = useCategoryStore((s) => s.customs);

  if (expenses.length === 0) return null;

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const categoryTotals = categories.map((cat) => ({
    name: cat,
    total: expenses
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.amount, 0),
  })).sort((a, b) => b.total - a.total);

  const top = categoryTotals[0];
  const topPct = total > 0 ? ((top.total / total) * 100).toFixed(0) : "0";

  const highest = [...expenses].sort((a, b) => b.amount - a.amount)[0];

  function colorFor(cat: string) {
    const custom = customs.find((c) => c.name === cat);
    return custom?.color ?? getCategoryColor(cat);
  }

  const heading =
    viewMode === "all"
      ? "All-Time Insights"
      : viewMode === "year"
        ? `${month.slice(0, 4)} Insights`
        : viewMode === "week"
          ? "This Week Insights"
          : `${format(parseISO(month + "-01"), "MMMM")} Insights`;

  const insightItems: {
    icon: typeof Lightbulb;
    bg: string;
    color: string;
    label: string;
    value: string;
  }[] = [
    {
      icon: TrendingUp,
      bg: "bg-primary/10",
      color: "text-primary",
      label: "Total Spent",
      value: formatCurrency(total),
    },
    {
      icon: ArrowUpRight,
      bg: `${colorFor(top.name)}20`,
      color: colorFor(top.name),
      label: "Top Category",
      value: `${top.name} (${topPct}%)`,
    },
    {
      icon: Zap,
      bg: "bg-amber-500/10",
      color: "text-amber-500",
      label: "Highest",
      value: `${formatCurrency(highest.amount)} ${highest.description || highest.category}`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-surface p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={16} className="text-amber-500" />
        <h3 className="text-sm font-semibold text-text-primary">
          {heading}
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {insightItems.map((item, i: number) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={insetVariants}
              className="flex items-center gap-3 rounded-xl bg-surface-alt p-3"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg}`}>
                <Icon size={16} className={item.color} />
              </div>
              <div>
                <p className="text-xs text-text-tertiary">{item.label}</p>
                <p className="text-sm font-semibold text-text-primary truncate max-w-[120px] sm:max-w-none">
                  {item.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
