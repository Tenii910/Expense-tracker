"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Recurring } from "@/components/recurring";

export default function RecurringPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-alt">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-6 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <RefreshCw size={20} className="text-primary" />
            Recurring
          </h2>
          <p className="text-sm text-text-tertiary mt-1">
            Manage your recurring expenses like rent and subscriptions
          </p>
        </motion.div>
        <Recurring />
      </main>
    </div>
  );
}
