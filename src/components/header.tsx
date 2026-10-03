"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3, Bookmark, Download, LayoutDashboard, LogOut, Moon, RefreshCw,
  Settings2, Sun, Target, Trash2, Upload, Wallet,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useThemeStore } from "@/lib/theme-store";
import { useExpenseStore } from "@/lib/store";
import { useToastStore } from "@/lib/toast-store";
import { useConfirmStore } from "@/lib/confirm-store";
import { createBackup, restoreBackup } from "@/lib/backup";
import { ImportButton } from "@/components/import-button";
import { CategoryManager } from "@/components/category-manager";
import { showBackendError } from "@/lib/backend-errors";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard, hint: "Your money at a glance" },
  { href: "/expenses", label: "Transactions", icon: Wallet, hint: "Review every expense" },
  { href: "/budgets", label: "Budgets", icon: Target, hint: "Plan monthly limits" },
  { href: "/recurring", label: "Recurring", icon: RefreshCw, hint: "Manage scheduled costs" },
  { href: "/templates", label: "Templates", icon: Bookmark, hint: "Quick-add favorites" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, hint: "Explore spending trends" },
] as const;

export function Header() {
  const pathname = usePathname();
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const { isDark, toggle } = useThemeStore();
  const expenses = useExpenseStore((state) => state.expenses);
  const clearAll = useExpenseStore((state) => state.clearAll);
  const showConfirm = useConfirmStore((state) => state.show);
  const addToast = useToastStore((state) => state.addToast);
  const [menuOpen, setMenuOpen] = useState(false);
  const restoreRef = useRef<HTMLInputElement>(null);

  if (!currentUser || pathname === "/login" || pathname === "/signup") return null;

  function handleRestore(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      const result = await restoreBackup(String(loadEvent.target?.result ?? ""));
      addToast({ message: result.message, type: result.success ? "success" : "error" });
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function handleClearAll() {
    setMenuOpen(false);
    showConfirm({
      title: "Clear all expenses?",
      message: `This will permanently delete all ${expenses.length} expense${expenses.length === 1 ? "" : "s"}.`,
      confirmLabel: "Delete all",
      onConfirm: () => void clearAll().then(() => {
        addToast({ message: "All expenses cleared", type: "info" });
      }).catch(showBackendError),
    });
  }

  const accountTools = (
    <>
      <ImportButton />
      <CategoryManager />
      <button
        onClick={() => { createBackup(); setMenuOpen(false); }}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
      >
        <Download size={16} /> Backup data
      </button>
      <input ref={restoreRef} type="file" accept=".json" className="hidden" onChange={handleRestore} />
      <button
        onClick={() => restoreRef.current?.click()}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
      >
        <Upload size={16} /> Restore backup
      </button>
      {expenses.length > 0 && (
        <button onClick={handleClearAll} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-danger transition hover:bg-danger/10">
          <Trash2 size={16} /> Clear all expenses
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/70 bg-surface px-4 py-6 md:flex">
        <Link href="/" className="mb-10 flex items-center gap-3 px-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <Wallet size={21} />
          </span>
          <span>
            <span className="block text-base font-extrabold tracking-tight text-text-primary">pocketwise</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">personal finance</span>
          </span>
        </Link>

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary">Workspace</p>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.hint}
                className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${active ? "bg-primary text-white shadow-lg shadow-primary/15" : "text-text-secondary hover:translate-x-0.5 hover:bg-surface-hover hover:text-text-primary"}`}
              >
                <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: index * 0.04 }}>
                  <Icon size={18} />
                </motion.span>
                {item.label}
                {active && <motion.span layoutId="active-nav-dot" className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-light" />}
              </Link>
            );
          })}
        </nav>

        <div className="mb-4 rounded-2xl border border-border bg-surface-alt p-3">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-text-tertiary">
            <Settings2 size={13} /> Account tools
          </p>
          <div className="space-y-0.5">{accountTools}</div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-sm font-extrabold text-accent">
            {currentUser.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-text-primary">{currentUser.name}</span>
            <span className="block truncate text-xs text-text-tertiary">{currentUser.email}</span>
          </span>
          <button aria-label="Sign out" title="Sign out" onClick={() => void logout().catch(showBackendError)} className="rounded-xl p-2 text-text-tertiary transition hover:bg-danger/10 hover:text-danger">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-surface/90 px-4 py-3 backdrop-blur-xl md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white"><Wallet size={18} /></span>
          <span className="font-extrabold tracking-tight text-text-primary">pocketwise</span>
        </Link>
        <div className="flex items-center gap-2">
          <button aria-label="Toggle dark mode" onClick={() => void toggle().catch(showBackendError)} className="rounded-xl border border-border p-2 text-text-secondary">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button onClick={() => setMenuOpen((open) => !open)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 font-bold text-accent">
            {currentUser.name.slice(0, 1).toUpperCase()}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-3 top-14 z-50 w-72 rounded-2xl border border-border bg-surface p-3 shadow-2xl">
              <div className="mb-2 border-b border-border px-2 pb-3">
                <p className="font-bold text-text-primary">{currentUser.name}</p>
                <p className="text-xs text-text-tertiary">{currentUser.email}</p>
              </div>
              <div className="space-y-0.5">{accountTools}</div>
              <button onClick={() => void logout().catch(showBackendError)} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-danger hover:bg-danger/10">
                <LogOut size={16} /> Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Compact persistent mobile navigation */}
      <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-border/70 bg-surface/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} aria-label={item.label} className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[9px] font-bold ${active ? "text-primary" : "text-text-tertiary"}`}>
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              <span className="truncate">{item.label === "Transactions" ? "Spend" : item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
