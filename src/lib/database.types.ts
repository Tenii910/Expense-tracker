export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type TimestampColumns = {
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        TimestampColumns & {
          id: string;
          email: string;
          display_name: string;
          currency_code: "NGN" | "USD" | "EUR" | "GBP" | "GHS";
          is_dark: boolean;
        },
        {
          id: string;
          email: string;
          display_name: string;
          currency_code?: "NGN" | "USD" | "EUR" | "GBP" | "GHS";
          is_dark?: boolean;
          created_at?: string;
          updated_at?: string;
        },
        {
          display_name?: string;
          currency_code?: "NGN" | "USD" | "EUR" | "GBP" | "GHS";
          is_dark?: boolean;
          email?: string;
          updated_at?: string;
        }
      >;
      categories: Table<
        {
          id: string;
          user_id: string | null;
          name: string;
          color: string;
          is_system: boolean;
          created_at: string;
        },
        {
          id?: string;
          user_id?: string | null;
          name: string;
          color: string;
          is_system?: boolean;
          created_at?: string;
        },
        {
          user_id?: string | null;
          name?: string;
          color?: string;
          is_system?: boolean;
        }
      >;
      expenses: Table<
        TimestampColumns & {
          id: string;
          user_id: string;
          amount: number;
          category: string;
          description: string;
          spent_on: string;
          pinned: boolean;
          recurring_id: string | null;
          occurrence_date: string | null;
        },
        {
          id?: string;
          user_id?: string;
          amount: number;
          category: string;
          description?: string;
          spent_on?: string;
          pinned?: boolean;
          recurring_id?: string | null;
          occurrence_date?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        {
          amount?: number;
          category?: string;
          description?: string;
          spent_on?: string;
          pinned?: boolean;
          recurring_id?: string | null;
          occurrence_date?: string | null;
          updated_at?: string;
        }
      >;
      budgets: Table<
        TimestampColumns & {
          id: string;
          user_id: string;
          category: string;
          amount: number;
        },
        {
          id?: string;
          user_id?: string;
          category: string;
          amount: number;
          created_at?: string;
          updated_at?: string;
        },
        { category?: string; amount?: number; updated_at?: string }
      >;
      recurring_expenses: Table<
        TimestampColumns & {
          id: string;
          user_id: string;
          amount: number;
          category: string;
          description: string;
          frequency: "weekly" | "monthly";
          day_of_month: number | null;
          day_of_week: number | null;
          active: boolean;
          starts_on: string;
        },
        {
          id?: string;
          user_id?: string;
          amount: number;
          category: string;
          description?: string;
          frequency: "weekly" | "monthly";
          day_of_month?: number | null;
          day_of_week?: number | null;
          active?: boolean;
          starts_on?: string;
          created_at?: string;
          updated_at?: string;
        },
        {
          amount?: number;
          category?: string;
          description?: string;
          frequency?: "weekly" | "monthly";
          day_of_month?: number | null;
          day_of_week?: number | null;
          active?: boolean;
          starts_on?: string;
          updated_at?: string;
        }
      >;
      expense_templates: Table<
        TimestampColumns & {
          id: string;
          user_id: string;
          amount: number;
          category: string;
          description: string;
        },
        {
          id?: string;
          user_id?: string;
          amount: number;
          category: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        },
        { amount?: number; category?: string; description?: string; updated_at?: string }
      >;
    };
    Views: {
      monthly_expense_summary: {
        Row: {
          user_id: string;
          month_start: string;
          total_amount: number;
          expense_count: number;
        };
        Relationships: [];
      };
      category_expense_summary: {
        Row: {
          user_id: string;
          category: string;
          total_amount: number;
          expense_count: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      generate_recurring_expenses: {
        Args: { p_through_date?: string; p_user_id?: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
