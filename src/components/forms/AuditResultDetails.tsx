"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import type { AuditResponse, ConfidenceLevel, SeverityLevel } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { CONSULTATION_THRESHOLD } from "@/constants/audit-config";
import {
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  Shield,
  Lightbulb,
  CalendarCheck,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { staggerContainer, staggerChild, fadeUp } from "@/lib/motion";
import { AiExecutiveSummaryCard } from "@/components/forms/AiExecutiveSummaryCard";

interface AuditResultDetailsProps {
  status: "idle" | "loading" | "complete";
  auditResponse: AuditResponse | null;
  formatCurrency: (value: number) => string;
  showFullReport?: boolean;
  /** AI-generated executive summary from Gemini (falls back to deterministic template when absent) */
  aiExecutiveSummary?: string;
}

// ── Badge helpers ─────────────────────────────────────────────────────────────

const CONFIDENCE_STYLES: Record<ConfidenceLevel, string> = {
  High: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400",
  Medium: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400",
  Low: "bg-slate-100 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700",
};

const SEVERITY_STYLES: Record<SeverityLevel, string> = {
  High: "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20 dark:text-rose-400",
  Medium: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400",
  Low: "bg-slate-100 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700",
};

const SEVERITY_BORDER: Record<SeverityLevel, string> = {
  High: "border-l-rose-400",
  Medium: "border-l-amber-400",
  Low: "border-l-slate-200 dark:border-l-slate-700",
};

const ConfidenceBadge = ({ level }: { level: ConfidenceLevel }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CONFIDENCE_STYLES[level]}`}>
    {level} confidence
  </span>
);

const SeverityBadge = ({ level }: { level: SeverityLevel }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${SEVERITY_STYLES[level]}`}>
    {level} impact
  </span>
);

// ── Animated count-up metric ──────────────────────────────────────────────────

