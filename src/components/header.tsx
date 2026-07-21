"use client";

import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Moon, Sun, Wallet, Trash2, ChevronDown, Download, Upload, LayoutDashboard, ListOrdered, Target, RefreshCw, Bookmark, BarChart3 } from "lucide-react";
import { useThemeStore } from "@/lib/theme-store";
import { useCurrencyStore, CURRENCIES, type CurrencyCode } from "@/lib/currency-store";
import { useExpenseStore } from "@/lib/store";
import { useConfirmStore } from "@/lib/confirm-store";
import { useToastStore } from "@/lib/toast-store";
import { createBackup, restoreBackup } from "@/lib/backup";
import { ImportButton } from "./import-button";
import { CategoryManager } from "./category-manager";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: ListOrdered },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/recurring", label: "Recurring", icon: RefreshCw },
  { href: "/templates", label: "Templates", icon: Bookmark },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/expenses": "Expenses",
  "/budgets": "Budgets",
  "/recurring": "Recurring",
  "/templates": "Templates",
  "/analytics": "Analytics",
};

export function Header() {
  const pathname = usePathname();
  const { isDark, toggle } = useThemeStore();
  const { code: currencyCode, setCode: setCurrency } = useCurrencyStore();
  const expenses = useExpenseStore((s) => s.expenses);
  const clearAll = useExpenseStore((s) => s.clearAll);
  const showConfirm = useConfirmStore((s) => s.show);
  const addToast = useToastStore((s) => s.addToast);
  const [showMenu, setShowMenu] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const restoreRef = useRef<HTMLInputElement>(null);

  const pageTitle = PAGE_TITLES[pathname] ?? "Expense Tracker";

  function handleRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const result = restoreBackup(text);
      addToast({ message: result.message, type: result.success ? "success" : "error" });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleClearAll() {
    setShowMenu(false);
    showConfirm({
      title: "Clear all expenses?",
      message: `This will permanently delete all ${expenses.length} expense${expenses.length !== 1 ? "s" : ""}.`,
      confirmLabel: "Delete All",
      onConfirm: () => {
        clearAll();
        addToast({ message: "All expenses cleared", type: "info" });
      },
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Wallet size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary leading-tight">
              {pageTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-1 mr-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-text-tertiary hover:text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="relative">
            <button
              onClick={() => setShowCurrency(!showCurrency)}
              className="flex h-9 items-center gap-1 rounded-xl border border-border px-3 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              {CURRENCIES[currencyCode].symbol}
              <ChevronDown size={12} />
            </button>
            {showCurrency && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCurrency(false)} />
                <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-border bg-surface p-1 shadow-lg z-50">
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        setShowCurrency(false);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                        c === currencyCode
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-text-primary hover:bg-surface-hover"
                      }`}
                    >
                      <span className="w-5 text-center">{CURRENCIES[c].symbol}</span>
                      {CURRENCIES[c].name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label="Settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-border bg-surface p-1 shadow-lg z-50">
                  <div className="px-3 py-2 text-xs font-medium text-text-tertiary border-b border-border mb-1">
                    {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
                  </div>
                  <ImportButton />
                  <CategoryManager />
                  <button
                    onClick={() => {
                      createBackup();
                      setShowMenu(false);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Download size={14} />
                    Backup data
                  </button>
                  <input
                    ref={restoreRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleRestore}
                  />
                  <button
                    onClick={() => restoreRef.current?.click()}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-hover transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Upload size={14} />
                    Restore data
                  </button>
                  <div className="border-t border-border my-1" />
                  {expenses.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger/10 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Clear all data
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      <nav className="flex md:hidden items-center gap-1 px-4 pb-2 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-text-tertiary hover:text-text-primary hover:bg-surface-hover"
              }`}
            >
              <Icon size={14} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
