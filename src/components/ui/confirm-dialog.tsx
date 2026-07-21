"use client";

import { useConfirmStore } from "@/lib/confirm-store";
import { AlertTriangle } from "lucide-react";

export function ConfirmDialog() {
  const { open, title, message, confirmLabel, onConfirm, close } = useConfirmStore();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10">
          <AlertTriangle size={24} className="text-danger" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 text-sm text-text-tertiary">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={close}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              close();
            }}
            className="flex-1 rounded-xl bg-danger px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
