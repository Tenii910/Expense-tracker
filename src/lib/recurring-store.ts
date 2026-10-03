import { create } from "zustand";
import type { Category } from "./types";
import { getSupabaseClient } from "./supabase";
import type { Database } from "./database.types";

export interface RecurringExpense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  frequency: "monthly" | "weekly";
  dayOfMonth?: number;
  dayOfWeek?: number;
  active: boolean;
  userId?: string;
  startsOn?: string;
}

interface RecurringStoreState {
  templates: RecurringExpense[];
  addTemplate: (template: Omit<RecurringExpense, "id" | "userId">) => Promise<void>;
  updateTemplate: (id: string, data: Partial<RecurringExpense>) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
  loadAll: (templates: RecurringExpense[]) => void;
}

function mapRecurring(row: {
  id: string;
  amount: number | string;
  category: string;
  description: string;
  frequency: "monthly" | "weekly";
  day_of_month: number | null;
  day_of_week: number | null;
  active: boolean;
  user_id: string;
  starts_on: string;
}): RecurringExpense {
  return {
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    description: row.description,
    frequency: row.frequency,
    dayOfMonth: row.day_of_month ?? undefined,
    dayOfWeek: row.day_of_week ?? undefined,
    active: row.active,
    userId: row.user_id,
    startsOn: row.starts_on,
  };
}

export const useRecurringStoreRaw = create<RecurringStoreState>()((set) => ({
  templates: [],
  addTemplate: async (template) => {
    const { data: inserted, error } = await getSupabaseClient()
      .from("recurring_expenses").insert({
        amount: template.amount,
        category: template.category,
        description: template.description,
        frequency: template.frequency,
        day_of_month: template.frequency === "monthly" ? template.dayOfMonth : null,
        day_of_week: template.frequency === "weekly" ? template.dayOfWeek : null,
        active: template.active,
        starts_on: template.startsOn ?? new Date().toISOString().slice(0, 10),
      }).select("*").single();
    if (error) throw new Error(error.message);
    set((state) => ({ templates: [...state.templates, mapRecurring(inserted)] }));
  },
  updateTemplate: async (id, changes) => {
    const update: Database["public"]["Tables"]["recurring_expenses"]["Update"] = {};
    if (changes.amount !== undefined) update.amount = changes.amount;
    if (changes.category !== undefined) update.category = changes.category;
    if (changes.description !== undefined) update.description = changes.description;
    if (changes.frequency !== undefined) update.frequency = changes.frequency;
    if (changes.dayOfMonth !== undefined || changes.frequency === "monthly") {
      update.day_of_month = changes.frequency === "weekly" ? null : changes.dayOfMonth ?? null;
    }
    if (changes.dayOfWeek !== undefined || changes.frequency === "weekly") {
      update.day_of_week = changes.frequency === "monthly" ? null : changes.dayOfWeek ?? null;
    }
    if (changes.active !== undefined) update.active = changes.active;
    if (changes.startsOn !== undefined) update.starts_on = changes.startsOn;

    const { data, error } = await getSupabaseClient()
      .from("recurring_expenses").update(update).eq("id", id).select("*").single();
    if (error) throw new Error(error.message);
    set((state) => ({ templates: state.templates.map((item) => item.id === id ? mapRecurring(data) : item) }));
  },
  removeTemplate: async (id) => {
    const { error } = await getSupabaseClient().from("recurring_expenses").delete().eq("id", id);
    if (error) throw new Error(error.message);
    set((state) => ({ templates: state.templates.filter((item) => item.id !== id) }));
  },
  loadAll: (templates) => set({ templates }),
}));

export function useRecurringStore<T>(selector: (state: RecurringStoreState) => T): T {
  return useRecurringStoreRaw(selector);
}
