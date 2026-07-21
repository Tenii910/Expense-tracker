import { create } from "zustand";

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: (() => void) | null;
  show: (opts: { title: string; message: string; confirmLabel?: string; onConfirm: () => void }) => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  open: false,
  title: "",
  message: "",
  confirmLabel: "Confirm",
  onConfirm: null,
  show: ({ title, message, confirmLabel = "Confirm", onConfirm }) =>
    set({ open: true, title, message, confirmLabel, onConfirm }),
  close: () => set({ open: false, onConfirm: null }),
}));
