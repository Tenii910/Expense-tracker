import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "./utils";

interface CustomCategory {
  id: string;
  name: string;
  color: string;
}

interface CategoryStore {
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

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      customs: [],
      addCustom: (name, color) => {
        const { customs } = get();
        if (customs.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
          return null;
        }
        const id = generateId();
        set({ customs: [...customs, { id, name, color }] });
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
