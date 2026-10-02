import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category } from "./types";
import { useAuthStore } from "./auth-store";

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
}

interface RecurringStoreState {
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

export const useRecurringStoreRaw = create<RecurringStoreState>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (t) => {
        const currentUser = useAuthStore.getState().currentUser;
        set((s) => ({
          templates: [...s.templates, { ...t, id: genId(), userId: currentUser?.id }],
        }));
      },
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

let lastRecurring: RecurringExpense[] | null = null;
let lastRecUserId: string | undefined = undefined;
let cachedScopedRecurringState: RecurringStoreState | null = null;

function getScopedRecurringState(state: RecurringStoreState, userId: string | undefined): RecurringStoreState {
  const templates = state?.templates || [];
  if (templates === lastRecurring && userId === lastRecUserId && cachedScopedRecurringState) {
    return cachedScopedRecurringState;
  }
  const userTemplates = userId
    ? templates.filter((t) => t && (t.userId === userId || !t.userId))
    : templates;
  lastRecurring = templates;
  lastRecUserId = userId;
  cachedScopedRecurringState = { ...state, templates: userTemplates };
  return cachedScopedRecurringState;
}

export function useRecurringStore<T>(selector: (state: RecurringStoreState) => T): T {
  const currentUser = useAuthStore((s) => s.currentUser);
  const userId = currentUser?.id;
  return useRecurringStoreRaw((state) => {
    const scopedState = getScopedRecurringState(state, userId);
    return selector(scopedState);
  });
}
