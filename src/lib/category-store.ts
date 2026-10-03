import { create } from "zustand";
import { useMemo } from "react";
import { getSupabaseClient } from "./supabase";
import { DEFAULT_CATEGORIES, getCategoryColor } from "./types";

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  userId?: string;
}

interface CategoryStoreState {
  customs: CustomCategory[];
  addCustom: (name: string, color: string) => Promise<string | null>;
  removeCustom: (id: string) => Promise<void>;
  renameCustom: (id: string, name: string) => Promise<string | null>;
  recolorCustom: (id: string, color: string) => Promise<void>;
  loadAll: (customs: CustomCategory[]) => void;
}

const CUSTOM_COLORS = [
  "#FF6B35", "#00B4D8", "#FF006E", "#8338EC",
  "#3A86FF", "#06D6A0", "#FFBE0B", "#FB5607",
];
let colorIndex = 0;
export function nextColor(): string {
  const color = CUSTOM_COLORS[colorIndex % CUSTOM_COLORS.length];
  colorIndex += 1;
  return color;
}

function mapCategory(row: { id: string; name: string; color: string; user_id: string | null }): CustomCategory {
  return { id: row.id, name: row.name, color: row.color, userId: row.user_id ?? undefined };
}

export const useCategoryStoreRaw = create<CategoryStoreState>()((set) => ({
  customs: [],
  addCustom: async (name, color) => {
    const supabase = getSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Sign in before creating a custom category.");

    const { data, error } = await supabase
      .from("categories")
      .insert({ user_id: authData.user.id, name: name.trim(), color, is_system: false })
      .select("id, name, color, user_id")
      .single();
    if (error) {
      if (error.code === "23505") return null;
      throw new Error(error.message);
    }
    const category = mapCategory(data);
    set((state) => ({ customs: [...state.customs, category] }));
    return category.id;
  },
  removeCustom: async (id) => {
    const { error } = await getSupabaseClient().from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
    set((state) => ({ customs: state.customs.filter((category) => category.id !== id) }));
  },
  renameCustom: async (id, name) => {
    const { data, error } = await getSupabaseClient()
      .from("categories").update({ name: name.trim() }).eq("id", id)
      .select("id, name, color, user_id").single();
    if (error) {
      if (error.code === "23505") return null;
      throw new Error(error.message);
    }
    const category = mapCategory(data);
    set((state) => ({ customs: state.customs.map((item) => item.id === id ? category : item) }));
    return category.id;
  },
  recolorCustom: async (id, color) => {
    const { error } = await getSupabaseClient().from("categories").update({ color }).eq("id", id);
    if (error) throw new Error(error.message);
    set((state) => ({ customs: state.customs.map((category) => category.id === id ? { ...category, color } : category) }));
  },
  loadAll: (customs) => set({ customs }),
}));

export function useCategoryStore<T = CategoryStoreState>(
  selector?: (state: CategoryStoreState) => T,
): T {
  return useCategoryStoreRaw((state) => selector ? selector(state) : state as unknown as T);
}

export function useAllCategories(): string[] {
  const customs = useCategoryStore((state) => state.customs);
  return useMemo(() => [...DEFAULT_CATEGORIES, ...customs.map((category) => category.name)], [customs]);
}

export function useCategoryColor(name: string): string {
  const customs = useCategoryStore((state) => state.customs);
  return useMemo(() => {
    const custom = customs.find((category) => category.name === name);
    return custom?.color ?? getCategoryColor(name);
  }, [customs, name]);
}
