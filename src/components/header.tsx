"use client";

import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Moon, Sun, Wallet, Trash2, ChevronDown, Download, Upload, LayoutDashboard, ListOrdered, Target, RefreshCw, Bookmark, BarChart3, User, LogIn, LogOut } from "lucide-react";
import { useThemeStore } from "@/lib/theme-store";
import { useCurrencyStore, CURRENCIES, type CurrencyCode } from "@/lib/currency-store";
import { useExpenseStore } from "@/lib/store";
import { useConfirmStore } from "@/lib/confirm-store";
import { useToastStore } from "@/lib/toast-store";
import { useAuthStore } from "@/lib/auth-store";
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
  "/login": "Sign In",
  "/signup": "Create Account",
};

export function Header() {
  const pathname = usePathname();
  const { isDark, toggle } = useThemeStore();
  const { code: currencyCode, setCode: setCurrency } = useCurrencyStore();
  const expenses = useExpenseStore((s) => s.expenses);
  const clearAll = useExpenseStore((s) => s.clearAll);
  const showConfirm = useConfirmStore((s) => s.show);
  const addToast = useToastStore((s) => s.addToast);
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
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
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Wallet size={18} className="text-white" />
          </Link>
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
              className="flex h-9 items-center gap-1.5 rounded-xl border border-border px-2.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              aria-label="Settings and Profile"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                {currentUser ? currentUser.name[0].toUpperCase() : <User size={14} />}
              </div>
              {currentUser && (
                <span className="hidden sm:inline text-xs font-semibold text-text-primary truncate max-w-[80px]">
                  {currentUser.name.split(" ")[0]}
                </span>
              )}
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-border bg-surface p-1 shadow-lg z-50">
                  {currentUser ? (
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-xs font-bold text-text-primary truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-text-tertiary truncate">{currentUser.email}</p>
                    </div>
                  ) : (
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="text-xs text-text-tertiary">Guest User</p>
                    </div>
                  )}

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

                  {currentUser ? (
                    <button
                      onClick={() => {
                        logout();
                        setShowMenu(false);
                        addToast({ message: "Logged out", type: "info" });
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger/10 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Sign out
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setShowMenu(false)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-primary font-medium hover:bg-primary/10 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <LogIn size={14} />
                      Sign in
                    </Link>
                  )}

                  {expenses.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="w-full rounded-lg px-3 py-2 text-left text-xs text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer flex items-center gap-2 mt-1"
                    >
                      <Trash2 size={12} />
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
