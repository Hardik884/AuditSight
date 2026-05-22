import type { AuditResponse } from "@/types/audit";

interface AuditResultDetailsProps {
  status: "idle" | "loading" | "complete";
  auditResponse: AuditResponse | null;
  formatCurrency: (value: number) => string;
}

export function AuditResultDetails({
  status,
  auditResponse,
  formatCurrency,
}: AuditResultDetailsProps) {
  const hasResults = status === "complete" && auditResponse;

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
        </div>
      </div>

      <div
        className={`rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm transition duration-500 ${
          hasResults
            ? "opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 translate-y-3"
        }`}
      >
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
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
                  <span>Prompt volume</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {auditResponse.usageInsights.promptVolume}
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
    </div>
  );
}
