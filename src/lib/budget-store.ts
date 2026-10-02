import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category } from "./types";
import { useAuthStore } from "./auth-store";

interface BudgetStoreState {
  userBudgets: Record<string, Partial<Record<Category, number>>>;
  setBudget: (category: Category, amount: number) => void;
  removeBudget: (category: Category) => void;
  loadAll: (budgets: Partial<Record<Category, number>>) => void;
}

export const useBudgetStoreRaw = create<BudgetStoreState>()(
  persist(
    (set) => ({
      userBudgets: {},
      setBudget: (category, amount) => {
        const currentUser = useAuthStore.getState().currentUser;
        const uid = currentUser?.id || "guest";
        set((state) => ({
          userBudgets: {
            ...state.userBudgets,
            [uid]: {
              ...(state.userBudgets[uid] || {}),
              [category]: amount,
            },
          },
        }));
      },
      removeBudget: (category) => {
        const currentUser = useAuthStore.getState().currentUser;
        const uid = currentUser?.id || "guest";
        set((state) => {
          const userDict = { ...(state.userBudgets[uid] || {}) };
          delete userDict[category];
          return {
            userBudgets: {
              ...state.userBudgets,
              [uid]: userDict,
            },
          };
        });
      },
      loadAll: (budgets) => {
        const currentUser = useAuthStore.getState().currentUser;
        const uid = currentUser?.id || "guest";
        set((state) => ({
          userBudgets: { ...state.userBudgets, [uid]: budgets },
        }));
      },
    }),
    { name: "expense-budgets" },
  ),
);

const EMPTY_BUDGETS: Partial<Record<Category, number>> = {};

export function useBudgetStore(): {
  budgets: Partial<Record<Category, number>>;
  setBudget: (category: Category, amount: number) => void;
  removeBudget: (category: Category) => void;
  loadAll: (budgets: Partial<Record<Category, number>>) => void;
} {
  const currentUser = useAuthStore((s) => s.currentUser);
  const userBudgets = useBudgetStoreRaw((s) => s?.userBudgets || {});
  const setBudget = useBudgetStoreRaw((s) => s.setBudget);
  const removeBudget = useBudgetStoreRaw((s) => s.removeBudget);
  const loadAll = useBudgetStoreRaw((s) => s.loadAll);

  const uid = currentUser?.id || "guest";
  const budgets = userBudgets[uid] || EMPTY_BUDGETS;

  return {
    budgets,
    setBudget,
    removeBudget,
    loadAll,
  };
}
