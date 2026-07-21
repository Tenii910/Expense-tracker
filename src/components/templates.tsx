"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Bookmark, X, Sparkles, Bolt, Clock } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { useTemplateStore, type ExpenseTemplate } from "@/lib/template-store";
import { useAllCategories, useCategoryStore } from "@/lib/category-store";
import { getCategoryColor } from "@/lib/types";
import { useFormatCurrency } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
} as const;

export function Templates() {
  const templates = useTemplateStore((s) => s.templates);
  const addTemplate = useTemplateStore((s) => s.addTemplate);
  const removeTemplate = useTemplateStore((s) => s.removeTemplate);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const addToast = useToastStore((s) => s.addToast);
  const customs = useCategoryStore((s) => s.customs);
  const categories = useAllCategories();
  const formatCurrency = useFormatCurrency();
  const [open, setOpen] = useState(false);

  function colorFor(cat: string) {
    const custom = customs.find((c) => c.name === cat);
    return custom?.color ?? getCategoryColor(cat);
  }

  function handleUse(t: ExpenseTemplate) {
    addExpense({
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: new Date().toISOString().split("T")[0],
    });
    addToast({
      message: `${formatCurrency(t.amount)} ${t.description || t.category} added`,
      type: "success",
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Bookmark size={20} className="text-primary" />
            Templates
          </h2>
          <p className="text-sm text-text-tertiary mt-1">
            Save and reuse your frequent expenses
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={14} />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-surface p-10 text-center"
        >
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="relative">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10">
              <Sparkles size={28} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No templates yet
            </h3>
            <p className="text-sm text-text-tertiary max-w-sm mx-auto mb-6">
              Create templates for expenses you add often — like rent, groceries, or transport — and add them with one tap.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => setOpen(true)}>
                <Plus size={14} />
                Create Template
              </Button>
              <Button variant="secondary" onClick={() => setOpen(true)}>
                <Bolt size={14} />
                Quick Start
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {templates.map((t) => {
            const catColor = colorFor(t.category);
            return (
              <motion.div
                key={t.id}
                variants={item}
                layout
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 card-hover-shadow"
              >
                <div
                  className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full opacity-[0.06]"
                  style={{ backgroundColor: catColor }}
                />
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-bold"
                    style={{ backgroundColor: catColor }}
                  >
                    {t.category.slice(0, 2)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTemplate(t.id);
                      addToast({ message: "Template removed", type: "info" });
                    }}
                    className="rounded-lg p-1.5 text-text-tertiary opacity-0 group-hover:opacity-100 hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-lg font-bold text-text-primary mb-0.5">
                  {formatCurrency(t.amount)}
                </p>
                <p className="text-sm text-text-secondary truncate mb-3">
                  {t.description || t.category}
                </p>
                <div className="flex items-center gap-1 text-xs text-text-tertiary mb-4">
                  <Clock size={11} />
                  <span>{t.category}</span>
                </div>
                <button
                  onClick={() => handleUse(t)}
                  className="w-full rounded-xl bg-primary/10 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  <Bolt size={14} className="inline mr-1.5 -mt-0.5" />
                  Add Expense
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {open && (
        <TemplateForm
          onClose={() => setOpen(false)}
          onSave={(data) => {
            addTemplate(data);
            addToast({ message: "Template saved", type: "success" });
            setOpen(false);
          }}
          categories={categories}
        />
      )}
    </div>
  );
}

function TemplateForm({
  onClose,
  onSave,
  categories,
}: {
  onClose: () => void;
  onSave: (data: { amount: number; category: string; description: string }) => void;
  categories: string[];
}) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;
    onSave({ amount: amt, category, description: description.trim() });
  }

  return (
    <Modal open={true} onClose={onClose} title="Save Expense Template">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Amount (₦)"
          type="number"
          step="100"
          min="1"
          placeholder="5000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Select
          label="Category"
          options={categories.map((c) => ({ value: c, label: c }))}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Input
          label="Description"
          placeholder="e.g. Monthly transport"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={!amount || parseFloat(amount) <= 0}>
            <Plus size={14} />
            Save Template
          </Button>
        </div>
      </form>
    </Modal>
  );
}
