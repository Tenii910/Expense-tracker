"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus, LayoutDashboard, ArrowRight, Wallet } from "lucide-react";
import { TotalDisplay } from "@/components/total-display";
import { Insights } from "@/components/insights";
import { QuickAdd } from "@/components/quick-add";
import { ExpenseForm } from "@/components/expense-form";
import { Budgets } from "@/components/budgets";
import { Recurring } from "@/components/recurring";
import { Templates } from "@/components/templates";
import { ToastContainer } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useExpenseStore } from "@/lib/store";
import Link from "next/link";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const expenses = useExpenseStore((s) => s.expenses);
  const currentMonth = format(new Date(), "yyyy-MM");

  const monthExpenses = useMemo(
    () => expenses.filter((e) => e.date.startsWith(currentMonth)),
    [expenses, currentMonth],
  );

  const totals = useMemo(() => {
    const total = monthExpenses.reduce((s, e) => s + e.amount, 0);
    const count = monthExpenses.length;
    return { total, count };
  }, [monthExpenses]);

  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6 sm:px-6">
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <LayoutDashboard size={20} className="text-primary" />
              Dashboard
            </h2>
            <p className="text-sm text-text-tertiary mt-1">
              {format(new Date(), "MMMM yyyy")} overview
            </p>
          </motion.div>

          <TotalDisplay expenses={monthExpenses} />

          <QuickAdd />

          {expenses.length > 0 && (
            <Insights expenses={monthExpenses} month={currentMonth} />
          )}

          <Recurring />

          <Budgets />

          <Templates />

          {expenses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-surface p-5 card-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Wallet size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {totals.count} expense{totals.count !== 1 ? "s" : ""} this month
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      Total: {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(totals.total)}
                    </p>
                  </div>
                </div>
                <Link
                  href="/expenses"
                  className="group rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-all inline-flex items-center gap-1.5"
                >
                  View All
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          )}

          {expenses.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-border bg-surface p-12 text-center"
            >
              <div className="absolute inset-0 bg-grid opacity-50" />
              <div className="relative">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
                  <Wallet size={28} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Welcome to Expense Tracker
                </h3>
                <p className="text-sm text-text-tertiary max-w-sm mx-auto mb-6">
                  Start tracking your spending today. Add your first expense to see insights, budgets, and more.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus size={16} />
                  Add Your First Expense
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <ExpenseForm open={showForm} onClose={() => setShowForm(false)} />
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
}
