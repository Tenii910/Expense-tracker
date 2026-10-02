import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "./utils";
import { useAuthStore } from "./auth-store";

interface CustomCategory {
  id: string;
  name: string;
  color: string;
  userId?: string;
}

interface CategoryStoreState {
  customs: CustomCategory[];
  addCustom: (name: string, color: string) => string | null;
  removeCustom: (id: string) => void;
  renameCustom: (id: string, name: string) => string | null;
  recolorCustom: (id: string, color: string) => void;
  loadAll: (customs: CustomCategory[]) => void;
}

const CUSTOM_COLORS = [
  "#FF6B35",
  "#00B4D8",
  "#FF006E",
  "#8338EC",
  "#3A86FF",
  "#06D6A0",
  "#FFBE0B",
  "#FB5607",
];

let colorIndex = 0;
function nextColor(): string {
  const c = CUSTOM_COLORS[colorIndex % CUSTOM_COLORS.length];
  colorIndex++;
  return c;
}

export const useCategoryStoreRaw = create<CategoryStoreState>()(
  persist(
    (set, get) => ({
      customs: [],
      addCustom: (name, color) => {
        const { customs } = get();
        const currentUser = useAuthStore.getState().currentUser;
        if (customs.some((c) => c.name.toLowerCase() === name.toLowerCase() && (c.userId === currentUser?.id || !c.userId))) {
          return null;
        }
        const id = generateId();
        set({ customs: [...customs, { id, name, color, userId: currentUser?.id }] });
        return id;
      },
      removeCustom: (id) =>
        set((s) => ({ customs: s.customs.filter((c) => c.id !== id) })),
      renameCustom: (id, name) => {
        const { customs } = get();
        if (customs.some((c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== id)) {
          return null;
        }
        set({ customs: customs.map((c) => (c.id === id ? { ...c, name } : c)) });
        return id;
      },
      recolorCustom: (id, color) =>
        set((s) => ({
          customs: s.customs.map((c) => (c.id === id ? { ...c, color } : c)),
        })),
      loadAll: (customs) => set({ customs }),
    }),
    { name: "expense-categories" },
  ),
);

let lastCustoms: CustomCategory[] | null = null;
let lastCatUserId: string | undefined = undefined;
let cachedScopedCategoryState: CategoryStoreState | null = null;

function getScopedCategoryState(state: CategoryStoreState, userId: string | undefined): CategoryStoreState {
  const customs = state?.customs || [];
  if (customs === lastCustoms && userId === lastCatUserId && cachedScopedCategoryState) {
    return cachedScopedCategoryState;
  }
  const userCustoms = userId
    ? customs.filter((c) => c && (c.userId === userId || !c.userId))
    : customs;
  lastCustoms = customs;
  lastCatUserId = userId;
  cachedScopedCategoryState = { ...state, customs: userCustoms };
  return cachedScopedCategoryState;
}

export function useCategoryStore<T = CategoryStoreState>(
  selector?: (state: CategoryStoreState) => T
): T {
  const currentUser = useAuthStore((s) => s.currentUser);
  const userId = currentUser?.id;
  return useCategoryStoreRaw((state) => {
    const scopedState = getScopedCategoryState(state, userId);
    return selector ? selector(scopedState) : (scopedState as unknown as T);
  });
}

import { useMemo } from "react";
import { DEFAULT_CATEGORIES, getCategoryColor } from "./types";

export function useAllCategories(): string[] {
  const customs = useCategoryStore((s) => s.customs);
  return useMemo(() => [...DEFAULT_CATEGORIES, ...customs.map((c) => c.name)], [customs]);
}

export function useCategoryColor(name: string): string {
  const customs = useCategoryStore((s) => s.customs);
  return useMemo(() => {
    const custom = customs.find((c) => c.name === name);
    if (custom) return custom.color;
    return getCategoryColor(name);
  }, [customs, name]);
}

export { nextColor, type CustomCategory };
