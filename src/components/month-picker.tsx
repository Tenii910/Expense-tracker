"use client";

import { format, addMonths, subMonths, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthPickerProps {
  value: string;
  onChange: (month: string) => void;
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const date = parseISO(value + "-01");
  const now = new Date();
  const currentMonth = format(now, "yyyy-MM");
  const isFuture = value >= currentMonth;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(format(subMonths(date, 1), "yyyy-MM"))}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="min-w-[140px] text-center text-sm font-semibold text-text-primary select-none">
        {format(date, "MMMM yyyy")}
      </span>
      <button
        onClick={() => onChange(format(addMonths(date, 1), "yyyy-MM"))}
        disabled={isFuture}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
