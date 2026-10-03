"use client";

import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToastStore } from "@/lib/toast-store";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: "border-l-accent",
  error: "border-l-danger",
  info: "border-l-primary",
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  const centeredToasts = toasts.filter((toast) => toast.placement === "center");
  const cornerToasts = toasts.filter((toast) => toast.placement !== "center");
  if (toasts.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100] flex w-[calc(100%-3rem)] max-w-sm flex-col gap-2">
      {cornerToasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-xl border-l-4 animate-in slide-in-from-right ${colors[toast.type]}`}
          >
            <Icon size={18} className="mt-0.5 shrink-0 text-text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary">{toast.message}</p>
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action!.onClick();
                    removeToast(toast.id);
                  }}
                  className="mt-1.5 text-xs font-semibold text-primary hover:text-primary-light transition-colors cursor-pointer"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-lg p-0.5 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
      </div>
      <AnimatePresence>
        {centeredToasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-5 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => removeToast(toast.id)}
            >
              <motion.section
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={`toast-title-${toast.id}`}
                initial={{ opacity: 0, y: 24, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 320, damping: 25 }}
                className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/60 bg-surface p-8 text-center shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  onClick={() => removeToast(toast.id)}
                  aria-label="Close alert"
                  className="absolute right-5 top-5 rounded-full p-2 text-text-tertiary transition hover:bg-surface-hover hover:text-text-primary"
                >
                  <X size={17} />
                </button>
                <motion.div
                  initial={{ scale: 0.5, rotate: -18 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.08, type: "spring", stiffness: 300, damping: 15 }}
                  className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.6rem] ${toast.type === "success" ? "bg-accent/10 text-accent" : toast.type === "error" ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary"}`}
                >
                  <Icon size={38} strokeWidth={1.8} />
                </motion.div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.24em] text-text-tertiary">
                  {toast.type === "success" ? "All set" : toast.type === "error" ? "Something went wrong" : "Notice"}
                </p>
                <h2 id={`toast-title-${toast.id}`} className="text-2xl font-bold tracking-tight text-text-primary">
                  {toast.message}
                </h2>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-text-secondary">
                  {toast.type === "success" ? "Your account is ready. You can continue to your personal finance space." : "Review the message and try again."}
                </p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="mt-7 w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-light"
                >
                  Continue
                </button>
              </motion.section>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </>
  );
}
