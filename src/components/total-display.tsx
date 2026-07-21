"use client";

import { motion } from "framer-motion";
import { TrendingDown, Receipt, CalendarDays } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { useFormatCurrency } from "@/lib/utils";
import type { Expense } from "@/lib/types";

interface TotalDisplayProps {
  expenses?: Expense[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.08 },
  }),
};

export function TotalDisplay({ expenses: propExpenses }: TotalDisplayProps) {
  const formatCurrency = useFormatCurrency();
  const allExpenses = useExpenseStore((s) => s.expenses);
  const expenses = propExpenses ?? allExpenses;

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const count = expenses.length;

  const uniqueDays = new Set(expenses.map((e) => e.date)).size;
  const avgPerDay = uniqueDays > 0 ? total / uniqueDays : 0;

  const cards = [
    {
      icon: TrendingDown,
      iconBg: "bg-danger/10",
      iconColor: "text-danger",
      label: "Total Spent",
      value: formatCurrency(total),
    },
    {
      icon: Receipt,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      label: "Transactions",
      value: count.toString(),
    },
    {
      icon: CalendarDays,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      label: "Avg / Day",
      value: formatCurrency(avgPerDay),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
            >
              <Icon size={20} className={card.iconColor} />
            </div>
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {card.value}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
