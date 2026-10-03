"use client";

import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { Budgets } from "@/components/budgets";

export default function BudgetsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Target size={20} className="text-primary" />
            Budgets
          </h2>
          <p className="text-sm text-text-tertiary mt-1">
            Set monthly spending targets to stay on track
          </p>
        </motion.div>
        <Budgets />
      </main>
    </div>
  );
}
