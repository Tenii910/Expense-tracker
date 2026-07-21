"use client";

import { useState } from "react";
import { Target, Plus, Pencil, Trash2 } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { useBudgetStore } from "@/lib/budget-store";
import { getCategoryColor } from "@/lib/types";
import { useAllCategories, useCategoryStore } from "@/lib/category-store";
import { useFormatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export function Budgets() {
  const expenses = useExpenseStore((s) => s.expenses);
  const { budgets, setBudget, removeBudget } = useBudgetStore();
  const formatCurrency = useFormatCurrency();
  const categories = useAllCategories();
  const customs = useCategoryStore((s) => s.customs);
  const [editing, setEditing] = useState<{ category: string; amount: string } | null>(null);

  function colorFor(cat: string) {
    const custom = customs.find((c) => c.name === cat);
    return custom?.color ?? getCategoryColor(cat);
  }

  const hasBudgets = Object.keys(budgets).length > 0;

  if (!hasBudgets) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Monthly Budgets</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditing({ category: categories[0], amount: "" });
            }}
          >
            <Plus size={14} />
            Set Budget
          </Button>
        </div>
        <p className="text-sm text-text-tertiary">
          Set monthly spending targets to stay on track.
        </p>
      </div>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-text-primary">
            Monthly Budgets
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditing({ category: categories[0], amount: "" })}
        >
          <Plus size={14} />
          Add
        </Button>
      </div>

      <div className="space-y-3">
        {(Object.entries(budgets) as [string, number][])
          .sort(([, a], [, b]) => b - a)
          .map(([category, budget]) => {
            const spent = monthExpenses
              .filter((e) => e.category === category)
              .reduce((sum, e) => sum + e.amount, 0);
            const pct = Math.min((spent / budget) * 100, 100);
            const isOver = spent > budget;

            return (
              <div key={category} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: colorFor(category) }}
                    />
                    <span className="text-sm text-text-primary">{category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isOver ? "text-danger" : "text-text-primary"}`}>
                      {formatCurrency(spent)}
                      <span className="text-text-tertiary font-normal">
                        {" "}/ {formatCurrency(budget)}
                      </span>
                    </span>
                    <button
                      onClick={() =>
                        setEditing({ category, amount: budget.toString() })
                      }
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-text-tertiary hover:text-text-primary transition-all cursor-pointer"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => removeBudget(category)}
                      className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-text-tertiary hover:text-danger transition-all cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-alt overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? "bg-danger" : pct > 80 ? "bg-amber-500" : "bg-accent"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      {editing && (
        <Modal
          open={true}
          onClose={() => setEditing(null)}
          title={budgets[editing.category] ? `Edit ${editing.category} Budget` : `Set ${editing.category} Budget`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const amt = parseFloat(editing.amount);
              if (!isNaN(amt) && amt > 0) {
                setBudget(editing.category, amt);
                setEditing(null);
              }
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Category</label>
              <select
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value })
                }
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Monthly Budget (₦)"
              type="number"
              step="100"
              min="1"
              placeholder="50000"
              value={editing.amount}
              onChange={(e) =>
                setEditing({ ...editing, amount: e.target.value })
              }
            />
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setEditing(null)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save Budget
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
