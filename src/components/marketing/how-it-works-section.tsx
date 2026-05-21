import { Badge } from "@/components/ui/badge";

const steps = [
  {
    title: "Connect your AI stack",
    description:
      "Securely link vendors, model usage, and internal tools with read-only access.",
  },
  {
    title: "Analyze usage and spend",
    description:
      "AuditSight normalizes data, labels workflows, and highlights cost drivers.",
  },
  {
    title: "Receive optimization insights",
    description:
      "Get prioritized savings, guardrails, and routing recommendations within hours.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-border/40 py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6">
        <div className="max-w-2xl space-y-3">
          <Badge
            variant="outline"
            className="border-border/60 bg-background/70 text-slate-600 dark:text-slate-300"
          >
            How it works
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Go from setup to savings in three steps.
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            We make onboarding painless while keeping everything audit-ready and
            executive-friendly.
          </p>
        </div>

        <div className="relative grid gap-6 md:grid-cols-3">
          <div className="absolute inset-x-0 top-7 hidden h-px bg-border/70 md:block" />
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-border/70 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  Step 0{index + 1}
                </span>
                <span className="h-2 w-2 rounded-full bg-indigo-400/70" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
