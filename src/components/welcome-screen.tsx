"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, Target, TrendingUp, ShieldCheck, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeScreen() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center bg-surface-alt px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary shadow-inner">
          <Wallet size={40} />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
          Welcome to Expense Tracker
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-text-tertiary sm:text-lg">
          Take control of your personal finances. Set monthly budgets, track spending habits, and build smart financial routines.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 text-base px-6">
              <UserPlus size={18} />
              Create New Account
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full gap-2 text-base px-6">
              <LogIn size={18} />
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Target size={20} />
            </div>
            <h3 className="text-sm font-bold text-text-primary">Monthly Budgets</h3>
            <p className="mt-1 text-xs text-text-tertiary">
              Set spending limits per category and track your progress in real time.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-sm font-bold text-text-primary">Daily Analytics</h3>
            <p className="mt-1 text-xs text-text-tertiary">
              Visualize spending trends, averages per day, and category breakdowns.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-text-primary">Private & Secure</h3>
            <p className="mt-1 text-xs text-text-tertiary">
              Your financial records are strictly isolated and saved to your account.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
