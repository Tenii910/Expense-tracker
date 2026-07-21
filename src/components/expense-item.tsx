"use client";

import { motion } from "framer-motion";
import { Pencil, Trash2, Copy, Star } from "lucide-react";
import type { Expense } from "@/lib/types";
import { useFormatCurrency } from "@/lib/utils";
import { useCategoryColor } from "@/lib/category-store";

interface ExpenseItemProps {
  expense: Expense;
  index: number;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onDuplicate: (expense: Expense) => void;
  onTogglePin: (id: string) => void;
}

export function ExpenseItem({ expense, index, onEdit, onDelete, onDuplicate, onTogglePin }: ExpenseItemProps) {
  const formatCurrency = useFormatCurrency();
  const color = useCategoryColor(expense.category);
  const isPinned = expense.pinned ?? false;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, overflow: "hidden" }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className={`group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-surface-hover overflow-hidden ${isPinned ? "bg-amber-500/5" : ""}`}
    >
      <button
        onClick={() => onTogglePin(expense.id)}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
          isPinned
            ? "text-amber-400 bg-amber-500/15"
            : "text-white opacity-50 group-hover:opacity-100"
        }`}
        style={{ backgroundColor: isPinned ? undefined : color }}
        aria-label={isPinned ? "Unpin expense" : "Pin expense"}
      >
        <Star size={14} fill={isPinned ? "currentColor" : "none"} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {expense.description || expense.category}
        </p>
        <p className="text-xs text-text-tertiary">{expense.category}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-danger">
          -{formatCurrency(expense.amount)}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDuplicate(expense)}
          className="rounded-lg p-1.5 text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors cursor-pointer"
          aria-label="Duplicate expense"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => onEdit(expense)}
          className="rounded-lg p-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
          aria-label="Edit expense"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(expense.id)}
          className="rounded-lg p-1.5 text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
          aria-label="Delete expense"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
