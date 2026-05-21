import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "Detect wasted AI spend",
    description:
      "Surface unused tokens, idle vendors, and redundant workflows across teams.",
    accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  {
    title: "Monitor seat utilization",
    description:
      "Track license usage and auto-flag overlapping subscriptions or inactive seats.",
    accent: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  },
  {
    title: "Optimize model routing",
    description:
      "Route workloads to the right model tier based on cost, latency, and quality.",
    accent: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
  },
  {
    title: "Prevent spend spikes",
    description:
      "Apply guardrails with budget alerts, thresholds, and anomaly detection.",
    accent: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
  {
    title: "Track AI ROI",
    description:
      "Tie usage to outcomes with cost-per-impact metrics and ROI reports.",
    accent: "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200",
  },
  {
    title: "Budget intelligence",
    description:
      "Forecast quarterly AI spend with scenario modeling and team benchmarks.",
    accent: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  },
];

export function FeatureSection() {
  return (
    <section id="features" className="border-t border-border/40 py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6">
        <div className="max-w-2xl space-y-3">
          <Badge
            variant="outline"
            className="border-border/60 bg-background/70 text-slate-600 dark:text-slate-300"
          >
            Feature highlights
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Spend visibility that feels effortless.
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            AuditSight centralizes usage, cost, and governance in one premium
            workspace so leaders can scale AI responsibly.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-slate-50/80 p-6 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.5)] transition dark:to-slate-900/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {feature.title}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${feature.accent}`}
                >
                  Signal
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                {feature.description}
              </p>
              <div className="mt-6 h-1 w-12 rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-indigo-200 opacity-80 dark:from-slate-700 dark:via-slate-600 dark:to-indigo-500/40" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
