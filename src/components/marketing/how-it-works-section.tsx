"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import { staggerContainer, staggerChild, fadeUp, viewportOnce } from "@/lib/motion";

const steps = [
  {
    number: "01",
    title: "Connect your AI stack",
    description:
      "Enter your AI tools, plans, monthly spend, and seat counts. Takes under two minutes.",
    accent: "from-indigo-500/20 to-indigo-600/10",
    ring: "ring-indigo-500/20",
    dot: "bg-indigo-500",
  },
  {
    number: "02",
    title: "Analyze usage and spend",
    description:
      "AuditSight's rule-based engine normalizes your data and highlights cost drivers.",
    accent: "from-violet-500/20 to-violet-600/10",
    ring: "ring-violet-500/20",
    dot: "bg-violet-500",
  },
  {
    number: "03",
    title: "Receive optimization insights",
    description:
      "Get prioritized savings, seat recommendations, and governance guidance — instantly.",
    accent: "from-emerald-500/20 to-emerald-600/10",
    ring: "ring-emerald-500/20",
    dot: "bg-emerald-500",
  },
];

const spendCategories = [
  { label: "LLM APIs", value: "$62.4k", percent: 62, color: "bg-indigo-400" },
  { label: "Developer tooling", value: "$28.1k", percent: 28, color: "bg-violet-400" },
  { label: "Automation agents", value: "$12.8k", percent: 13, color: "bg-sky-400" },
  { label: "Prompt ops", value: "$8.9k", percent: 9, color: "bg-emerald-400" },
];

function AnimatedProgressBar({ percent, color, delay = 0 }: { percent: number; color: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, viewportOnce);
  return (
    <div ref={ref} className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <motion.div
        className={`h-1.5 rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={inView ? { width: `${percent}%` } : { width: 0 }}
        transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      />
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-border/40 py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-6">

        <motion.div
          className="max-w-2xl space-y-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.span
            variants={staggerChild}
            className="inline-flex items-center rounded-full border border-border/70 bg-background px-3.5 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            How it works
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl"
          >
            Go from setup to savings in three steps.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-slate-500 dark:text-slate-400"
          >
            We make onboarding painless while keeping everything audit-ready and executive-friendly.
          </motion.p>
        </motion.div>

        <motion.div
          className="relative mt-12 grid gap-6 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className="absolute inset-x-12 top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              variants={staggerChild}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-border/60 bg-background p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${step.accent} ring-1 ${step.ring}`}>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {step.number}
                  </span>
                </div>
                <span className={`h-2 w-2 rounded-full ${step.dot}`} />
              </div>

              <div>
                <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {step.description}
                </p>
              </div>

              {i < steps.length - 1 && (
                <ArrowRight className="absolute right-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-300 dark:text-slate-600 md:block" />
              )}
              {i === steps.length - 1 && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Insights ready
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-14 rounded-2xl border border-border/60 bg-slate-50/70 p-6 dark:bg-slate-900/40"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Spend breakdown preview
            </p>
            <span className="text-xs text-slate-400">Example audit output</span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {spendCategories.map((cat, i) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{cat.label}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{cat.value}</span>
                </div>
                <AnimatedProgressBar percent={cat.percent} color={cat.color} delay={i * 0.1} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
