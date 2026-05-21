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
      <div className="rounded-3xl border border-border/60 bg-slate-900 p-6 text-white shadow-[0_24px_70px_-50px_rgba(15,23,42,0.8)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          Audit summary
        </p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Estimated savings</span>
            <span className="font-semibold text-emerald-300">
              {auditResponse
                ? formatCurrency(auditResponse.metrics.estimatedSavings)
                : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Risk coverage</span>
            <span className="font-semibold text-amber-200">
              {auditResponse ? auditResponse.metrics.riskLevel : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Optimization score</span>
            <span className="font-semibold text-indigo-200">
              {auditResponse ? auditResponse.metrics.optimizationScore : "—"}
            </span>
          </div>
        </div>
        {auditResponse ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">
              {auditResponse.auditSummary.headline}
            </p>
            <p className="mt-2 text-xs text-slate-300">
              {auditResponse.auditSummary.narrative}
            </p>
          </div>
        ) : null}
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
