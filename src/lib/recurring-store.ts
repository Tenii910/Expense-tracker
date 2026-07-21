import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category } from "./types";

export interface RecurringExpense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  frequency: "monthly" | "weekly";
  dayOfMonth?: number;
  dayOfWeek?: number;
  active: boolean;
}

interface RecurringStore {
  templates: RecurringExpense[];
  addTemplate: (t: Omit<RecurringExpense, "id">) => void;
  updateTemplate: (id: string, data: Partial<RecurringExpense>) => void;
  removeTemplate: (id: string) => void;
  loadAll: (templates: RecurringExpense[]) => void;
}

let rid = 0;
function genId() {
  return `recur-${++rid}-${Date.now()}`;
}

export const useRecurringStore = create<RecurringStore>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (t) =>
        set((s) => ({ templates: [...s.templates, { ...t, id: genId() }] })),
      updateTemplate: (id, data) =>
        set((s) => ({
          templates: s.templates.map((t) =>
            t.id === id ? { ...t, ...data } : t,
          ),
        })),
      removeTemplate: (id) =>
        set((s) => ({
          templates: s.templates.filter((t) => t.id !== id),
        })),
      loadAll: (templates) => set({ templates }),
    }),
    { name: "expense-recurring" },
  ),
);
