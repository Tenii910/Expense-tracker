"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { getCategoryColor } from "@/lib/types";
import { useAllCategories, useCategoryStore } from "@/lib/category-store";

interface ExpenseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategories: string[];
  onCategoryToggle: (category: string) => void;
  onToggleAll: () => void;
}

export function ExpenseFilters({
  search,
  onSearchChange,
  selectedCategories,
  onCategoryToggle,
  onToggleAll,
}: ExpenseFiltersProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const categories = useAllCategories();
  const customs = useCategoryStore((s) => s.customs);
  const allSelected = selectedCategories.length === categories.length;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
        <input
          type="text"
          placeholder='Search expenses...  (press "/")'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          ref={inputRef}
          className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-9 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={onToggleAll}
          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors cursor-pointer ${
            allSelected
              ? "bg-primary/10 border-primary/30 text-primary"
              : "border-border text-text-tertiary hover:text-text-secondary"
          }`}
        >
          All
        </button>
        {categories.map((cat) => {
          const active = selectedCategories.includes(cat);
          const custom = customs.find((c) => c.name === cat);
          const color = custom?.color ?? getCategoryColor(cat);
          return (
            <button
              key={cat}
              onClick={() => onCategoryToggle(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors cursor-pointer ${
                active
                  ? "text-white border-transparent"
                  : "border-border text-text-tertiary hover:text-text-secondary"
              }`}
              style={
                active ? { backgroundColor: color } : undefined
              }
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
