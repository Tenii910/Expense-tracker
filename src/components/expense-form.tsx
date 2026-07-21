"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { useExpenseStore } from "@/lib/store";
import { useAllCategories } from "@/lib/category-store";
import type { ExpenseFormData } from "@/lib/types";

const TODAY = new Date().toISOString().split("T")[0];

interface ExpenseFormProps {
  editExpense?: { id: string } & ExpenseFormData;
  open: boolean;
  onClose: () => void;
  onUpdated?: (oldExpense: { id: string } & ExpenseFormData) => void;
}

export function ExpenseForm({ editExpense, open, onClose, onUpdated }: ExpenseFormProps) {
  const addExpense = useExpenseStore((s) => s.addExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);

  const [amount, setAmount] = useState(editExpense?.amount.toString() ?? "");
  const categories = useAllCategories();
  const [category, setCategory] = useState<string>(
    editExpense?.category ?? categories[0],
  );
  const [description, setDescription] = useState(
    editExpense?.description ?? "",
  );
  const [date, setDate] = useState(editExpense?.date ?? TODAY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      errs.amount = "Enter a valid amount";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const data: ExpenseFormData = {
      amount: parseFloat(amount),
      category,
      description: description.trim(),
      date,
    };

    if (editExpense) {
      onUpdated?.(editExpense);
      updateExpense(editExpense.id, data);
    } else {
      addExpense(data);
    }

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editExpense ? "Edit Expense" : "Add Expense"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Amount (₦)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
        />

        <Select
          label="Category"
          options={categories.map((c) => ({ value: c, label: c }))}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <Input
          label="Description"
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            <Plus size={16} />
            {editExpense ? "Update" : "Add Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
