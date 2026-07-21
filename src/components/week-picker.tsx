"use client";

import { format, addWeeks, subWeeks, startOfWeek, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekPickerProps {
  value: string;
  onChange: (weekStart: string) => void;
}

export function WeekPicker({ value, onChange }: WeekPickerProps) {
  const date = parseISO(value);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const isFuture = weekStart >= currentWeekStart;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(format(subWeeks(weekStart, 1), "yyyy-MM-dd"))}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="min-w-[180px] text-center text-sm font-semibold text-text-primary select-none">
        Week of {format(weekStart, "MMM d, yyyy")}
      </span>
      <button
        onClick={() => onChange(format(addWeeks(weekStart, 1), "yyyy-MM-dd"))}
        disabled={isFuture}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
