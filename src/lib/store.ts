import { create } from "zustand";
import type { Expense, ExpenseFormData } from "./types";
import { getSupabaseClient } from "./supabase";

interface ExpenseStoreState {
  expenses: Expense[];
  addExpense: (data: ExpenseFormData) => Promise<Expense>;
  addExpenses: (data: ExpenseFormData[]) => Promise<Expense[]>;
  removeExpense: (id: string) => Promise<void>;
  updateExpense: (id: string, data: ExpenseFormData) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  loadAll: (expenses: Expense[]) => void;
}

function mapExpense(row: {
  id: string;
  amount: number | string;
  category: string;
  description: string;
  spent_on: string;
  created_at: string;
  pinned: boolean;
  user_id: string;
}): Expense {
  return {
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    description: row.description,
    date: row.spent_on,
    createdAt: row.created_at,
    pinned: row.pinned,
    userId: row.user_id,
  };
}

export const useExpenseStoreRaw = create<ExpenseStoreState>()((set, get) => ({
  expenses: [],
  addExpense: async (data) => {
    const { data: row, error } = await getSupabaseClient()
      .from("expenses")
      .insert({
        amount: data.amount,
        category: data.category,
        description: data.description,
        spent_on: data.date,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const expense = mapExpense(row);
    set((state) => ({ expenses: [expense, ...state.expenses] }));
    return expense;
  },
  addExpenses: async (items) => {
    if (items.length === 0) return [];
    const { data, error } = await getSupabaseClient()
      .from("expenses")
      .insert(items.map((item) => ({
        amount: item.amount,
        category: item.category,
        description: item.description,
        spent_on: item.date,
      })))
      .select("*");
    if (error) throw new Error(error.message);
    const added = (data ?? []).map(mapExpense);
    set((state) => ({ expenses: [...added, ...state.expenses] }));
    return added;
  },
  removeExpense: async (id) => {
    const { error } = await getSupabaseClient().from("expenses").delete().eq("id", id);
    if (error) throw new Error(error.message);
    set((state) => ({ expenses: state.expenses.filter((expense) => expense.id !== id) }));
  },
  updateExpense: async (id, data) => {
    const { data: row, error } = await getSupabaseClient()
      .from("expenses")
      .update({
        amount: data.amount,
        category: data.category,
        description: data.description,
        spent_on: data.date,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const expense = mapExpense(row);
    set((state) => ({ expenses: state.expenses.map((item) => item.id === id ? expense : item) }));
  },
  togglePin: async (id) => {
    const current = get().expenses.find((expense) => expense.id === id);
    if (!current) return;
    const { error } = await getSupabaseClient()
      .from("expenses")
      .update({ pinned: !current.pinned })
      .eq("id", id);
    if (error) throw new Error(error.message);
    set((state) => ({
      expenses: state.expenses.map((expense) => expense.id === id
        ? { ...expense, pinned: !current.pinned }
        : expense),
    }));
  },
  clearAll: async () => {
    const { error } = await getSupabaseClient()
      .from("expenses")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw new Error(error.message);
    set({ expenses: [] });
  },
  loadAll: (expenses) => set({ expenses }),
}));

export function useExpenseStore<T = ExpenseStoreState>(
  selector?: (state: ExpenseStoreState) => T,
): T {
  return useExpenseStoreRaw((state) => selector ? selector(state) : state as unknown as T);
}
