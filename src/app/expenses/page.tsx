"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, ChartPie, TrendingUp, Download, ListOrdered } from "lucide-react";
import { TotalDisplay } from "@/components/total-display";
import { ExpenseList } from "@/components/expense-list";
import type { SortKey } from "@/components/expense-list";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseFilters } from "@/components/expense-filters";
import { MonthPicker } from "@/components/month-picker";
import { WeekPicker } from "@/components/week-picker";
import { QuickAdd } from "@/components/quick-add";
import { CategoryChart } from "@/components/charts/category-chart";
import { SpendingTrend } from "@/components/charts/spending-trend";
import { Statistics } from "@/components/statistics";
import { Button } from "@/components/ui/button";
import { useExpenseStore } from "@/lib/store";
import { exportCSV, exportJSON } from "@/lib/export";
import { useAllCategories } from "@/lib/category-store";
import { startOfWeek, endOfWeek, parseISO } from "date-fns";

type ViewMode = "month" | "year" | "all" | "week";

export default function ExpensesPage() {
  const [showForm, setShowForm] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(
    format(new Date(), "yyyy-MM"),
  );
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  const allCategories = useAllCategories();
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

  const hasExpenses = expenses.length > 0;

  function handleCategoryToggle(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat],
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6 sm:px-6">
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <ListOrdered size={20} className="text-primary" />
                Expenses
              </h2>
              <p className="text-sm text-text-tertiary mt-1">
                {expenses.length} total transaction{expenses.length !== 1 ? "s" : ""}
              </p>
            </div>
          </motion.div>

          <TotalDisplay expenses={hasExpenses ? visibleExpenses : undefined} />

          <ExpenseFilters
            search={search}
            onSearchChange={setSearch}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            onToggleAll={() =>
              setSelectedCategories((prev) =>
                prev.length === allCategories.length ? [] : [...allCategories],
              )
            }
          />

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
            <div className="flex items-center gap-2">
              {hasExpenses && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCharts(!showCharts)}
                  >
                    {showCharts ? <TrendingUp size={16} /> : <ChartPie size={16} />}
                    {showCharts ? "List" : "Analytics"}
                  </Button>
                  <Statistics expenses={visibleExpenses} viewMode={viewMode} month={selectedPeriod} />
                  <div className="relative group">
                    <Button variant="secondary" size="sm">
                      <Download size={16} />
                      Export
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-border bg-surface p-1 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30">
                      <button
                        onClick={() => exportCSV(visibleExpenses)}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        Download CSV
                      </button>
                      <button
                        onClick={() => exportJSON(visibleExpenses)}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                      >
                        Download JSON
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus size={16} />
                Add
              </Button>
            </div>
          </div>

          {showCharts && hasExpenses && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-4 overflow-hidden"
            >
              <CategoryChart expenses={visibleExpenses} />
              <SpendingTrend expenses={visibleExpenses} />
            </motion.div>
          )}

          <QuickAdd />

          <ExpenseList
            search={search}
            selectedCategories={selectedCategories}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
      </main>

      <ExpenseForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
