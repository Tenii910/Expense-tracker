export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
  pinned?: boolean;
  userId?: string;
}

export type Category = string;

export const DEFAULT_CATEGORIES: string[] = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

const DEFAULT_COLORS: Record<string, string> = {
  Food: "#EF4444",
  Transport: "#F59E0B",
  Shopping: "#8B5CF6",
  Bills: "#3B82F6",
  Entertainment: "#EC4899",
  Health: "#10B981",
  Education: "#6366F1",
  Other: "#6B7280",
};

export function getCategoryColor(category: string, customColors?: Record<string, string>): string {
  if (customColors?.[category]) return customColors[category];
  return DEFAULT_COLORS[category] ?? "#6B7280";
}

export function getCategories(customs: string[] = []): string[] {
  return [...DEFAULT_CATEGORIES, ...customs];
}

export interface ExpenseFormData {
  amount: number;
  category: string;
  description: string;
  date: string;
}

export const CATEGORY_COLORS: Record<string, string> = DEFAULT_COLORS;
