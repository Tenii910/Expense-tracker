"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Hash,
  Sun,
  Moon,
  Cloud,
  Sunrise,
} from "lucide-react";
import type { Expense } from "@/lib/types";
import { getCategoryColor } from "@/lib/types";
import { useCategoryStore } from "@/lib/category-store";
import { useFormatCurrency } from "@/lib/utils";
import { useExpenseStore } from "@/lib/store";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { format, parseISO, getDay, differenceInDays } from "date-fns";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ICONS = [Sun, Moon, Cloud, Sunrise, Sun, Moon, Cloud];

interface StatisticsProps {
  expenses: Expense[];
  viewMode: "month" | "year" | "all" | "week";
  month: string;
}

export function Statistics({ expenses, viewMode, month }: StatisticsProps) {
  const formatCurrency = useFormatCurrency();
  const customs = useCategoryStore((s) => s.customs);
  const allExpenses = useExpenseStore((s) => s.expenses);
  const [open, setOpen] = useState(false);

  function colorFor(cat: string) {
    const custom = customs.find((c) => c.name === cat);
    return custom?.color ?? getCategoryColor(cat);
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const dateBounds = useMemo(() => {
    if (expenses.length === 0) return null;
    const dates = expenses.map((e) => parseISO(e.date));
    return { min: new Date(Math.min(...dates.map((d) => d.getTime()))), max: new Date(Math.max(...dates.map((d) => d.getTime()))) };
  }, [expenses]);

  const dayCount = dateBounds ? differenceInDays(dateBounds.max, dateBounds.min) + 1 : 0;
  const avgDaily = dayCount > 0 ? total / dayCount : 0;

  const dailyTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      map.set(e.date, (map.get(e.date) || 0) + e.amount);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [expenses]);

  const busiestDay = dailyTotals.length > 0
    ? dailyTotals.reduce((a, b) => (a[1] > b[1] ? a : b))
    : null;

  const weekdayTotals = useMemo(() => {
    const sums = [0, 0, 0, 0, 0, 0, 0];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const e of expenses) {
      const day = getDay(parseISO(e.date));
      sums[day] += e.amount;
      counts[day]++;
    }
    return sums.map((total, i) => ({ day: i, name: DAY_NAMES[i], total, count: counts[i] }));
  }, [expenses]);

  const bestWeekday = [...weekdayTotals].sort((a, b) => b.total - a.total)[0];

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const e of expenses) {
      const entry = map.get(e.category) || { total: 0, count: 0 };
      entry.total += e.amount;
      entry.count++;
      map.set(e.category, entry);
    }
    return [...map.entries()]
      .map(([cat, data]) => ({ category: cat, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const previousPeriod = useMemo(() => {
    if (viewMode === "month") {
      const [y, m] = month.split("-").map(Number);
      const prev = new Date(y, m - 2, 1);
      const prevStr = format(prev, "yyyy-MM");
      const prevExpenses = allExpenses.filter((e) => e.date.startsWith(prevStr));
      const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0);
      return { label: format(prev, "MMMM"), total: prevTotal };
    }
    if (viewMode === "year") {
      const year = parseInt(month);
      const prevYear = (year - 1).toString();
      const prevExpenses = allExpenses.filter((e) => e.date.startsWith(prevYear));
      const prevTotal = prevExpenses.reduce((s, e) => s + e.amount, 0);
      return { label: prevYear, total: prevTotal };
    }
    return null;
  }, [viewMode, month, allExpenses]);

  const pctChange = previousPeriod && previousPeriod.total > 0
    ? ((total - previousPeriod.total) / previousPeriod.total) * 100
    : null;

  if (expenses.length === 0) return null;

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <BarChart3 size={16} />
        Stats
      </Button>

      {open && (
        <Modal open={true} onClose={() => setOpen(false)} title="Spending Statistics">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={DollarSign}
                label="Average Daily"
                value={formatCurrency(Math.round(avgDaily))}
                bg="bg-primary/10"
                color="text-primary"
              />
              <StatCard
                icon={Hash}
                label="Transactions"
                value={expenses.length.toString()}
                bg="bg-indigo-500/10"
                color="text-indigo-500"
              />
              <StatCard
                icon={Calendar}
                label="Date Range"
                value={dateBounds ? `${format(dateBounds.min, "MMM d")} - ${format(dateBounds.max, "MMM d")}` : "N/A"}
                bg="bg-amber-500/10"
                color="text-amber-500"
              />
              <StatCard
                icon={TrendingUp}
                label={previousPeriod ? `vs ${previousPeriod.label}` : "Previous"}
                value={
                  pctChange !== null
                    ? `${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(1)}%`
                    : "N/A"
                }
                bg={pctChange !== null && pctChange > 0 ? "bg-danger/10" : "bg-accent/10"}
                color={pctChange !== null && pctChange > 0 ? "text-danger" : "text-accent"}
                sub={previousPeriod ? formatCurrency(previousPeriod.total) : undefined}
              />
            </div>

            {busiestDay && (
              <div className="rounded-xl border border-border bg-surface-alt p-3">
                <p className="text-xs text-text-tertiary mb-1">Busiest Day</p>
                <p className="text-sm font-semibold text-text-primary">
                  {format(parseISO(busiestDay[0]), "MMM d, yyyy")} — {formatCurrency(busiestDay[1])}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-text-tertiary mb-2">Spending by Day of Week</p>
              <div className="space-y-1.5">
                {weekdayTotals.map((d) => {
                  const pct = bestWeekday.total > 0 ? (d.total / bestWeekday.total) * 100 : 0;
                  const DayIcon = DAY_ICONS[d.day];
                  return (
                    <div key={d.day} className="flex items-center gap-2">
                      <DayIcon size={12} className="text-text-tertiary shrink-0" />
                      <span className="w-16 text-xs text-text-secondary">{d.name.slice(0, 3)}</span>
                      <div className="flex-1 h-2 rounded-full bg-surface-alt overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${Math.max(pct, 1)}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-xs text-text-primary font-medium">
                        {formatCurrency(d.total)}
                      </span>
                      <span className="w-8 text-right text-xs text-text-tertiary">
                        {d.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-text-tertiary mb-2">Category Breakdown</p>
              <div className="space-y-1.5">
                {categoryBreakdown.map((cat) => {
                  const pct = total > 0 ? (cat.total / total) * 100 : 0;
                  return (
                    <div key={cat.category} className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: colorFor(cat.category) }}
                      />
                      <span className="flex-1 text-xs text-text-primary truncate">{cat.category}</span>
                      <span className="text-xs text-text-tertiary w-8 text-right">{cat.count}x</span>
                      <span className="w-20 text-right text-xs text-text-primary font-medium">
                        {formatCurrency(cat.total)}
                      </span>
                      <span className="w-10 text-right text-xs text-text-tertiary">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  bg,
  color,
  sub,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  bg: string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
        <Icon size={16} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-tertiary truncate">{label}</p>
        <p className={`text-sm font-semibold truncate ${color}`}>{value}</p>
        {sub !== undefined && (
          <p className="text-xs text-text-tertiary">{sub}</p>
        )}
      </div>
    </div>
  );
}
