import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Expense, ExpenseFormData } from "./types";
import { generateId } from "./utils";
import { useAuthStore } from "./auth-store";

interface ExpenseStoreState {
  expenses: Expense[];
  addExpense: (data: ExpenseFormData) => void;
  removeExpense: (id: string) => void;
  updateExpense: (id: string, data: ExpenseFormData) => void;
  togglePin: (id: string) => void;
  clearAll: () => void;
  loadAll: (expenses: Expense[]) => void;
}

export const useExpenseStoreRaw = create<ExpenseStoreState>()(
  persist(
    (set) => ({
      expenses: [],
      addExpense: (data) => {
        const currentUser = useAuthStore.getState().currentUser;
        set((state) => ({
          expenses: [
            {
              ...data,
              id: generateId(),
              userId: currentUser?.id,
              createdAt: new Date().toISOString(),
            },
            ...state.expenses,
          ],
        }));
      },
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
      clearAll: () => {
        const currentUser = useAuthStore.getState().currentUser;
        if (!currentUser) {
          set({ expenses: [] });
          return;
        }
        set((state) => ({
          expenses: state.expenses.filter((e) => e.userId !== currentUser.id),
        }));
      },
      loadAll: (expenses) => set({ expenses }),
    }),
    { name: "expense-tracker" },
  ),
);

let lastExpenses: Expense[] | null = null;
let lastUserId: string | undefined = undefined;
let cachedScopedState: ExpenseStoreState | null = null;

function getScopedExpenseState(state: ExpenseStoreState, userId: string | undefined): ExpenseStoreState {
  const expenses = state?.expenses || [];
  if (expenses === lastExpenses && userId === lastUserId && cachedScopedState) {
    return cachedScopedState;
  }
  const userExpenses = userId
    ? expenses.filter((e) => e && (e.userId === userId || !e.userId))
    : expenses;
  lastExpenses = expenses;
  lastUserId = userId;
  cachedScopedState = { ...state, expenses: userExpenses };
  return cachedScopedState;
}

export function useExpenseStore<T = ExpenseStoreState>(
  selector?: (state: ExpenseStoreState) => T
): T {
  const currentUser = useAuthStore((s) => s.currentUser);
  const userId = currentUser?.id;
  return useExpenseStoreRaw((state) => {
    const scopedState = getScopedExpenseState(state, userId);
    return selector ? selector(scopedState) : (scopedState as unknown as T);
  });
}
