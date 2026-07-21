import { useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { useCurrencyStore, CURRENCIES } from "./currency-store";

export function formatCurrency(amount: number): string {
  const code = useCurrencyStore.getState().code;
  const { symbol, decimals } = CURRENCIES[code];
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function useFormatCurrency() {
  const code = useCurrencyStore((s) => s.code);
  const { symbol, decimals } = CURRENCIES[code];
  return useMemo(
    () =>
      (amount: number) =>
        `${symbol}${amount.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}`,
    [symbol, decimals],
  );
}

export function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

export function generateId(): string {
  return crypto.randomUUID();
}
