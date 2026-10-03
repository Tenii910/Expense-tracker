"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Activity, ArrowDownLeft, ArrowRight, ArrowUpRight, BellRing, Bookmark,
  CalendarDays, CirclePlus, Clock3, CreditCard, FileClock, Plus, ReceiptText,
  Sparkles, Target, Wallet,
} from "lucide-react";
import { ExpenseForm } from "@/components/expense-form";
import { CategoryChart } from "@/components/charts/category-chart";
import { Insights } from "@/components/insights";
import { useExpenseStore } from "@/lib/store";
import { useBudgetStore } from "@/lib/budget-store";
import { useRecurringStore } from "@/lib/recurring-store";
import { useTemplateStore } from "@/lib/template-store";
import { useAuthStore } from "@/lib/auth-store";
import { useFormatCurrency } from "@/lib/utils";
import { useToastStore } from "@/lib/toast-store";
import { showBackendError } from "@/lib/backend-errors";
import type { Expense } from "@/lib/types";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.075 } } };
const rise = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } } };

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const expenses = useExpenseStore((state) => state.expenses);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const currentUser = useAuthStore((state) => state.currentUser);
  const budgets = useBudgetStore().budgets;
  const recurring = useRecurringStore((state) => state.templates);
  const templates = useTemplateStore((state) => state.templates);
  const addToast = useToastStore((state) => state.addToast);
  const formatCurrency = useFormatCurrency();
  const month = format(new Date(), "yyyy-MM");
  const monthExpenses = useMemo(() => expenses.filter((expense) => expense.date.startsWith(month)), [expenses, month]);
  const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const previousMonth = format(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), "yyyy-MM");
  const previousTotal = expenses.filter((expense) => expense.date.startsWith(previousMonth)).reduce((sum, expense) => sum + expense.amount, 0);
  const change = previousTotal > 0 ? ((monthTotal - previousTotal) / previousTotal) * 100 : null;
  const activeRecurring = recurring.filter((item) => item.active).length;
  const recentExpenses = useMemo(() => [...expenses].sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`)).slice(0, 6), [expenses]);

  async function duplicateExpense(expense: Expense) {
    try {
      await addExpense({
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: format(new Date(), "yyyy-MM-dd"),
      });
      addToast({ message: "Expense added", type: "success" });
    } catch (error) {
      showBackendError(error);
    }
  }

  const overviewStats = [
    { label: "Spent this month", value: formatCurrency(monthTotal), icon: Wallet, tone: "bg-white/10 text-white", note: change === null ? "Your monthly spending" : `${Math.abs(change).toFixed(0)}% ${change > 0 ? "above" : "below"} last month`, trend: change === null ? "neutral" : change > 0 ? "up" : "down" },
    { label: "Transactions", value: monthExpenses.length.toLocaleString(), icon: ReceiptText, tone: "bg-primary/10 text-primary", note: `${expenses.length} all-time records` },
    { label: "Budget plans", value: Object.keys(budgets).length.toString(), icon: Target, tone: "bg-primary/10 text-primary-light", note: "Monthly category limits" },
    { label: "On schedule", value: activeRecurring.toString(), icon: BellRing, tone: "bg-accent/10 text-accent", note: `${templates.length} saved templates` },
  ];

  return (
    <div className="min-h-screen bg-surface-alt">
      <main className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-6 sm:px-6 lg:px-10 lg:pt-10">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-7">
          <motion.header variants={rise} className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary"><Sparkles size={14} /> Your financial cockpit</p>
              <h1 className="text-3xl font-black tracking-tight text-text-primary sm:text-4xl">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {currentUser?.name.split(" ")[0] ?? "there"}.</h1>
              <p className="mt-2 text-sm text-text-tertiary">Here is the shape of your money this {format(new Date(), "MMMM")}.</p>
            </div>
            <button onClick={() => setShowForm(true)} className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-light">
              <CirclePlus size={18} /> Add expense <ArrowRight size={15} className="transition group-hover:translate-x-1" />
            </button>
          </motion.header>

          <motion.section variants={rise} className="relative isolate overflow-hidden rounded-[2rem] bg-primary-dark p-6 text-white shadow-2xl shadow-primary/15 sm:p-9">
            <div className="absolute -right-12 -top-32 -z-10 h-96 w-96 rounded-full border border-white/10 bg-primary-light/20 blur-[1px]" />
            <div className="absolute right-28 top-14 -z-10 h-36 w-36 rounded-full bg-primary-light/30 blur-3xl animate-pulse" />
            <div className="absolute bottom-[-7rem] right-[35%] -z-10 h-60 w-60 rounded-full bg-emerald-400/15 blur-3xl" />
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <div className="mb-7 flex items-center gap-2 text-xs font-semibold text-accent-light"><CalendarDays size={15} /> {format(new Date(), "EEEE, MMMM d, yyyy")}</div>
                <p className="text-sm font-medium text-white/75">Total outflow this month</p>
                <motion.p key={monthTotal} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-4xl font-black tracking-tight sm:text-6xl">{formatCurrency(monthTotal)}</motion.p>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-bold ${change !== null && change > 0 ? "bg-rose-400/15 text-rose-200" : "bg-emerald-300/15 text-emerald-200"}`}>
                    {change !== null && change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                    {change === null ? "Month to date" : `${Math.abs(change).toFixed(1)}% ${change > 0 ? "more" : "less"} than last month`}
                  </span>
                  <span className="text-white/65">Based on {monthExpenses.length} transactions</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "All-time spending", value: formatCurrency(expenses.reduce((sum, item) => sum + item.amount, 0)), icon: CreditCard },
                  { label: "Average per entry", value: formatCurrency(expenses.length ? expenses.reduce((sum, item) => sum + item.amount, 0) / expenses.length : 0), icon: Activity },
                  { label: "Recurring active", value: activeRecurring.toString(), icon: FileClock },
                  { label: "Saved templates", value: templates.length.toString(), icon: Bookmark },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + index * 0.08 }} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md">
                    <Icon size={16} className="mb-3 text-accent-light" />
                    <p className="text-xl font-extrabold tracking-tight sm:text-2xl">{item.value}</p>
                    <p className="mt-1 text-[11px] text-white/65">{item.label}</p>
                  </motion.div>;
                })}
              </div>
            </div>
          </motion.section>

          <motion.section variants={rise} className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {overviewStats.map((stat, index) => {
              const Icon = stat.icon;
              return <motion.div key={stat.label} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }} className={`rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5 ${index === 0 ? "border-primary/15" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div><p className="text-xs font-semibold text-text-tertiary">{stat.label}</p><p className="mt-2 text-2xl font-black tracking-tight text-text-primary">{stat.value}</p></div>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}><Icon size={18} /></span>
                </div>
                <p className="mt-3 truncate text-[11px] text-text-tertiary">{stat.note}</p>
              </motion.div>;
            })}
          </motion.section>

          {monthExpenses.length > 0 && <motion.div variants={rise}><Insights expenses={monthExpenses} month={month} /></motion.div>}

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
            <motion.div variants={rise} className="min-w-0 space-y-5">
              <div className="flex items-end justify-between gap-3">
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-text-tertiary">Your activity</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-text-primary">Recent transactions</h2></div>
                <Link href="/expenses" className="inline-flex items-center gap-1 text-xs font-bold text-primary transition hover:gap-2">All transactions <ArrowRight size={14} /></Link>
              </div>
              <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                {recentExpenses.length > 0 ? recentExpenses.map((expense, index) => <motion.div key={expense.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + index * 0.05 }} className="flex items-center gap-3 border-b border-border/70 px-4 py-3.5 last:border-0 sm:px-5">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${index % 2 === 0 ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}><ReceiptText size={17} /></span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-text-primary">{expense.description || expense.category}</span><span className="mt-0.5 block text-xs text-text-tertiary">{expense.category} · {format(new Date(`${expense.date}T00:00:00`), "MMM d")}</span></span>
                  <span className="text-right"><span className="block text-sm font-extrabold text-text-primary">−{formatCurrency(expense.amount)}</span><span className="text-[10px] text-text-tertiary">{expense.pinned ? "Pinned" : "Expense"}</span></span>
                  <button aria-label="Add this expense again" title="Repeat expense" onClick={() => void duplicateExpense(expense)} className="rounded-lg p-2 text-text-tertiary transition hover:bg-primary/10 hover:text-primary"><Plus size={16} /></button>
                </motion.div>) : <div className="px-6 py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Wallet size={22} /></span><p className="mt-4 font-bold text-text-primary">Your story starts here</p><p className="mt-1 text-sm text-text-tertiary">Add a first transaction to see your activity take shape.</p><button onClick={() => setShowForm(true)} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white">Add your first expense</button></div>}
              </div>
            </motion.div>

            <motion.div variants={rise} className="space-y-5">
              <div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-text-tertiary">Breakdown</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-text-primary">Where it goes</h2></div><Link href="/analytics" aria-label="Open analytics" className="rounded-xl border border-border bg-surface p-2 text-text-secondary transition hover:text-primary"><ArrowRight size={16} /></Link></div>
              <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
                {monthExpenses.length > 0 ? <CategoryChart expenses={monthExpenses} /> : <div className="flex min-h-52 flex-col items-center justify-center text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Target size={22} /></span><p className="mt-3 text-sm font-bold text-text-primary">No categories yet</p><p className="mt-1 text-xs text-text-tertiary">Your category breakdown will appear here.</p></div>}
              </div>
            </motion.div>
          </section>

          <motion.section variants={rise} className="grid gap-4 sm:grid-cols-3">
            {[
              { href: "/budgets", title: "Budget planner", subtitle: `${Object.keys(budgets).length} categories protected`, icon: Target, color: "text-primary bg-primary/10" },
              { href: "/recurring", title: "Recurring costs", subtitle: `${activeRecurring} active schedules`, icon: Clock3, color: "text-accent bg-accent/10" },
              { href: "/templates", title: "Quick templates", subtitle: `${templates.length} ready to use`, icon: Bookmark, color: "text-primary-light bg-primary/10" },
            ].map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:-translate-y-1 hover:shadow-lg"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}><Icon size={19} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-text-primary">{item.title}</span><span className="mt-0.5 block truncate text-xs text-text-tertiary">{item.subtitle}</span></span><ArrowRight size={16} className="text-text-tertiary transition group-hover:translate-x-1 group-hover:text-primary" /></Link>; })}
          </motion.section>
        </motion.div>
      </main>
      <ExpenseForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
