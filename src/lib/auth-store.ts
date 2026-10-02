import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateId } from "./utils";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserAccount extends UserSession {
  passwordHash: string;
}

interface AuthStore {
  users: UserAccount[];
  currentUser: UserSession | null;
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,

      signup: (name, email, password) => {
        const { users } = get();
        const trimmedEmail = email.trim().toLowerCase();

        if (!name.trim() || !trimmedEmail || !password) {
          return { success: false, error: "All fields are required" };
        }

        if (users.some((u) => u.email === trimmedEmail)) {
          return { success: false, error: "An account with this email already exists" };
        }

        const newUser: UserAccount = {
          id: generateId(),
          name: name.trim(),
          email: trimmedEmail,
          passwordHash: btoa(password), // Basic client-side encoding for demo/local storage persistence
          createdAt: new Date().toISOString(),
        };

        const session: UserSession = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        };

        set({
          users: [...users, newUser],
          currentUser: session,
        });

        return { success: true };
      },

      login: (email, password) => {
        const { users } = get();
        const trimmedEmail = email.trim().toLowerCase();
        const user = users.find((u) => u.email === trimmedEmail);

        if (!user) {
          return { success: false, error: "No account found with this email" };
        }

        if (user.passwordHash !== btoa(password)) {
          return { success: false, error: "Incorrect password" };
        }

        const session: UserSession = {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        };

        set({ currentUser: session });
        return { success: true };
      },

      logout: () => {
        set({ currentUser: null });
      },
    }),
    {
      name: "expense-tracker-auth",
    },
  ),
);
