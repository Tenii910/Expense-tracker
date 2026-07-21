import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  setCode: (code: CurrencyCode) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      code: "NGN",
      setCode: (code) => set({ code }),
    }),
    { name: "expense-currency" },
  ),
);
