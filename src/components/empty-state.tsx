"use client";

import { motion } from "framer-motion";
import { Receipt } from "lucide-react";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-alt"
      >
        <Receipt size={32} className="text-text-tertiary" />
      </motion.div>
      <h3 className="text-lg font-semibold text-text-primary">No expenses yet</h3>
      <p className="mt-1 text-sm text-text-tertiary max-w-xs">
        Tap the button above to add your first expense and start tracking.
      </p>
    </motion.div>
  );
}
