"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useRecurringStore, type RecurringExpense } from "@/lib/recurring-store";
import { useExpenseStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { getCategoryColor } from "@/lib/types";
import { useAllCategories, useCategoryStore } from "@/lib/category-store";
import { useFormatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { format, getDate, getDay } from "date-fns";

function isDue(template: RecurringExpense): boolean {
  const now = new Date();
  if (template.frequency === "monthly") {
    return (template.dayOfMonth ?? 1) <= getDate(now);
  }
  return (template.dayOfWeek ?? 0) <= getDay(now);
}

export function Recurring() {
  const templates = useRecurringStore((s) => s.templates);
  const updateTemplate = useRecurringStore((s) => s.updateTemplate);
  const removeTemplate = useRecurringStore((s) => s.removeTemplate);
  const expenses = useExpenseStore((s) => s.expenses);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const addToast = useToastStore((s) => s.addToast);

  const formatCurrency = useFormatCurrency();
  const customs = useCategoryStore((s) => s.customs);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecurringExpense | null>(null);

  function colorFor(cat: string) {
    const custom = customs.find((c) => c.name === cat);
    return custom?.color ?? getCategoryColor(cat);
  }

  const activeCount = templates.filter((t) => t.active).length;

  useEffect(() => {
    const currentMonth = format(new Date(), "yyyy-MM");
    let added = 0;

    for (const template of templates) {
      if (!template.active) continue;
      const alreadyAdded = expenses.some(
        (e) =>
          e.date.startsWith(currentMonth) &&
          e.amount === template.amount &&
          e.category === template.category &&
          e.description === template.description,
      );
      if (!alreadyAdded && isDue(template)) {
        addExpense({
          amount: template.amount,
          category: template.category,
          description: template.description,
          date: new Date().toISOString().split("T")[0],
        });
        added++;
      }
    }

    if (added > 0) {
      addToast({
        message: `Added ${added} recurring expense${added > 1 ? "s" : ""}`,
        type: "info",
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-text-primary">Recurring</h3>
          {activeCount > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {activeCount} active
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <Plus size={14} />
          Add
        </Button>
      </div>

      {templates.length === 0 ? (
        <p className="text-sm text-text-tertiary">
          Set up recurring expenses (e.g., rent, subscriptions) to auto-add each month.
        </p>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {templates.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-surface-hover ${!t.active ? "opacity-50" : ""}`}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-xs font-bold"
                  style={{ backgroundColor: colorFor(t.category) }}
                >
                  {t.category.slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {t.description || t.category}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {t.frequency === "monthly"
                      ? `Monthly (day ${t.dayOfMonth ?? 1})`
                      : `Weekly (day ${t.dayOfWeek ?? 0})`}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-text-primary">
                    {formatCurrency(t.amount)}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      updateTemplate(t.id, { active: !t.active });
                      addToast({
                        message: t.active ? "Recurring paused" : "Recurring resumed",
                        type: "info",
                      });
                    }}
                    className="rounded-lg p-1.5 text-text-tertiary hover:text-primary transition-colors cursor-pointer"
                  >
                    {t.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(t);
                      setShowForm(true);
                    }}
                    className="rounded-lg p-1.5 text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => {
                      removeTemplate(t.id);
                      addToast({ message: "Recurring removed", type: "info" });
                    }}
                    className="rounded-lg p-1.5 text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <RecurringForm
        open={showForm}
        edit={editing}
        onClose={() => {
          setShowForm(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

function RecurringForm({
  open,
  edit,
  onClose,
}: {
  open: boolean;
  edit: RecurringExpense | null;
  onClose: () => void;
}) {
  const addTemplate = useRecurringStore((s) => s.addTemplate);
  const updateTemplate = useRecurringStore((s) => s.updateTemplate);

  const [amount, setAmount] = useState(edit?.amount.toString() ?? "");
  const categoriesForm = useAllCategories();
  const [category, setCategory] = useState<string>(edit?.category ?? categoriesForm[0]);
  const [description, setDescription] = useState(edit?.description ?? "");
  const [frequency, setFrequency] = useState<"monthly" | "weekly">(
    edit?.frequency ?? "monthly",
  );
  const [dayOfMonth, setDayOfMonth] = useState(
    edit?.dayOfMonth?.toString() ?? "1",
  );
  const [dayOfWeek, setDayOfWeek] = useState(
    edit?.dayOfWeek?.toString() ?? "0",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;

    const base = {
      amount: amt,
      category,
      description: description.trim(),
      frequency,
      active: edit?.active ?? true,
      dayOfMonth: frequency === "monthly" ? parseInt(dayOfMonth) : undefined,
      dayOfWeek: frequency === "weekly" ? parseInt(dayOfWeek) : undefined,
    };

    if (edit) {
      updateTemplate(edit.id, base);
    } else {
      addTemplate(base);
    }
    onClose();
  }

  const CATEGORY_OPTIONS = categoriesForm.map((c) => ({ value: c, label: c }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={edit ? "Edit Recurring" : "Add Recurring"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Amount (₦)"
          type="number"
          step="100"
          min="1"
          placeholder="50000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Select
          label="Category"
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <Input
          label="Description"
          placeholder="e.g. Rent, Netflix, Gym"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Select
          label="Frequency"
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "weekly", label: "Weekly" },
          ]}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as "monthly" | "weekly")}
        />

        {frequency === "monthly" ? (
          <Input
            label="Day of month (1-31)"
            type="number"
            min="1"
            max="31"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
          />
        ) : (
          <Select
            label="Day of week"
            options={[
              { value: "0", label: "Sunday" },
              { value: "1", label: "Monday" },
              { value: "2", label: "Tuesday" },
              { value: "3", label: "Wednesday" },
              { value: "4", label: "Thursday" },
              { value: "5", label: "Friday" },
              { value: "6", label: "Saturday" },
            ]}
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
          />
        )}

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {edit ? "Update" : "Add Recurring"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
