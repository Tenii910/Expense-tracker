"use client";

import { useState, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { showBackendError } from "@/lib/backend-errors";
import { useToastStore } from "@/lib/toast-store";
import { ExpenseItem } from "./expense-item";
import { ExpenseForm } from "./expense-form";
import { EmptyState } from "./empty-state";
import { formatDateLabel, useFormatCurrency } from "@/lib/utils";
import type { Expense } from "@/lib/types";

export type SortKey = "newest" | "oldest" | "highest" | "lowest";

interface ExpenseListProps {
  search: string;
  selectedCategories: string[];
  sortBy: SortKey;
  onSortChange: (sort: SortKey) => void;
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "highest", label: "Highest" },
  { value: "lowest", label: "Lowest" },
];

function sortExpenses(expenses: Expense[], sortBy: SortKey): Expense[] {
  const sorted = [...expenses];
  switch (sortBy) {
    case "newest":
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "oldest":
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case "highest":
      sorted.sort((a, b) => b.amount - a.amount);
      break;
    case "lowest":
      sorted.sort((a, b) => a.amount - b.amount);
      break;
  }
  return sorted.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });
}

function groupByDate(expenses: Expense[]): Map<string, Expense[]> {
  const groups = new Map<string, Expense[]>();
  for (const exp of expenses) {
    const key = exp.date;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(exp);
  }
  return groups;
}

export function ExpenseList({ search, selectedCategories, sortBy, onSortChange }: ExpenseListProps) {
  const expenses = useExpenseStore((s) => s.expenses);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const removeExpense = useExpenseStore((s) => s.removeExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const togglePin = useExpenseStore((s) => s.togglePin);
  const addToast = useToastStore((s) => s.addToast);

  const formatCurrency = useFormatCurrency();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showSort, setShowSort] = useState(false);
  const editSnapshot = useRef<Expense | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return expenses.filter((e) => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(e.category)) {
        return false;
      }
      if (q) {
        return e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [expenses, search, selectedCategories]);

  const sorted = useMemo(() => sortExpenses(filtered, sortBy), [filtered, sortBy]);

  async function handleDelete(expense: Expense) {
    try {
      await removeExpense(expense.id);
    } catch (error) {
      showBackendError(error);
      return;
    }
    addToast({
      message: `"${expense.description || expense.category}" deleted`,
      type: "success",
      action: {
        label: "Undo",
        onClick: () => {
          void addExpense({
            amount: expense.amount,
            category: expense.category,
            description: expense.description,
            date: expense.date,
          }).catch(showBackendError);
        },
      },
    });
  }

  async function handleDuplicate(expense: Expense) {
    try {
      await addExpense({
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      showBackendError(error);
      return;
    }
    addToast({
      message: `"${expense.description || expense.category}" duplicated`,
      type: "success",
    });
  }

  if (filtered.length === 0) {
    const activeFilters = search.trim() || selectedCategories.length > 0;
    if (activeFilters) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p className="text-sm text-text-tertiary">No expenses match your filters.</p>
        </motion.div>
      );
    }
    return <EmptyState />;
  }

  const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0);

  const groups = groupByDate(sorted);

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <ArrowUpDown size={12} />
            {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
          </button>
          {showSort && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowSort(false)} />
              <div className="absolute left-0 top-full mt-1 w-32 rounded-xl border border-border bg-surface p-1 shadow-lg z-30">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onSortChange(opt.value);
                      setShowSort(false);
                    }}
                    className={`w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      sortBy === opt.value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-text-primary hover:bg-surface-hover"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <span className="text-xs text-text-tertiary">
          {filtered.length} of {expenses.length} transactions
        </span>
      </div>

      {sortBy !== "newest" && (
        <div className="mb-3 rounded-xl border border-border bg-surface-alt px-4 py-2 text-xs text-text-tertiary">
          Sorted by: {SORT_OPTIONS.find((o) => o.value === sortBy)?.label} — grouped by date
        </div>
      )}

      <AnimatePresence mode="popLayout">
        <div className="space-y-6">
          {[...groups.entries()].map(([date, dayExpenses]) => {
            const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0);
            let globalIdx = 0;

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                    {formatDateLabel(date)}
                  </h3>
                  <span className="text-xs font-medium text-text-tertiary">
                    {formatCurrency(dayTotal)}
                  </span>
                </div>
                <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    {dayExpenses.map((exp) => {
                      const idx = globalIdx++;
                      return (
                        <ExpenseItem
                          key={exp.id}
                          expense={exp}
                          index={idx}
                          onEdit={(e) => setEditingExpense(e)}
                          onDelete={(id) => {
                            const e = dayExpenses.find((x) => x.id === id);
                            if (e) void handleDelete(e);
                          }}
                          onDuplicate={(e) => void handleDuplicate(e)}
                          onTogglePin={(id) => void togglePin(id).catch(showBackendError)}
                        />
                      );
                    })}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
          <div className="text-right text-xs text-text-tertiary pt-1">
            Filtered total: {formatCurrency(filteredTotal)}
          </div>
        </div>
      </AnimatePresence>

      {editingExpense && (
        <ExpenseForm
          editExpense={{
            id: editingExpense.id,
            amount: editingExpense.amount,
            category: editingExpense.category,
            description: editingExpense.description,
            date: editingExpense.date,
          }}
          open={true}
          onClose={() => {
            editSnapshot.current = null;
            setEditingExpense(null);
          }}
          onUpdated={(oldExpense) => {
            addToast({
              message: `"${oldExpense.description || oldExpense.category}" updated`,
              type: "info",
              action: {
                label: "Undo",
                onClick: () => void updateExpense(oldExpense.id, oldExpense).catch(showBackendError),
              },
            });
          }}
        />
      )}
    </>
  );
}
