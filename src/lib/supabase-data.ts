import { useExpenseStoreRaw } from "@/lib/store";
import { useBudgetStoreRaw } from "@/lib/budget-store";
import { useRecurringStoreRaw } from "@/lib/recurring-store";
import { useTemplateStoreRaw } from "@/lib/template-store";
import { useCategoryStoreRaw } from "@/lib/category-store";
import { useCurrencyStore } from "@/lib/currency-store";
import { useThemeStore } from "@/lib/theme-store";
import { getSupabaseClient } from "@/lib/supabase";
import type { Expense } from "@/lib/types";
import type { RecurringExpense } from "@/lib/recurring-store";
import type { ExpenseTemplate } from "@/lib/template-store";
import type { CustomCategory } from "@/lib/category-store";
import type { CurrencyCode } from "@/lib/currency-store";

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

  function localDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

export async function loadUserData(userId: string) {
  const supabase = getSupabaseClient();
    const today = localDateString(new Date());
  const { error: recurringError } = await supabase.rpc("generate_recurring_expenses", {
    p_through_date: today,
    p_user_id: userId,
  });
  throwIfError(recurringError);

  const [expensesResult, budgetsResult, recurringResult, templatesResult, categoriesResult, profileResult] =
    await Promise.all([
      supabase.from("expenses").select("*").order("spent_on", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("budgets").select("category, amount"),
      supabase.from("recurring_expenses").select("*").order("created_at", { ascending: true }),
      supabase.from("expense_templates").select("*").order("created_at", { ascending: true }),
      supabase.from("categories").select("id, user_id, name, color").eq("is_system", false).order("name"),
      supabase.from("profiles").select("display_name, email, currency_code, is_dark").eq("id", userId).maybeSingle(),
    ]);

  throwIfError(expensesResult.error);
  throwIfError(budgetsResult.error);
  throwIfError(recurringResult.error);
  throwIfError(templatesResult.error);
  throwIfError(categoriesResult.error);
  throwIfError(profileResult.error);

  const expenses: Expense[] = (expensesResult.data ?? []).map((row) => ({
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    description: row.description,
    date: row.spent_on,
    createdAt: row.created_at,
    pinned: row.pinned,
    userId: row.user_id ?? undefined,
  }));
  const budgets = Object.fromEntries(
    (budgetsResult.data ?? []).map((row) => [row.category, Number(row.amount)]),
  );
  const recurring: RecurringExpense[] = (recurringResult.data ?? []).map((row) => ({
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    description: row.description,
    frequency: row.frequency,
    dayOfMonth: row.day_of_month ?? undefined,
    dayOfWeek: row.day_of_week ?? undefined,
    active: row.active,
    userId: row.user_id,
    startsOn: row.starts_on,
  }));
  const templates: ExpenseTemplate[] = (templatesResult.data ?? []).map((row) => ({
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    description: row.description,
    userId: row.user_id,
  }));
  const categories: CustomCategory[] = (categoriesResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    userId: row.user_id ?? undefined,
  }));

  useExpenseStoreRaw.setState({ expenses });
  useBudgetStoreRaw.setState({ userBudgets: { [userId]: budgets } });
  useRecurringStoreRaw.setState({ templates: recurring });
  useTemplateStoreRaw.setState({ templates });
  useCategoryStoreRaw.setState({ customs: categories });

  const profile = profileResult.data;
  if (profile) {
    useCurrencyStore.setState({ code: profile.currency_code as CurrencyCode });
    useThemeStore.setState({ isDark: profile.is_dark });
  }
  return profile;
}

export function clearUserData() {
  useExpenseStoreRaw.setState({ expenses: [] });
  useBudgetStoreRaw.setState({ userBudgets: {} });
  useRecurringStoreRaw.setState({ templates: [] });
  useTemplateStoreRaw.setState({ templates: [] });
  useCategoryStoreRaw.setState({ customs: [] });
  useCurrencyStore.setState({ code: "NGN" });
  useThemeStore.setState({ isDark: false });
}