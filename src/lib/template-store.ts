import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "./utils";
import { useAuthStore } from "./auth-store";

export interface ExpenseTemplate {
  id: string;
  amount: number;
  category: string;
  description: string;
  userId?: string;
}

interface TemplateStoreState {
  templates: ExpenseTemplate[];
  addTemplate: (t: Omit<ExpenseTemplate, "id">) => void;
  removeTemplate: (id: string) => void;
  loadAll: (templates: ExpenseTemplate[]) => void;
}

export const useTemplateStoreRaw = create<TemplateStoreState>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (data) => {
        const currentUser = useAuthStore.getState().currentUser;
        set((s) => ({
          templates: [...s.templates, { ...data, id: generateId(), userId: currentUser?.id }],
        }));
      },
      removeTemplate: (id) =>
        set((s) => ({
          templates: s.templates.filter((t) => t.id !== id),
        })),
      loadAll: (templates) => set({ templates }),
    }),
    { name: "expense-templates" },
  ),
);

let lastTemplates: ExpenseTemplate[] | null = null;
let lastTplUserId: string | undefined = undefined;
let cachedScopedTemplateState: TemplateStoreState | null = null;

function getScopedTemplateState(state: TemplateStoreState, userId: string | undefined): TemplateStoreState {
  const templates = state?.templates || [];
  if (templates === lastTemplates && userId === lastTplUserId && cachedScopedTemplateState) {
    return cachedScopedTemplateState;
  }
  const userTemplates = userId
    ? templates.filter((t) => t && (t.userId === userId || !t.userId))
    : templates;
  lastTemplates = templates;
  lastTplUserId = userId;
  cachedScopedTemplateState = { ...state, templates: userTemplates };
  return cachedScopedTemplateState;
}

export function useTemplateStore<T>(selector: (state: TemplateStoreState) => T): T {
  const currentUser = useAuthStore((s) => s.currentUser);
  const userId = currentUser?.id;
  return useTemplateStoreRaw((state) => {
    const scopedState = getScopedTemplateState(state, userId);
    return selector(scopedState);
  });
}
