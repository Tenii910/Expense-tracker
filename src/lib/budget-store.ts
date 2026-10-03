import { create } from "zustand";
import type { Category } from "./types";
import { useAuthStore } from "./auth-store";
import { getSupabaseClient } from "./supabase";

type BudgetMap = Partial<Record<Category, number>>;

interface BudgetStoreState {
  userBudgets: Record<string, BudgetMap>;
  setBudget: (category: Category, amount: number) => Promise<void>;
  removeBudget: (category: Category) => Promise<void>;
  loadAll: (budgets: BudgetMap) => void;
}

export const useBudgetStoreRaw = create<BudgetStoreState>()((set) => ({
  userBudgets: {},
  setBudget: async (category, amount) => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (!userId) throw new Error("Sign in to save a budget.");

    const supabase = getSupabaseClient();
    const { data: existing, error: findError } = await supabase
      .from("budgets")
      .select("id")
      .eq("category", category)
      .maybeSingle();
    if (findError) throw new Error(findError.message);

    const query = existing
      ? supabase.from("budgets").update({ category, amount }).eq("id", existing.id)
      : supabase.from("budgets").insert({ category, amount });
    const { error } = await query;
    if (error) throw new Error(error.message);

    set((state) => ({
      userBudgets: {
        ...state.userBudgets,
        [userId]: { ...(state.userBudgets[userId] ?? {}), [category]: amount },
      },
    }));
  },
  removeBudget: async (category) => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (!userId) throw new Error("Sign in to manage budgets.");
    const { error } = await getSupabaseClient().from("budgets").delete().eq("category", category);
    if (error) throw new Error(error.message);
    set((state) => {
      const userBudgets = { ...state.userBudgets };
      const budgets = { ...(userBudgets[userId] ?? {}) };
      delete budgets[category];
      userBudgets[userId] = budgets;
      return { userBudgets };
    });
  },
  loadAll: (budgets) => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (!userId) return;
    set((state) => ({ userBudgets: { ...state.userBudgets, [userId]: budgets } }));
  },
}));

const EMPTY_BUDGETS: BudgetMap = {};

export function useBudgetStore(): {
  budgets: BudgetMap;
  setBudget: (category: Category, amount: number) => Promise<void>;
  removeBudget: (category: Category) => Promise<void>;
  loadAll: (budgets: BudgetMap) => void;
} {
  const currentUser = useAuthStore((state) => state.currentUser);
  const userBudgets = useBudgetStoreRaw((state) => state.userBudgets);
  const setBudget = useBudgetStoreRaw((state) => state.setBudget);
  const removeBudget = useBudgetStoreRaw((state) => state.removeBudget);
  const loadAll = useBudgetStoreRaw((state) => state.loadAll);
  const budgets = currentUser ? userBudgets[currentUser.id] ?? EMPTY_BUDGETS : EMPTY_BUDGETS;
  return { budgets, setBudget, removeBudget, loadAll };
}
