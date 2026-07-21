"use client";

import { motion } from "framer-motion";
import { Templates } from "@/components/templates";
import { ToastContainer } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function TemplatesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6 sm:px-6">
        <Templates />
      </main>
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
}