function CountUpValue({
  value,
  formatter,
}: {
  value: number;
  formatter: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(formatter(0));

  useEffect(() => {
    if (!inView) return;
    const duration = 900;
    const steps = 45;
    const step = duration / steps;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      const progress = Math.min(i / steps, 1);
      // ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(formatter(Math.round(value * eased)));
      if (i >= steps) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [inView, value, formatter]);

  return <span ref={ref}>{display}</span>;
}

// ── Main component ────────────────────────────────────────────────────────────

export function AuditResultDetails({
  status,
  auditResponse,
  formatCurrency,
  showFullReport = true,
  aiExecutiveSummary,
}: AuditResultDetailsProps) {
  const hasResults = status === "complete" && auditResponse;
  const showDetails = hasResults && showFullReport === true;
  const showConsultationCta =
    hasResults &&
    (auditResponse?.metrics.annualSavings ?? 0) >= CONSULTATION_THRESHOLD;

  const isStackOptimized =
    hasResults && (auditResponse?.metrics.estimatedSavings ?? 0) < 100;

  // Surface the AI summary: prefer the prop, then fall back to the auditResponse field
  const resolvedAiSummary = aiExecutiveSummary ?? auditResponse?.aiExecutiveSummary;

  return (
    <div className="flex flex-col gap-6">

      {/* ── AI Executive Summary ───────────────────────────────────────── */}
      {hasResults && (
        <AiExecutiveSummaryCard summary={resolvedAiSummary} />
      )}

      {/* ── Executive Summary ──────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate={hasResults ? "visible" : "hidden"}
        className="rounded-3xl border border-border/60 bg-background p-6 shadow-sm"
      >
        {/* Label */}
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Executive summary
        </p>

        {/* Headline */}
        <div className="mt-3">
          {auditResponse ? (
            <div
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                isStackOptimized
                  ? "border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5"
                  : "border-border/60 bg-slate-50/60 dark:bg-slate-900/30"
              }`}
            >
              {isStackOptimized ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {auditResponse.auditSummary.headline}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {auditResponse.auditSummary.narrative}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          )}
        </div>

        {/* KPI grid */}
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {[
            {
              label: "Monthly savings",
              value: auditResponse
                ? isStackOptimized
                  ? null
                  : auditResponse.metrics.estimatedSavings
                : null,
              display: auditResponse
                ? isStackOptimized
                  ? "Cost-efficient"
                  : null
                : "—",
              icon: TrendingDown,
              color: "text-emerald-600 dark:text-emerald-400",
            },
            {
              label: "Annual savings",
              value: auditResponse
                ? isStackOptimized
                  ? null
                  : auditResponse.metrics.annualSavings
                : null,
              display: auditResponse ? (isStackOptimized ? "—" : null) : "—",
              icon: BarChart3,
              color: "text-emerald-600 dark:text-emerald-400",
            },
            {
              label: "Risk level",
              value: null,
              display: auditResponse ? auditResponse.metrics.riskLevel : "—",
              icon: Shield,
              color: "text-amber-600 dark:text-amber-400",
            },
            {
              label: "Optimization score",
              value: auditResponse ? auditResponse.metrics.optimizationScore : null,
              display: null,
              icon: Lightbulb,
              color: "text-indigo-600 dark:text-indigo-300",
            },
          ].map(({ label, value, display, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-border/60 bg-slate-50/60 px-4 py-3.5 dark:bg-slate-900/40"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${color}`} />
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {label}
                </p>
              </div>
              <p className={`mt-2.5 text-lg font-bold ${color}`}>
                {value !== null ? (
                  <CountUpValue value={value} formatter={formatCurrency} />
                ) : (
                  display ?? "—"
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Consultation CTA */}
        {showConsultationCta && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5 overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50 via-white to-slate-50 dark:border-emerald-500/25 dark:from-emerald-500/8 dark:via-slate-950 dark:to-slate-900/70"
          >
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-400">
                    High optimization opportunity
                  </p>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                    Your projected annual savings exceed strategic thresholds.
                    A dedicated review could unlock additional value.
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="shrink-0 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-500"
              >
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Book a Credex Consultation"
                >
                  Book Consultation
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ── Full Report ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-3xl border border-border/60 bg-background p-6 shadow-sm"
          >
            {/* ── Tool breakdown ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Tool breakdown
              </p>
              <span className="text-xs text-slate-400">
                {auditResponse?.toolBreakdown?.length ?? 0} tools analyzed
              </span>
            </div>

            <motion.div
              className="mt-4 grid gap-4 sm:grid-cols-2"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {auditResponse?.toolBreakdown?.map((tool) => {
                const isOptimized = tool.projectedSavings === 0;
                return (
                  <motion.div
                    key={`${tool.tool}-${tool.plan}`}
                    variants={staggerChild}
                    className={`rounded-2xl border bg-background p-4 ${
                      isOptimized
                        ? "border-emerald-200/50 dark:border-emerald-500/15"
                        : "border-border/60"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {tool.tool}
                        </p>
                        <p className="text-xs text-slate-400">
                          {tool.plan} · {tool.seatCount}{" "}
                          {tool.seatCount === 1 ? "seat" : "seats"}
                        </p>
                      </div>
                      <span
                        className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          isOptimized
                            ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20 dark:text-rose-400"
                        }`}
                      >
                        {isOptimized ? "✓ Cost-efficient" : "Action needed"}
                      </span>
                    </div>

                    {/* Spend / savings */}
                    <div className="mt-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Current spend</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {formatCurrency(tool.monthlySpend)}/mo
                        </span>
                      </div>
                      {tool.projectedSavings > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Est. savings</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(tool.projectedSavings)}/mo
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Rationale box */}
                    <div className="mt-3.5 rounded-xl border border-border/60 bg-slate-50/80 px-3.5 py-3 dark:bg-slate-950/50">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {tool.recommendedAction}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {tool.rationale}
                      </p>
                    </div>

                    {!isOptimized && tool.confidence && (
                      <div className="mt-3">
                        <ConfidenceBadge level={tool.confidence} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* ── Recommendations ─────────────────────────────────────────── */}
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Recommended priorities
              </p>
              <span className="text-xs text-slate-400">
                {auditResponse?.recommendations.length ?? 0} actions
              </span>
            </div>

            <motion.div
              className="mt-4 space-y-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {auditResponse?.recommendations.map((item, i) => (
                <motion.div
                  key={`${item.title}-${i}`}
                  variants={staggerChild}
                  className={`rounded-2xl border-l-4 border border-border/60 px-4 py-4 text-sm ${SEVERITY_BORDER[item.severity]} ${
                    item.estimatedSavingsImpact === 0
                      ? "bg-emerald-50/40 dark:bg-emerald-500/5"
                      : "bg-background"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.estimatedSavingsImpact > 0 && (
                        <SeverityBadge level={item.severity} />
                      )}
                      <ConfidenceBadge level={item.confidence} />
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                  {item.estimatedSavingsImpact > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>Est. monthly impact:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.estimatedSavingsImpact)}/mo
                      </span>
                      <span>·</span>
                      <span>Implementation: {item.difficulty}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* ── Governance + Usage insights ──────────────────────────────── */}
            {auditResponse && (
              <motion.div
                className="mt-7 grid gap-4 sm:grid-cols-2"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Governance */}
                <motion.div
                  variants={staggerChild}
                  className="rounded-2xl border border-border/60 bg-slate-50/60 p-4 dark:bg-slate-900/30"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-amber-500" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Governance insights
                    </p>
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    {auditResponse.governanceInsights.map((insight) => (
                      <li key={insight} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Usage */}
                <motion.div
                  variants={staggerChild}
                  className="rounded-2xl border border-border/60 bg-slate-50/60 p-4 dark:bg-slate-900/30"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Usage insights
                    </p>
                  </div>
                  <div className="mt-3 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Seat utilization</span>
                      <span
                        className={`font-bold ${
                          auditResponse.usageInsights.seatUtilizationPercent < 70
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {auditResponse.usageInsights.seatUtilizationPercent}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Highest spend</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {auditResponse.usageInsights.highestSpendTool ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Top tools</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {auditResponse.usageInsights.topTools.join(", ")}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Optimization opportunities */}
                <motion.div
                  variants={staggerChild}
                  className="rounded-2xl border border-border/60 bg-slate-50/60 p-4 dark:bg-slate-900/30 sm:col-span-2"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-indigo-500" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Optimization opportunities
                    </p>
                  </div>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {auditResponse.optimizationOpportunities.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-300"
                      >
                        <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
