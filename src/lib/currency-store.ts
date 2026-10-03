import { create } from "zustand";
import { getSupabaseClient } from "./supabase";
import { useAuthStore } from "./auth-store";

export type CurrencyCode = "NGN" | "USD" | "EUR" | "GBP" | "GHS";

export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string; decimals: number }> = {
  NGN: { symbol: "₦", name: "Naira", decimals: 0 },
  USD: { symbol: "$", name: "US Dollar", decimals: 2 },
  EUR: { symbol: "€", name: "Euro", decimals: 2 },
  GBP: { symbol: "£", name: "British Pound", decimals: 2 },
  GHS: { symbol: "₵", name: "Ghana Cedi", decimals: 0 },
};

interface CurrencyStore {
  code: CurrencyCode;
  setCode: (code: CurrencyCode) => Promise<void>;
}

export const useCurrencyStore = create<CurrencyStore>()((set) => ({
  code: "NGN",
  setCode: async (code) => {
    const userId = useAuthStore.getState().currentUser?.id;
    if (!userId) throw new Error("Sign in to save your currency preference.");
    const { error } = await getSupabaseClient().from("profiles")
      .update({ currency_code: code }).eq("id", userId);
    if (error) throw new Error(error.message);
    set({ code });
  },
}));
