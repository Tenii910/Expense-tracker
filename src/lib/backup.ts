import { format } from "date-fns";
import { useExpenseStoreRaw } from "./store";
import { useBudgetStoreRaw } from "./budget-store";
import { useRecurringStoreRaw } from "./recurring-store";
import { useThemeStore } from "./theme-store";
import { useCurrencyStore, type CurrencyCode } from "./currency-store";
import { useCategoryStoreRaw } from "./category-store";
import { useTemplateStoreRaw } from "./template-store";

interface BackupData {
  version: number;
  createdAt: string;
  expenses: ReturnType<typeof useExpenseStoreRaw.getState>["expenses"];
  budgets: ReturnType<typeof useBudgetStoreRaw.getState>["userBudgets"];
  recurring: ReturnType<typeof useRecurringStoreRaw.getState>["templates"];
  customCategories: ReturnType<typeof useCategoryStoreRaw.getState>["customs"];
  templates: ReturnType<typeof useTemplateStoreRaw.getState>["templates"];
  theme: boolean;
  currency: string;
}

export function createBackup(): void {
  const data: BackupData = {
    version: 2,
    createdAt: new Date().toISOString(),
    expenses: useExpenseStoreRaw.getState().expenses,
    budgets: useBudgetStoreRaw.getState().userBudgets,
    recurring: useRecurringStoreRaw.getState().templates,
    customCategories: useCategoryStoreRaw.getState().customs,
    templates: useTemplateStoreRaw.getState().templates,
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

    useExpenseStoreRaw.getState().loadAll(data.expenses);

    if (data.budgets) {
      useBudgetStoreRaw.getState().loadAll(data.budgets);
    }
    if (data.recurring) {
      useRecurringStoreRaw.getState().loadAll(data.recurring);
    }
    if (Array.isArray(data.customCategories)) {
      useCategoryStoreRaw.getState().loadAll(data.customCategories);
    }
    if (Array.isArray(data.templates)) {
      useTemplateStoreRaw.getState().loadAll(data.templates);
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
      message: `Restored: ${data.expenses.length} expense${data.expenses.length !== 1 ? "s" : ""}`,
    };
  } catch {
    return { success: false, message: "Could not parse backup file" };
  }
}
