import { create } from "zustand";
import { getSupabaseClient } from "./supabase";
import { useAuthStore } from "./auth-store";

interface ThemeStore {
  isDark: boolean;
  toggle: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  isDark: false,
  toggle: async () => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (!userId) throw new Error("Sign in to save your theme preference.");
    const isDark = !get().isDark;
    const { error } = await getSupabaseClient().from("profiles")
      .update({ is_dark: isDark }).eq("id", userId);
    if (error) throw new Error(error.message);
    set({ isDark });
  },
}));
