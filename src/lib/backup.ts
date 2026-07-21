import { format } from "date-fns";
import { useExpenseStore } from "./store";
import { useBudgetStore } from "./budget-store";
import { useRecurringStore } from "./recurring-store";
import { useThemeStore } from "./theme-store";
import { useCurrencyStore, type CurrencyCode } from "./currency-store";
import { useCategoryStore } from "./category-store";
import { useTemplateStore } from "./template-store";

interface BackupData {
  version: number;
  createdAt: string;
  expenses: ReturnType<typeof useExpenseStore.getState>["expenses"];
  budgets: ReturnType<typeof useBudgetStore.getState>["budgets"];
  recurring: ReturnType<typeof useRecurringStore.getState>["templates"];
  customCategories: ReturnType<typeof useCategoryStore.getState>["customs"];
  templates: ReturnType<typeof useTemplateStore.getState>["templates"];
  theme: boolean;
  currency: string;
}

export function createBackup(): void {
  const data: BackupData = {
    version: 2,
    createdAt: new Date().toISOString(),
    expenses: useExpenseStore.getState().expenses,
    budgets: useBudgetStore.getState().budgets,
    recurring: useRecurringStore.getState().templates,
    customCategories: useCategoryStore.getState().customs,
    templates: useTemplateStore.getState().templates,
    theme: useThemeStore.getState().isDark,
    currency: useCurrencyStore.getState().code,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expense-backup-${format(new Date(), "yyyy-MM-dd")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function restoreBackup(json: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(json) as BackupData;

    if (!data.version || !Array.isArray(data.expenses)) {
      return { success: false, message: "Invalid backup file format" };
    }

    useExpenseStore.getState().loadAll(data.expenses);

    if (data.budgets) {
      useBudgetStore.getState().loadAll(data.budgets);
    }
    if (data.recurring) {
      useRecurringStore.getState().loadAll(data.recurring);
    }
    if (Array.isArray(data.customCategories)) {
      useCategoryStore.getState().loadAll(data.customCategories);
    }
    if (Array.isArray(data.templates)) {
      useTemplateStore.getState().loadAll(data.templates);
    }
    if (typeof data.theme === "boolean") {
      useThemeStore.getState().toggle();
      if (!data.theme === useThemeStore.getState().isDark) {
        useThemeStore.getState().toggle();
      }
    }
    if (data.currency) {
      useCurrencyStore.getState().setCode(data.currency as CurrencyCode);
    }

    return {
      success: true,
      message: `Restored: ${data.expenses.length} expense${data.expenses.length !== 1 ? "s" : ""}, ${Object.keys(data.budgets || {}).length} budget${Object.keys(data.budgets || {}).length !== 1 ? "s" : ""}`,
    };
  } catch {
    return { success: false, message: "Could not parse backup file" };
  }
}
