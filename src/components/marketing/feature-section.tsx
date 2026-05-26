"use client";

import { motion } from "framer-motion";
import { TrendingDown, Users, GitBranch, Shield, BarChart3, Brain } from "lucide-react";
import { staggerContainer, staggerChild, fadeUp, viewportOnce } from "@/lib/motion";

const features = [
  {
    title: "Detect wasted AI spend",
    description:
      "Surface unused tokens, idle vendors, and redundant workflows across teams.",
    icon: TrendingDown,
    accent: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/8 dark:bg-emerald-500/10",
    ring: "ring-emerald-500/15",
    tag: "Savings",
    tagClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Monitor seat utilization",
    description:
      "Track license usage and auto-flag overlapping subscriptions or inactive seats.",
    icon: Users,
    accent: "text-indigo-500 dark:text-indigo-400",
    bg: "bg-indigo-500/8 dark:bg-indigo-500/10",
    ring: "ring-indigo-500/15",
    tag: "Governance",
    tagClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Optimize model routing",
    description:
      "Route workloads to the right model tier based on cost, latency, and quality.",
    icon: GitBranch,
    accent: "text-sky-500 dark:text-sky-400",
    bg: "bg-sky-500/8 dark:bg-sky-500/10",
    ring: "ring-sky-500/15",
    tag: "Intelligence",
    tagClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    title: "Prevent spend spikes",
    description:
      "Apply guardrails with budget alerts, thresholds, and anomaly detection.",
    icon: Shield,
    accent: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/8 dark:bg-amber-500/10",
    ring: "ring-amber-500/15",
    tag: "Risk",
    tagClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    title: "Track AI ROI",
    description:
      "Tie usage to outcomes with cost-per-impact metrics and ROI reports.",
    icon: BarChart3,
    accent: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-500/8 dark:bg-violet-500/10",
    ring: "ring-violet-500/15",
    tag: "Analytics",
    tagClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    title: "Budget intelligence",
    description:
      "Forecast quarterly AI spend with scenario modeling and team benchmarks.",
    icon: Brain,
    accent: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500/8 dark:bg-rose-500/10",
    ring: "ring-rose-500/15",
    tag: "Forecasting",
    tagClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="border-t border-border/40 py-20 md:py-28">
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
            Feature highlights
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl md:text-[2.5rem]"
          >
            Spend visibility that feels effortless.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg text-slate-500 dark:text-slate-400"
          >
            AuditSight centralizes usage, cost, and governance in one
            premium workspace so leaders can scale AI responsibly.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={staggerChild}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-background p-6 shadow-sm transition-shadow duration-300 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20"
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-slate-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:to-slate-900/30" />

                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg} ring-1 ${feature.ring}`}>
                    <Icon className={`h-5 w-5 ${feature.accent}`} />
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${feature.tagClass}`}>
                    {feature.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>

                <div className={`mt-auto h-0.5 w-12 rounded-full ${feature.bg} transition-all duration-300 group-hover:w-20`} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
