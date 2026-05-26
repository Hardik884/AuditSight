"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingDown, Shield, Zap } from "lucide-react";
import { staggerContainer, staggerChild, fadeUp, viewportOnce } from "@/lib/motion";

const spendCategories = [
  { label: "LLM APIs", value: "$62.4k", percent: 62, color: "bg-indigo-400" },
  { label: "Developer tooling", value: "$28.1k", percent: 28, color: "bg-violet-400" },
  { label: "Automation agents", value: "$12.8k", percent: 13, color: "bg-sky-400" },
  { label: "Prompt ops", value: "$8.9k", percent: 9, color: "bg-emerald-400" },
];

const recommendations = [
  {
    title: "Downgrade 41 idle seats across 3 vendors",
    impact: "$12.4k saved",
    confidence: "High",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    icon: TrendingDown,
    iconClass: "text-emerald-500",
  },
  {
    title: "Route 18% of summarization to lower-cost models",
    impact: "$8.1k saved",
    confidence: "Medium",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    icon: Zap,
    iconClass: "text-amber-500",
  },
  {
    title: "Add spend guardrails for internal copilots",
    impact: "$5.9k saved",
    confidence: "High",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    icon: Shield,
    iconClass: "text-indigo-500",
  },
];

const analytics = [
  { label: "Daily active prompts", value: "14.2k", percent: 74, color: "bg-indigo-400" },
  { label: "Model routing efficiency", value: "91%", percent: 91, color: "bg-emerald-400" },
  { label: "Cost per active seat", value: "$142", percent: 58, color: "bg-violet-400" },
];

function AnimatedBar({ percent, color, delay = 0 }: { percent: number; color: string; delay?: number }) {
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

export function AuditInsightsSection() {
  return (
    <section
      id="example-audit"
      className="border-y border-border/40 bg-slate-50/50 py-20 dark:bg-slate-900/20 md:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-6">

        <motion.div
          className="max-w-3xl space-y-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.span
            variants={staggerChild}
            className="inline-flex items-center rounded-full border border-border/70 bg-background px-3.5 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Example audit insights
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl"
          >
            A realistic audit report, delivered instantly.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-slate-500 dark:text-slate-400"
          >
            Preview the depth and clarity executives receive with every AuditSight assessment.
          </motion.p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid gap-5"
          >
            <div className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Total monthly spend
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    $112,300
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-slate-50 px-4 py-3 text-right dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Health score
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">78</p>
                  <p className="mt-0.5 text-xs text-slate-400">Stable</p>
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Potential savings</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">$26.8k</span>
                  </div>
                  <AnimatedBar percent={68} color="bg-emerald-400" delay={0.2} />
                </div>
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Risk exposure</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">Moderate</span>
                  </div>
                  <AnimatedBar percent={42} color="bg-amber-400" delay={0.35} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Spend categories
                </p>
                <span className="text-xs text-slate-400">Last 30 days</span>
              </div>
              <div className="mt-5 space-y-4">
                {spendCategories.map((cat, index) => (
                  <div key={cat.label}>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{cat.label}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{cat.value}</span>
                    </div>
                    <AnimatedBar percent={cat.percent} color={cat.color} delay={0.4 + index * 0.1} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="flex flex-col gap-5"
          >
            <div className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Top recommendations
                </p>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  3 new
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {recommendations.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      variants={staggerChild}
                      className="rounded-xl border border-border/60 bg-slate-50/70 p-4 dark:bg-slate-900/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 shrink-0 ${item.iconClass}`} />
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.badgeClass}`}>
                            {item.confidence} confidence
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {item.impact}
                        </span>
                      </div>
                      <p className="mt-2.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                        {item.title}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <motion.div
              variants={staggerChild}
              className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Usage analytics
              </p>
              <div className="mt-4 space-y-4">
                {analytics.map((row, i) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{row.value}</span>
                    </div>
                    <AnimatedBar percent={row.percent} color={row.color} delay={0.5 + i * 0.1} />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
