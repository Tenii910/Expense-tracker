import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category } from "./types";

interface BudgetStore {
  budgets: Partial<Record<Category, number>>;
  setBudget: (category: Category, amount: number) => void;
  removeBudget: (category: Category) => void;
  loadAll: (budgets: Partial<Record<Category, number>>) => void;
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set) => ({
      budgets: {},
      setBudget: (category, amount) =>
        set((state) => ({
          budgets: { ...state.budgets, [category]: amount },
        })),
      removeBudget: (category) =>
        set((state) => {
          const next = { ...state.budgets };
          delete next[category];
          return { budgets: next };
        }),
      loadAll: (budgets) => set({ budgets }),
    }),
    { name: "expense-budgets" },
  ),
);
