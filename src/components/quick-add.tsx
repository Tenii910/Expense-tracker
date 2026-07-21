"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { useAllCategories } from "@/lib/category-store";

export function QuickAdd() {
  const addExpense = useExpenseStore((s) => s.addExpense);
  const addToast = useToastStore((s) => s.addToast);
  const inputRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("");
  const categories = useAllCategories();
  const [category, setCategory] = useState<string>(categories[0]);
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;

    addExpense({
      amount: amt,
      category,
      description: description.trim(),
      date: new Date().toISOString().split("T")[0],
    });

    addToast({
      message: `₦${amt.toLocaleString()} added`,
      type: "success",
    });

    setAmount("");
    setDescription("");
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className="rounded-2xl border border-border bg-surface">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
        >
          <Plus size={16} className="shrink-0" />
          Quick add expense...
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="p-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs text-text-tertiary mb-1">Amount</label>
              <input
                ref={inputRef}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                autoFocus
              />
            </div>
            <div className="w-32">
              <label className="block text-xs text-text-tertiary mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs text-text-tertiary mb-1">Description</label>
              <input
                type="text"
                placeholder="Optional"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-1.5">
              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-border px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
