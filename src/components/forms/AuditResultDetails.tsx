import type { AuditResponse } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { CONSULTATION_THRESHOLD } from "@/constants/audit-config";

interface AuditResultDetailsProps {
  status: "idle" | "loading" | "complete";
  auditResponse: AuditResponse | null;
  formatCurrency: (value: number) => string;
  showFullReport?: boolean;
}

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

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-white via-slate-50 to-slate-100/70 p-6 shadow-[0_24px_80px_-50px_rgba(15,23,42,0.35)] dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-900/70">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Audit summary
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {auditResponse ? auditResponse.auditSummary.headline : "—"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-border/60 bg-white/90 px-4 py-3 shadow-sm dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly savings</p>
              <p className="mt-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {auditResponse
                  ? formatCurrency(auditResponse.metrics.estimatedSavings)
                  : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white/90 px-4 py-3 shadow-sm dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">Annual savings</p>
              <p className="mt-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {auditResponse
                  ? formatCurrency(auditResponse.metrics.annualSavings)
                  : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white/90 px-4 py-3 shadow-sm dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">Risk level</p>
              <p className="mt-2 text-lg font-semibold text-amber-600 dark:text-amber-400">
                {auditResponse ? auditResponse.metrics.riskLevel : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white/90 px-4 py-3 shadow-sm dark:bg-slate-900/60">
              <p className="text-xs text-slate-500 dark:text-slate-400">Optimization score</p>
              <p className="mt-2 text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                {auditResponse ? auditResponse.metrics.optimizationScore : "—"}
              </p>
            </div>
          </div>

          {auditResponse ? (
            <div className="rounded-2xl border border-border/60 bg-white/90 p-4 text-sm text-slate-600 shadow-sm dark:bg-slate-900/50 dark:text-slate-300">
              {auditResponse.auditSummary.narrative}
            </div>
          ) : null}

          {showConsultationCta ? (
            <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-4 shadow-sm dark:border-emerald-500/30 dark:from-emerald-500/10 dark:via-slate-950 dark:to-slate-900/70">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                    High optimization opportunity detected
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Your organization could benefit from a dedicated AI spend optimization
                    review. Potential annual savings exceed strategic thresholds.
                  </p>
                </div>
                <Button asChild size="lg" className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-500">
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

      {showDetails ? (
        <div className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Tool breakdown
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {auditResponse?.toolBreakdown?.map((tool) => (
              <div
                key={`${tool.tool}-${tool.plan}`}
                className="rounded-2xl border border-border/60 bg-background/80 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {tool.tool}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {tool.plan} plan
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {tool.seatCount} seats
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                  <span>Current spend</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {formatCurrency(tool.monthlySpend)} / mo
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                  <span>Projected savings</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                    {formatCurrency(tool.projectedSavings)} / mo
                  </span>
                </div>
                <div className="mt-3 rounded-xl border border-border/60 bg-white/80 px-3 py-2 text-xs text-slate-600 dark:bg-slate-950/60 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {tool.recommendedAction}
                  </p>
                  <p className="mt-1">{tool.rationale}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Recommended priorities
          </p>
          <div className="mt-4 space-y-3">
            {auditResponse?.recommendations.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border/60 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 shadow-sm dark:bg-slate-900/50 dark:text-slate-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {item.title}
                  </span>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                    {item.confidence} confidence
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                  {item.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-300">
                  <span>Impact: {formatCurrency(item.estimatedSavingsImpact)}</span>
                  <span>Severity: {item.severity}</span>
                </div>
              </div>
            ))}
          </div>

          {auditResponse ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Governance insights
                </p>
                <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {auditResponse.governanceInsights.map((insight) => (
                    <li key={insight}>{insight}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Usage insights
                </p>
                <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Seat utilization</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
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
                    <li key={item} className="rounded-lg border border-border/60 bg-background/90 px-3 py-2">
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
