"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";
import { Insights } from "@/components/insights";
import { TotalDisplay } from "@/components/total-display";
import { CategoryChart } from "@/components/charts/category-chart";
import { SpendingTrend } from "@/components/charts/spending-trend";
import { MonthlyComparison } from "@/components/charts/monthly-comparison";
import { Statistics } from "@/components/statistics";
import { MonthPicker } from "@/components/month-picker";
import { WeekPicker } from "@/components/week-picker";
import { useExpenseStore } from "@/lib/store";
import { startOfWeek, endOfWeek, parseISO } from "date-fns";

type ViewMode = "month" | "year" | "all" | "week";

const CHART_TABS = [
  { id: "all", label: "All Charts", icon: BarChart3 },
  { id: "breakdown", label: "Breakdown", icon: PieChart },
  { id: "trends", label: "Trends", icon: TrendingUp },
] as const;

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(
    format(new Date(), "yyyy-MM"),
  );
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [chartTab, setChartTab] = useState<string>("all");

  const expenses = useExpenseStore((s) => s.expenses);

  const visibleExpenses = useMemo(() => {
    if (viewMode === "month") {
      return expenses.filter((e) => e.date.startsWith(selectedPeriod));
    }
    if (viewMode === "year") {
      return expenses.filter((e) => e.date.startsWith(selectedPeriod.slice(0, 4)));
    }
    if (viewMode === "week") {
      const start = startOfWeek(parseISO(selectedPeriod), { weekStartsOn: 1 });
      const end = endOfWeek(start, { weekStartsOn: 1 });
      return expenses.filter((e) => {
        const d = parseISO(e.date);
        return d >= start && d <= end;
      });
    }
    return expenses;
  }, [expenses, selectedPeriod, viewMode]);

  const hasExpenses = visibleExpenses.length > 0;
  const allExpenses = expenses.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6 sm:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                Analytics
              </h2>
              <p className="text-sm text-text-tertiary mt-1">
                Visualize your spending patterns
              </p>
            </div>
          </div>

          <TotalDisplay expenses={hasExpenses ? visibleExpenses : undefined} />

          <Insights expenses={visibleExpenses} month={selectedPeriod} viewMode={viewMode} />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-border overflow-hidden">
                {(["week", "month", "year", "all"] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      if (mode === "week") {
                        setSelectedPeriod(format(new Date(), "yyyy-MM-dd"));
                      } else if (mode === "month" || mode === "year") {
                        setSelectedPeriod(format(new Date(), "yyyy-MM"));
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      viewMode === mode
                        ? "bg-primary text-white"
                        : "text-text-tertiary hover:text-text-primary hover:bg-surface-hover"
                    }`}
                  >
                    {mode === "week" ? "Week" : mode === "month" ? "Month" : mode === "year" ? "Year" : "All"}
                  </button>
                ))}
              </div>
              {(viewMode === "month" || viewMode === "year") && (
                <MonthPicker value={selectedPeriod} onChange={setSelectedPeriod} />
              )}
              {viewMode === "week" && (
                <WeekPicker value={selectedPeriod} onChange={setSelectedPeriod} />
              )}
            </div>
            <Statistics expenses={visibleExpenses} viewMode={viewMode} month={selectedPeriod} />
          </div>

          {hasExpenses && (
            <>
              <div className="flex gap-1 rounded-xl border border-border p-0.5 bg-surface w-fit">
                {CHART_TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setChartTab(tab.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                        chartTab === tab.id
                          ? "bg-primary text-white shadow-sm"
                          : "text-text-tertiary hover:text-text-primary"
                      }`}
                    >
                      <Icon size={13} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <motion.div
                layout
                className="flex flex-col gap-4"
              >
                {(chartTab === "all" || chartTab === "breakdown") && (
                  <CategoryChart expenses={visibleExpenses} />
                )}
                {(chartTab === "all" || chartTab === "trends") && (
                  <SpendingTrend expenses={visibleExpenses} />
                )}
                {(chartTab === "all" || chartTab === "trends") && allExpenses && (
                  <MonthlyComparison expenses={expenses} />
                )}
              </motion.div>
            </>
          )}

          {!hasExpenses && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-border bg-surface p-12 text-center"
            >
              <div className="absolute inset-0 bg-grid opacity-50" />
              <div className="relative">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
                  <BarChart3 size={28} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No data to analyze
                </h3>
                <p className="text-sm text-text-tertiary max-w-sm mx-auto">
                  Add some expenses to unlock beautiful charts and insights about your spending.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
