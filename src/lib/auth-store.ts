import { create } from "zustand";
import { getSupabaseClient } from "@/lib/supabase";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

interface AuthStore {
  currentUser: UserSession | null;
  initialized: boolean;
  backendReady: boolean;
  backendError: string | null;
  setCurrentUser: (user: UserSession | null | ((current: UserSession | null) => UserSession | null)) => void;
  setInitialized: (initialized: boolean) => void;
  setBackendReady: (ready: boolean) => void;
  setBackendError: (error: string | null) => void;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  currentUser: null,
  initialized: false,
  backendReady: false,
  backendError: null,
  setCurrentUser: (user) => set((state) => ({
    currentUser: typeof user === "function" ? user(state.currentUser) : user,
  })),
  setInitialized: (initialized) => set({ initialized }),
  setBackendReady: (backendReady) => set({ backendReady }),
  setBackendError: (backendError) => set({ backendError }),

  signup: async (name, email, password) => {
    try {
      const { data, error } = await getSupabaseClient().auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { name: name.trim() } },
      });
      if (error) return { success: false, error: error.message };
      return { success: true, needsEmailConfirmation: !data.session };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Could not create your account.",
      };
    }
  },

  login: async (email, password) => {
    try {
      const { error } = await getSupabaseClient().auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      return error ? { success: false, error: error.message } : { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Could not sign in.",
      };
    }
  },

  logout: async () => {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw new Error(error.message);
  },
}));
