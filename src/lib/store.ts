import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Expense, ExpenseFormData } from "./types";
import { generateId } from "./utils";

interface ExpenseStore {
  expenses: Expense[];
  addExpense: (data: ExpenseFormData) => void;
  removeExpense: (id: string) => void;
  updateExpense: (id: string, data: ExpenseFormData) => void;
  togglePin: (id: string) => void;
  clearAll: () => void;
  loadAll: (expenses: Expense[]) => void;
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: [],
      addExpense: (data) =>
        set((state) => ({
          expenses: [
            {
              ...data,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
            ...state.expenses,
          ],
        })),
      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),
      updateExpense: (id, data) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...data } : e,
          ),
        })),
      togglePin: (id) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, pinned: !e.pinned } : e,
          ),
        })),
      clearAll: () => set({ expenses: [] }),
      loadAll: (expenses) => set({ expenses }),
    }),
    { name: "expense-tracker" },
  ),
);
