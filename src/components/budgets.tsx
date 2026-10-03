"use client";

import { useState } from "react";
import { Target, Plus, Pencil, Trash2 } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { useBudgetStore } from "@/lib/budget-store";
import { useToastStore } from "@/lib/toast-store";
import { getCategoryColor } from "@/lib/types";
import { useAllCategories, useCategoryStore } from "@/lib/category-store";
import { useFormatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { showBackendError } from "@/lib/backend-errors";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export function Budgets() {
  const expenses = useExpenseStore((s) => s.expenses);
  const { budgets, setBudget, removeBudget } = useBudgetStore();
  const formatCurrency = useFormatCurrency();
  const categories = useAllCategories();
  const customs = useCategoryStore((s) => s.customs);
  const addToast = useToastStore((s) => s.addToast);
  const [editing, setEditing] = useState<{ category: string; amount: string } | null>(null);

  function colorFor(cat: string) {
    const custom = customs.find((c) => c.name === cat);
    return custom?.color ?? getCategoryColor(cat);
  }

  const hasBudgets = Object.keys(budgets).length > 0;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));

  const handleOpenAdd = () => {
    const unbudgeted = categories.find((c) => budgets[c] === undefined);
    const initialCategory = unbudgeted || categories[0] || "";
    const initialAmount = budgets[initialCategory] !== undefined ? budgets[initialCategory]!.toString() : "";
    setEditing({ category: initialCategory, amount: initialAmount });
  };

  const handleCategoryChange = (newCat: string) => {
    const existingAmount = budgets[newCat];
    setEditing({
      category: newCat,
      amount: existingAmount !== undefined ? existingAmount.toString() : editing?.amount || "",
    });
  };

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
          onClick={handleOpenAdd}
        >
          <Plus size={14} />
          {hasBudgets ? "Add" : "Set Budget"}
        </Button>
      </div>

      {!hasBudgets ? (
        <p className="text-sm text-text-tertiary">
          Set monthly spending targets to stay on track.
        </p>
      ) : (
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
                        title="Edit budget"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => {
                          void removeBudget(category).then(() => {
                            addToast({ message: `Removed budget for ${category}`, type: "info" });
                          }).catch(showBackendError);
                        }}
                        className="opacity-0 group-hover:opacity-100 rounded-lg p-1 text-text-tertiary hover:text-danger transition-all cursor-pointer"
                        title="Remove budget"
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
      )}

      {editing && (
        <Modal
          open={true}
          onClose={() => setEditing(null)}
          title={budgets[editing.category] ? `Edit ${editing.category} Budget` : `Set ${editing.category} Budget`}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const amt = parseFloat(editing.amount);
              if (!isNaN(amt) && amt > 0) {
                try {
                  await setBudget(editing.category, amt);
                  addToast({
                    message: `Budget for ${editing.category} set to ${formatCurrency(amt)}`,
                    type: "success",
                  });
                  setEditing(null);
                } catch (error) {
                  showBackendError(error);
                }
              }
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Category</label>
              <select
                value={editing.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c} {budgets[c] !== undefined ? `(Current: ${formatCurrency(budgets[c]!)})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Monthly Budget (₦)"
              type="number"
              step="any"
              min="0.01"
              placeholder="50000"
              value={editing.amount}
              onChange={(e) =>
                setEditing({ ...editing, amount: e.target.value })
              }
              autoFocus
              required
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
