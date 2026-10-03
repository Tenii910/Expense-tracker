"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, BarChart3, BellRing,
  Check, ChevronRight, CircleDollarSign, ShieldCheck, Sparkles, Target, Wallet,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const riseIn = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" as const } },
};

export function WelcomeScreen() {
  const backendError = useAuthStore((state) => state.backendError);
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#151221] text-white selection:bg-accent-light selection:text-primary-dark">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div animate={reduceMotion ? undefined : { x: [0, 24, -12, 0], y: [0, -18, 12, 0], scale: [1, 1.08, 0.96, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-48 -top-56 h-[38rem] w-[38rem] rounded-full bg-primary/30 blur-[110px]" />
        <motion.div animate={reduceMotion ? undefined : { x: [0, -30, 16, 0], y: [0, 16, -20, 0] }} transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-44 top-8 h-[32rem] w-[32rem] rounded-full bg-accent/15 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <motion.div animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 110, repeat: Infinity, ease: "linear" }} className="absolute left-[42%] top-24 hidden h-[36rem] w-[36rem] rounded-full border border-white/[0.07] lg:block"><span className="absolute left-16 top-12 h-3 w-3 rounded-full bg-accent-light shadow-[0_0_25px_8px_rgba(52,211,153,.35)]" /></motion.div>
      </div>

      <nav className="mx-auto flex max-w-[1380px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="group flex items-center gap-3">
          <motion.span whileHover={{ rotate: -8, scale: 1.06 }} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-light text-primary-dark shadow-lg shadow-accent/20"><Wallet size={21} strokeWidth={2.5} /></motion.span>
          <span><span className="block text-base font-extrabold tracking-tight">pocketwise</span><span className="block text-[9px] font-bold uppercase tracking-[.24em] text-white/45">money, in motion</span></span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-white/75 transition hover:text-white sm:px-4">Sign in</Link>
          <Link href="/signup" className="group inline-flex items-center gap-2 rounded-xl bg-accent-light px-4 py-2.5 text-sm font-bold text-primary-dark transition hover:bg-accent">Get started <ArrowRight size={15} className="transition group-hover:translate-x-1" /></Link>
        </div>
      </nav>

      {backendError && <div className="mx-auto mt-3 max-w-3xl px-5"><p className="rounded-xl border border-amber-200/20 bg-amber-300/10 p-3 text-sm text-amber-100">Backend setup required: {backendError}</p></div>}

      <section className="mx-auto grid max-w-[1380px] items-center gap-12 px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[1fr_1.02fr] lg:gap-8 lg:px-12 lg:pb-28 lg:pt-20">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="relative z-10">
          <motion.div variants={riseIn} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-xs font-semibold text-white/75 backdrop-blur">
            <motion.span animate={reduceMotion ? undefined : { scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="h-2 w-2 rounded-full bg-accent-light" /> Less guessing. More living.
            <Sparkles size={13} className="text-accent-light" />
          </motion.div>
          <motion.h1 variants={riseIn} className="max-w-2xl text-[3.2rem] font-black leading-[.98] tracking-[-.065em] sm:text-7xl xl:text-[5.6rem]">
            Give your money <span className="relative inline-block text-accent-light">a little
              <motion.svg aria-hidden="true" viewBox="0 0 280 24" className="absolute -bottom-2 left-0 w-full text-accent-light" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.85, duration: 0.8 }}><motion.path d="M4 17C75 2 185 2 275 15" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /></motion.svg>
            </span><br />more direction.
          </motion.h1>
          <motion.p variants={riseIn} className="mt-7 max-w-lg text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">A calmer way to see what comes in, what goes out, and what you can do next. Your whole financial picture, finally in one place.</motion.p>
          <motion.div variants={riseIn} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="group flex items-center justify-center gap-3 rounded-2xl bg-accent-light px-6 py-4 font-extrabold text-primary-dark shadow-xl shadow-accent/15 transition hover:-translate-y-1 hover:bg-accent">Build your money view <ArrowRight size={18} className="transition group-hover:translate-x-1" /></Link>
            <a href="#how-it-works" className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 font-semibold text-white/85 transition hover:bg-white/10">See what you can do <ChevronRight size={16} /></a>
          </motion.div>
          <motion.div variants={riseIn} className="mt-8 flex items-center gap-3 text-xs text-slate-400"><span className="flex -space-x-2">{["bg-primary-light", "bg-accent", "bg-primary", "bg-accent-light"].map((c, i) => <span key={i} className={`h-7 w-7 rounded-full border-2 border-[#151221] ${c}`} />)}</span><span><strong className="text-white">A fresh start,</strong> not another spreadsheet.</span><span className="ml-auto hidden items-center gap-1 sm:flex"><ShieldCheck size={14} className="text-accent-light" /> Private by design</span></motion.div>
        </motion.div>

        <div className="relative mx-auto w-full max-w-[600px] lg:ml-auto">
          <motion.div aria-hidden="true" animate={reduceMotion ? undefined : { rotate: [0, 5, 0], y: [0, -12, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-3 top-8 z-20 hidden rounded-2xl border border-white/15 bg-[#2d2a3e]/90 p-3 shadow-2xl backdrop-blur-xl sm:block"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent-light"><ArrowDownRight size={18} /></span><span><span className="block text-[10px] text-white/50">You saved this month</span><span className="text-sm font-extrabold">₦24,500</span></span><span className="rounded-full bg-accent/10 px-2 py-1 text-[10px] font-bold text-accent-light">+12%</span></div></motion.div>
          <motion.div initial={{ opacity: 0, y: 32, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} whileHover={reduceMotion ? undefined : { y: -5, rotate: -0.4 }} className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#1e1b2e]/90 p-4 shadow-[0_35px_110px_rgba(0,0,0,.45)] backdrop-blur-2xl sm:p-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-light/70 to-transparent" />
            <div className="flex items-center justify-between"><div><p className="text-xs font-medium text-slate-400">Your snapshot</p><p className="mt-1 text-sm font-bold">Monthly overview <span className="font-medium text-slate-500">· October</span></p></div><button className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-bold text-slate-300">This month⌄</button></div>
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#2d2a3e] to-[#1e1b2e] p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs text-slate-400">Money out</p><motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">₦186,420</motion.p></div><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent-light"><CircleDollarSign size={20} /></span></div><div className="mt-4 flex items-center gap-2 text-xs"><span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 font-bold text-accent-light"><ArrowDownRight size={13} /> 8.4%</span><span className="text-slate-500">less than last month</span></div>
              <div className="mt-7 flex h-24 items-end gap-2 sm:h-28">{[35, 52, 42, 75, 58, 92, 67, 48, 83, 61, 100, 72].map((height, i) => <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: 0.35 + i * 0.045, duration: 0.5, ease: "easeOut" }} className={`flex-1 rounded-t-md ${i === 10 ? "bg-accent-light shadow-[0_0_18px_rgba(52,211,153,.3)]" : "bg-white/[0.12]"}`} />)}</div>
              <div className="mt-2 flex justify-between text-[9px] text-slate-500"><span>Oct 01</span><span>Oct 15</span><span>Oct 31</span></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <motion.div whileHover={{ scale: 1.03 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4"><div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">Budget used</span><Target size={14} className="text-accent-light" /></div><p className="mt-2 text-lg font-extrabold">68%</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: "68%" }} transition={{ delay: 1, duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-primary-light to-accent" /></div></motion.div>
              <motion.div whileHover={{ scale: 1.03 }} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4"><div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">Scheduled</span><BellRing size={14} className="text-accent-light" /></div><p className="mt-2 text-lg font-extrabold">₦42,000</p><p className="mt-1 text-[10px] text-slate-500">Next 7 days</p></motion.div>
            </div>
            <motion.div animate={reduceMotion ? undefined : { x: [0, 4, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mt-4 flex items-center gap-3 rounded-2xl border border-accent-light/10 bg-accent/10 p-3"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent-light"><Sparkles size={15} /></span><p className="text-[11px] leading-5 text-slate-300"><strong className="text-accent-light">Nice rhythm.</strong> You’re spending less on takeout this month.</p><BadgeCheck size={15} className="ml-auto shrink-0 text-accent-light" /></motion.div>
          </motion.div>
          <motion.span animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute -bottom-7 -left-6 z-20 hidden h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#2d2a3e] text-accent-light shadow-xl sm:flex"><BarChart3 size={25} /></motion.span>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-white/[0.08] bg-white/[0.025]">
        <div className="mx-auto grid max-w-[1380px] gap-8 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-12">
          {[{ icon: Target, title: "Plan without pressure", text: "Set flexible category budgets that keep your goals in sight." }, { icon: BarChart3, title: "Spot your patterns", text: "Turn everyday purchases into a clear picture of your habits." }, { icon: BellRing, title: "Stay a step ahead", text: "Keep recurring costs and quick-add favorites close at hand." }].map((feature, i) => { const Icon = feature.icon; return <motion.div key={feature.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent-light/10 bg-accent/10 text-accent-light"><Icon size={19} /></span><span><span className="block font-extrabold">{feature.title}</span><span className="mt-1 block max-w-xs text-sm leading-6 text-slate-400">{feature.text}</span></span></motion.div>; })}
        </div>
      </section>

      <section className="mx-auto flex max-w-[1380px] flex-col items-center justify-between gap-5 px-5 py-14 sm:flex-row sm:px-8 lg:px-12">
        <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-accent-light"><Check size={14} /> Your next move starts here</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Feel good about where it goes.</h2></div>
        <Link href="/signup" className="group inline-flex items-center gap-3 rounded-2xl bg-accent-light px-6 py-4 font-extrabold text-primary-dark transition hover:-translate-y-1 hover:bg-accent">Create your free account <ArrowUpRight size={18} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
      </section>
      <footer className="border-t border-white/[0.08] px-5 py-5 text-center text-xs text-slate-500">A little more clarity, one day at a time. <span className="mx-2 text-white/15">•</span> <span className="text-slate-400">Pocketwise</span></footer>
    </main>
  );
}
