import { create } from "zustand";
import { getSupabaseClient } from "./supabase";

export interface ExpenseTemplate {
  id: string;
  amount: number;
  category: string;
  description: string;
  userId?: string;
}

interface TemplateStoreState {
  templates: ExpenseTemplate[];
  addTemplate: (template: Omit<ExpenseTemplate, "id" | "userId">) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
  loadAll: (templates: ExpenseTemplate[]) => void;
}

function mapTemplate(row: {
  id: string;
  amount: number | string;
  category: string;
  description: string;
  user_id: string;
}): ExpenseTemplate {
  return {
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    description: row.description,
    userId: row.user_id,
  };
}

export const useTemplateStoreRaw = create<TemplateStoreState>()((set) => ({
  templates: [],
  addTemplate: async (template) => {
    const { data, error } = await getSupabaseClient()
      .from("expense_templates")
      .insert(template)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    set((state) => ({ templates: [...state.templates, mapTemplate(data)] }));
  },
  removeTemplate: async (id) => {
    const { error } = await getSupabaseClient().from("expense_templates").delete().eq("id", id);
    if (error) throw new Error(error.message);
    set((state) => ({ templates: state.templates.filter((item) => item.id !== id) }));
  },
  loadAll: (templates) => set({ templates }),
}));

export function useTemplateStore<T>(selector: (state: TemplateStoreState) => T): T {
  return useTemplateStoreRaw(selector);
}
