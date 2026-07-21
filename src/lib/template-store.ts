import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "./utils";

export interface ExpenseTemplate {
  id: string;
  amount: number;
  category: string;
  description: string;
}

interface TemplateStore {
  templates: ExpenseTemplate[];
  addTemplate: (t: Omit<ExpenseTemplate, "id">) => void;
  removeTemplate: (id: string) => void;
  loadAll: (templates: ExpenseTemplate[]) => void;
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (data) =>
        set((s) => ({
          templates: [...s.templates, { ...data, id: generateId() }],
        })),
      removeTemplate: (id) =>
        set((s) => ({
          templates: s.templates.filter((t) => t.id !== id),
        })),
      loadAll: (templates) => set({ templates }),
    }),
    { name: "expense-templates" },
  ),
);
