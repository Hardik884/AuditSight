import { Badge } from "@/components/ui/badge";

const spendCategories = [
  { label: "LLM APIs", value: "$62.4k", percent: 62 },
  { label: "Developer tooling", value: "$28.1k", percent: 28 },
  { label: "Automation agents", value: "$12.8k", percent: 13 },
  { label: "Prompt ops", value: "$8.9k", percent: 9 },
];

const recommendations = [
  {
    title: "Downgrade 41 idle seats across 3 vendors",
    impact: "$12.4k saved",
    confidence: "High",
    badgeClass:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  {
    title: "Route 18% of summarization to lower-cost models",
    impact: "$8.1k saved",
    confidence: "Medium",
    badgeClass:
      "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  {
    title: "Add spend guardrails for internal copilots",
    impact: "$5.9k saved",
    confidence: "High",
    badgeClass:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  },
];

export function AuditInsightsSection() {
  return (
    <section
      id="example-audit"
      className="border-y border-border/40 bg-slate-50/60 py-12 dark:bg-slate-950/40"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6">
        <div className="max-w-3xl space-y-3">
          <Badge
            variant="outline"
            className="border-border/60 bg-background/70 text-slate-600 dark:text-slate-300"
          >
            Example audit insights
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            A realistic audit report, delivered in hours.
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Preview the depth and clarity executives receive with every AuditSight
            assessment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-slate-50 via-white to-slate-100/80 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)] dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-900/70">
            <div className="grid gap-6">
              <div className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Total monthly spend
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                      $112,300
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-slate-50/80 px-4 py-3 text-right shadow-sm dark:bg-slate-900/60">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Health score
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                      78
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Stable
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Potential savings</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        $26.8k
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-2 w-[68%] rounded-full bg-emerald-400/80 dark:bg-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Risk exposure</span>
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        Moderate
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-2 w-[42%] rounded-full bg-amber-400/80 dark:bg-amber-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Spend categories
                  </p>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Last 30 days
                  </span>
                </div>
                <div className="mt-4 space-y-4">
                  {spendCategories.map((category) => (
                    <div key={category.label}>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{category.label}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {category.value}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-indigo-400/70 dark:bg-indigo-400"
                          style={{ width: `${category.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Optimization recommendations
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  3 new
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {recommendations.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border/60 bg-slate-50/70 p-4 shadow-sm dark:bg-slate-900/50"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.badgeClass}`}
                      >
                        {item.confidence} confidence
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.impact}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Usage analytics
              </p>
              <div className="mt-4 space-y-4">
                {[
                  { label: "Daily active prompts", value: "14.2k", percent: 74 },
                  { label: "Model routing efficiency", value: "91%", percent: 91 },
                  { label: "Cost per active seat", value: "$142", percent: 58 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{row.label}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {row.value}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-slate-400/70 dark:bg-slate-500"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
