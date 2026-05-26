"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingDown, Shield, Zap } from "lucide-react";
import {
  fadeUp,
  staggerContainer,
  slideInRight,
  scaleIn,
  viewportOnce,
} from "@/lib/motion";

const trustLogos = ["OpenAI", "Anthropic", "Cursor", "GitHub Copilot", "Gemini", "Windsurf"];

const insightCards = [
  {
    badge: "Savings",
    badgeClass: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
    text: "Route 23% of summarization traffic to lower-cost models",
    icon: TrendingDown,
    iconClass: "text-emerald-400",
  },
  {
    badge: "Overlap",
    badgeClass: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
    text: "Consolidate overlapping vendor seats across 4 teams",
    icon: Shield,
    iconClass: "text-amber-400",
  },
  {
    badge: "Governance",
    badgeClass: "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20",
    text: "Enforce spend guardrails on high-variance prompt workloads",
    icon: Zap,
    iconClass: "text-indigo-400",
  },
];

function AnimatedBar({ value, delay = 0 }: { value: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, viewportOnce);

  return (
    <div ref={ref} className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="h-2 rounded-full bg-indigo-400"
        initial={{ width: 0 }}
        animate={inView ? { width: `${value}%` } : { width: 0 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      />
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 dot-grid opacity-40" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/8 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 -z-10 h-[400px] w-[400px] rounded-full bg-violet-500/6 blur-3xl" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-16 pt-12 md:pt-16 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

          <motion.div
            className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={scaleIn}>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/8 px-4 py-2 text-xs font-semibold text-indigo-600 ring-1 ring-indigo-500/10 dark:text-indigo-400">
                <Sparkles className="h-3 w-3" />
                Audit-ready AI spend intelligence
              </span>
            </motion.div>

            <motion.div variants={fadeUp} className="max-w-xl space-y-4">
              <h1 className="text-balance text-[2.75rem] font-bold leading-[1.08] tracking-[-0.04em] text-slate-900 dark:text-slate-50 sm:text-5xl md:text-[3.5rem]">
                See where your{" "}
                <span className="gradient-text">AI stack</span>{" "}
                leaks money.
              </h1>
              <p className="text-pretty text-lg leading-relaxed text-slate-500 dark:text-slate-400 sm:text-xl">
                AuditSight unifies usage, cost, and governance so modern
                teams can scale AI adoption with confidence — not guesswork.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center gap-3 sm:flex-row lg:items-start"
            >
              <Button
                asChild
                size="lg"
                className="group inline-flex items-center gap-2 bg-slate-900 px-6 text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:bg-slate-700 hover:shadow-xl hover:shadow-slate-900/25 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <Link href="/audit">
                  Generate Free Audit
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border/70 px-6 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
              >
                <Link href="#example-audit">View Sample Report</Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center justify-center gap-5 border-t border-border/50 pt-5 lg:justify-start"
            >
              {[
                { label: "Avg. monthly savings", value: "$8.4k" },
                { label: "Time to first insight", value: "< 2 min" },
                { label: "Rule-based confidence", value: "High" },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="w-full"
          >
            <div className="relative w-full rounded-3xl border border-border/50 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 shadow-2xl shadow-black/25 ring-1 ring-white/5">
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/15 blur-3xl" />
              <div className="absolute -bottom-8 left-8 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-slate-950/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-3 text-xs text-slate-500">AuditSight — Spend Analysis</span>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/5 bg-white/3 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                        Monthly spend
                      </p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-white">
                        $128,450
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        +18% MoM
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/6 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-600 dark:text-emerald-500">
                        Potential savings
                      </p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-400">
                        $34,200
                      </p>
                      <span className="mt-1 inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        26% reduction
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Budget utilization</span>
                      <span className="font-semibold text-slate-300">82%</span>
                    </div>
                    <AnimatedBar value={82} />
                  </div>

                  <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                    {insightCards.map((card, i) => {
                      const Icon = card.icon;
                      return (
                        <motion.div
                          key={card.badge}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + i * 0.12, duration: 0.4 }}
                          className="rounded-xl border border-white/5 bg-white/3 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${card.badgeClass}`}>
                              {card.badge}
                            </span>
                            <Icon className={`h-3.5 w-3.5 ${card.iconClass}`} />
                          </div>
                          <p className="mt-2.5 text-[11px] leading-relaxed text-slate-300">
                            {card.text}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">
            Trusted by teams building with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {trustLogos.map((name) => (
              <span
                key={name}
                className="text-sm font-semibold text-slate-400 opacity-60 transition-opacity hover:opacity-90 dark:text-slate-500"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
