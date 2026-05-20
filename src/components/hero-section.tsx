import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_60%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-12 pt-10 md:pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300">
              Audit-ready AI spend intelligence
            </div>

            <div className="max-w-2xl space-y-4">
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl md:text-6xl">
                See where your AI stack leaks money.
              </h1>
              <p className="text-pretty text-base text-slate-600 dark:text-slate-300 sm:text-lg">
                AuditSight unifies usage, cost, and governance so modern teams can
                scale AI adoption with confidence.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 sm:flex-row lg:items-start">
              <Button asChild size="lg" className="shadow-sm">
                <Link href="#generate-audit">Generate Free Audit</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#example-audit">View Sample Report</Link>
              </Button>
            </div>
          </div>

          <div className="w-full">
            <div className="w-full rounded-3xl border border-border/60 bg-gradient-to-br from-slate-50 via-white to-slate-100/80 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)] dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-900/70">
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/90 p-6 shadow-sm">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-100/70 blur-3xl dark:bg-indigo-500/10" />
                <div className="absolute bottom-0 left-8 h-24 w-24 rounded-full bg-slate-200/70 blur-2xl dark:bg-slate-700/30" />

                <div className="relative flex flex-col gap-6">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Current monthly spend
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                      $128,450
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      18% MoM increase across LLM and AI SaaS tools
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>Budget utilization</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          82%
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-2 w-[82%] rounded-full bg-indigo-400/80 dark:bg-indigo-400" />
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-slate-50/80 px-5 py-4 shadow-sm dark:bg-slate-900/60">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Potential savings
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                        $34,200
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        26% projected reduction
                      </div>
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        Confidence score:{" "}
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          High
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    {[
                      {
                        text: "Route 23% of summarization traffic to lower-cost models",
                        badge: "Savings",
                        badgeClass:
                          "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
                      },
                      {
                        text: "Consolidate overlapping vendor seats across 4 teams",
                        badge: "Risk",
                        badgeClass:
                          "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
                      },
                      {
                        text: "Enforce spend guardrails on high-variance prompt workloads",
                        badge: "Metric",
                        badgeClass:
                          "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
                      },
                    ].map((item) => (
                      <div
                        key={item.text}
                        className="rounded-2xl border border-border/60 bg-background/90 p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.badgeClass}`}
                          >
                            {item.badge}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            8/10 confidence
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                          {item.text}
                        </p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>Impact</span>
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              72%
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                            <div className="h-1.5 w-[72%] rounded-full bg-slate-400/70 dark:bg-slate-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 sm:flex-row sm:justify-center">
          <span className="hidden h-px w-12 bg-border/70 sm:inline-block" />
          Trusted by teams building with
          <span className="hidden h-px w-12 bg-border/70 sm:inline-block" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <span className="opacity-80">OpenAI</span>
          <span className="opacity-80">Anthropic</span>
          <span className="opacity-80">Cursor</span>
          <span className="opacity-80">GitHub Copilot</span>
          <span className="opacity-80">Gemini</span>
        </div>
      </div>
    </section>
  );
}
