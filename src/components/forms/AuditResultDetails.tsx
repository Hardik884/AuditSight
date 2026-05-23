"use client";

import type { AuditResponse, ConfidenceLevel, SeverityLevel } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { CONSULTATION_THRESHOLD } from "@/constants/audit-config";

interface AuditResultDetailsProps {
  status: "idle" | "loading" | "complete";
  auditResponse: AuditResponse | null;
  formatCurrency: (value: number) => string;
  showFullReport?: boolean;
}

// ─── Badge Helpers ────────────────────────────────────────────────────────────

const CONFIDENCE_STYLES: Record<ConfidenceLevel, string> = {
  High: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  Medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  Low: "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700",
};

const SEVERITY_STYLES: Record<SeverityLevel, string> = {
  High: "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
  Medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
  Low: "bg-slate-100 text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700",
};

const ConfidenceBadge = ({ level }: { level: ConfidenceLevel }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${CONFIDENCE_STYLES[level]}`}
  >
    {level} confidence
  </span>
);

const SeverityBadge = ({ level }: { level: SeverityLevel }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_STYLES[level]}`}
  >
    {level} impact
  </span>
);

const TOOL_STATUS_STYLES = {
  optimized:
    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
  action:
    "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AuditResultDetails({
  status,
  auditResponse,
  formatCurrency,
  showFullReport = true,
}: AuditResultDetailsProps) {
  const hasResults = status === "complete" && auditResponse;
  const showDetails = hasResults && showFullReport === true;
  const showConsultationCta =
    hasResults &&
    (auditResponse?.metrics.annualSavings ?? 0) >= CONSULTATION_THRESHOLD;

  const isStackOptimized =
    hasResults && (auditResponse?.metrics.estimatedSavings ?? 0) < 100;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Executive Summary Card ─────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-white via-slate-50 to-slate-100/70 p-6 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.35)] dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-900/70">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Audit summary
            </p>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              {auditResponse ? auditResponse.auditSummary.headline : "—"}
            </p>
          </div>

          {/* ── KPI Grid ───────────────────────────────────────────────────── */}
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-border/60 bg-white/90 px-4 py-3 shadow-sm dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly savings
              </p>
              <p
                className={`mt-2 text-lg font-semibold ${
                  isStackOptimized
                    ? "text-slate-600 dark:text-slate-300"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {auditResponse
                  ? isStackOptimized
                    ? "Cost-efficient"
                    : formatCurrency(auditResponse.metrics.estimatedSavings)
                  : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white/90 px-4 py-3 shadow-sm dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Annual savings
              </p>
              <p
                className={`mt-2 text-lg font-semibold ${
                  isStackOptimized
                    ? "text-slate-600 dark:text-slate-300"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {auditResponse
                  ? isStackOptimized
                    ? "—"
                    : formatCurrency(auditResponse.metrics.annualSavings)
                  : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white/90 px-4 py-3 shadow-sm dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Risk level
              </p>
              <p className="mt-2 text-lg font-semibold text-amber-600 dark:text-amber-400">
                {auditResponse ? auditResponse.metrics.riskLevel : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white/90 px-4 py-3 shadow-sm dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optimization score
              </p>
              <p className="mt-2 text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                {auditResponse ? auditResponse.metrics.optimizationScore : "—"}
              </p>
            </div>
          </div>

          {/* ── Narrative ─────────────────────────────────────────────────── */}
          {auditResponse ? (
            <div
              className={`rounded-2xl border p-4 text-sm shadow-sm ${
                isStackOptimized
                  ? "border-emerald-200/60 bg-emerald-50/50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-200"
                  : "border-border/60 bg-white/90 text-slate-600 dark:bg-slate-900/50 dark:text-slate-300"
              }`}
            >
              {isStackOptimized && (
                <span className="mr-2 inline-block text-base">✓</span>
              )}
              {auditResponse.auditSummary.narrative}
            </div>
          ) : null}

          {/* ── Consultation CTA ───────────────────────────────────────────── */}
          {showConsultationCta ? (
            <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-4 shadow-sm dark:border-emerald-500/30 dark:from-emerald-500/10 dark:via-slate-950 dark:to-slate-900/70">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                    High optimization opportunity detected
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Your organization could benefit from a dedicated AI spend
                    optimization review. Potential annual savings exceed
                    strategic thresholds.
                  </p>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  <a
                    href="https://credex.rocks"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Book a Credex Consultation"
                  >
                    Book a Credex Consultation
                  </a>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Full Report Details ─────────────────────────────────────────────── */}
      {showDetails ? (
        <div className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">

          {/* ── Tool Breakdown ──────────────────────────────────────────────── */}
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Tool breakdown
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {auditResponse?.toolBreakdown?.map((tool) => {
              const isOptimized = tool.projectedSavings === 0;
              return (
                <div
                  key={`${tool.tool}-${tool.plan}`}
                  className="rounded-2xl border border-border/60 bg-background/80 p-4"
                >
                  {/* Tool header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {tool.tool}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {tool.plan} plan · {tool.seatCount}{" "}
                        {tool.seatCount === 1 ? "seat" : "seats"}
                      </p>
                    </div>
                    <span
                      className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isOptimized
                          ? TOOL_STATUS_STYLES.optimized
                          : TOOL_STATUS_STYLES.action
                      }`}
                    >
                      {isOptimized ? "✓ Cost-efficient" : "Action needed"}
                    </span>
                  </div>

                  {/* Spend row */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                    <span>Current spend</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {formatCurrency(tool.monthlySpend)} / mo
                    </span>
                  </div>

                  {/* Savings row — only shown if actionable */}
                  {tool.projectedSavings > 0 && (
                    <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                      <span>Est. savings</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                        {formatCurrency(tool.projectedSavings)} / mo
                      </span>
                    </div>
                  )}

                  {/* Action + rationale */}
                  <div className="mt-3 rounded-xl border border-border/60 bg-white/80 px-3 py-2.5 text-xs dark:bg-slate-950/60">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {tool.recommendedAction}
                    </p>
                    <p className="mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
                      {tool.rationale}
                    </p>
                  </div>

                  {/* Confidence badge (only for actionable) */}
                  {!isOptimized && tool.confidence && (
                    <div className="mt-2.5">
                      <ConfidenceBadge level={tool.confidence} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Recommended Priorities ─────────────────────────────────────── */}
          <p className="mt-8 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Recommended priorities
          </p>
          <div className="mt-4 space-y-3">
            {auditResponse?.recommendations.map((item, i) => (
              <div
                key={`${item.title}-${i}`}
                className={`rounded-2xl border px-4 py-4 text-sm shadow-sm ${
                  item.estimatedSavingsImpact === 0
                    ? "border-emerald-200/50 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5"
                    : "border-border/60 bg-slate-50/70 dark:bg-slate-900/50"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {item.title}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.estimatedSavingsImpact > 0 && (
                      <SeverityBadge level={item.severity} />
                    )}
                    <ConfidenceBadge level={item.confidence} />
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-300">
                  {item.description}
                </p>
                {item.estimatedSavingsImpact > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 dark:text-slate-500">
                      Est. monthly impact:
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.estimatedSavingsImpact)}/mo
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">·</span>
                    <span className="text-slate-400 dark:text-slate-500">
                      Implementation: {item.difficulty}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Governance & Usage Insights ────────────────────────────────── */}
          {auditResponse ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Governance insights
                </p>
                <ul className="mt-3 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  {auditResponse.governanceInsights.map((insight) => (
                    <li key={insight} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-amber-500">›</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Usage insights
                </p>
                <div className="mt-3 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Seat utilization</span>
                    <span
                      className={`font-semibold ${
                        auditResponse.usageInsights.seatUtilizationPercent < 70
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {auditResponse.usageInsights.seatUtilizationPercent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Highest spend</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {auditResponse.usageInsights.highestSpendTool ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Top tools</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {auditResponse.usageInsights.topTools.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/80 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Optimization opportunities
                </p>
                <ul className="mt-3 grid gap-2 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                  {auditResponse.optimizationOpportunities.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 rounded-lg border border-border/60 bg-background/90 px-3 py-2.5"
                    >
                      <span className="mt-0.5 shrink-0 text-indigo-500">›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
