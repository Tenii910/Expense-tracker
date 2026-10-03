import { format } from "date-fns";
import { useExpenseStoreRaw } from "./store";
import { useBudgetStoreRaw } from "./budget-store";
import { useRecurringStoreRaw } from "./recurring-store";
import { useThemeStore } from "./theme-store";
import { useCurrencyStore, type CurrencyCode } from "./currency-store";
import { useCategoryStoreRaw } from "./category-store";
import { useTemplateStoreRaw } from "./template-store";
import { useAuthStore } from "./auth-store";

interface BackupData {
  version: number;
  createdAt: string;
  expenses: ReturnType<typeof useExpenseStoreRaw.getState>["expenses"];
  budgets: Partial<Record<string, number>>;
  recurring: ReturnType<typeof useRecurringStoreRaw.getState>["templates"];
  customCategories: ReturnType<typeof useCategoryStoreRaw.getState>["customs"];
  templates: ReturnType<typeof useTemplateStoreRaw.getState>["templates"];
  theme: boolean;
  currency: string;
}

export function createBackup(): void {
  const userId = useAuthStore.getState().currentUser?.id || "guest";
  const data: BackupData = {
    version: 2,
    createdAt: new Date().toISOString(),
    expenses: useExpenseStoreRaw.getState().expenses,
    budgets: useBudgetStoreRaw.getState().userBudgets[userId] ?? {},
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

export async function restoreBackup(json: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(json) as BackupData;

    if (!data.version || !Array.isArray(data.expenses)) {
      return { success: false, message: "Invalid backup file format" };
    }

    await useExpenseStoreRaw.getState().addExpenses(data.expenses.map((expense) => ({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
    })));

    await Promise.all([
      ...Object.entries(data.budgets ?? {}).map(([category, amount]) =>
        useBudgetStoreRaw.getState().setBudget(category, amount ?? 0)),
      ...(data.recurring ?? []).map((template) =>
        useRecurringStoreRaw.getState().addTemplate({
          amount: template.amount,
          category: template.category,
          description: template.description,
          frequency: template.frequency,
          dayOfMonth: template.dayOfMonth,
          dayOfWeek: template.dayOfWeek,
          active: template.active,
          startsOn: template.startsOn,
        })),
      ...(data.customCategories ?? []).map((category) =>
        useCategoryStoreRaw.getState().addCustom(category.name, category.color)),
      ...(data.templates ?? []).map((template) =>
        useTemplateStoreRaw.getState().addTemplate({
          amount: template.amount,
          category: template.category,
          description: template.description,
        })),
    ]);

    if (typeof data.theme === "boolean" && data.theme !== useThemeStore.getState().isDark) {
      await useThemeStore.getState().toggle();
    }
    if (["NGN", "USD", "EUR", "GBP", "GHS"].includes(data.currency)) {
      await useCurrencyStore.getState().setCode(data.currency as CurrencyCode);
    }

    return {
      success: true,
      message: `Restored: ${data.expenses.length} expense${data.expenses.length !== 1 ? "s" : ""}`,
    };
  } catch {
    return { success: false, message: "Could not parse backup file" };
  }
}
