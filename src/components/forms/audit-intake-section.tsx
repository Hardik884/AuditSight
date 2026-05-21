"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AuditRequest,
  AuditResponse,
  AuditGoal,
  Challenge,
  TeamSize,
  ToolName,
} from "@/types/audit";

const teamSizes: TeamSize[] = ["1-25", "26-100", "101-500", "500+"];
const aiTools: ToolName[] = [
  "ChatGPT",
  "Claude",
  "Cursor",
  "GitHub Copilot",
  "Gemini",
  "Perplexity",
];
const challenges: Challenge[] = [
  "Unclear ROI",
  "Overlapping subscriptions",
  "Spend volatility",
  "Model quality drift",
];
const goals: AuditGoal[] = [
  "Reduce monthly spend",
  "Improve usage governance",
  "Consolidate vendors",
  "Optimize model routing",
];

const progressSteps = [
  "Analyzing AI stack...",
  "Detecting overlapping subscriptions...",
  "Generating optimization insights...",
] as const;

type Status = "idle" | "loading" | "complete";

export function AuditIntakeSection() {
  const [selectedSize, setSelectedSize] = useState<TeamSize>(teamSizes[1]);
  const [selectedTools, setSelectedTools] = useState<ToolName[]>([aiTools[0]]);
  const [monthlySpend, setMonthlySpend] = useState<string>("$25,000");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(
    challenges[1]
  );
  const [selectedGoals, setSelectedGoals] = useState<AuditGoal[]>([goals[0]]);
  const [status, setStatus] = useState<Status>("idle");
  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [progressDone, setProgressDone] = useState<boolean>(false);
  const [auditResponse, setAuditResponse] = useState<AuditResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const spendValue = useMemo(() => {
    const numeric = Number(monthlySpend.replace(/[^0-9.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  }, [monthlySpend]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const progressPercent = useMemo(() => {
    const stepCount = progressSteps.length;
    if (status === "idle") return 0;
    if (status === "complete") return 100;
    return Math.round(((progressIndex + 1) / stepCount) * 100);
  }, [progressIndex, status]);

  useEffect(() => {
    if (status !== "loading") return;

    setProgressIndex(0);
    setProgressDone(false);
    const stepDuration = 1200;
    const interval = setInterval(() => {
      setProgressIndex((current) =>
        Math.min(current + 1, progressSteps.length - 1)
      );
    }, stepDuration);

    const timeout = setTimeout(() => {
      setProgressDone(true);
    }, progressSteps.length * stepDuration + 300);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [status]);

  useEffect(() => {
    if (status !== "loading") return;
    if (!progressDone || !auditResponse) return;
    setStatus("complete");
  }, [auditResponse, progressDone, status]);

  const toggleSelection = <T extends string>(
    value: T,
    values: T[],
    setValues: (next: T[]) => void
  ) => {
    if (values.includes(value)) {
      setValues(values.filter((item) => item !== value));
      return;
    }
    setValues([...values, value]);
  };

  const resetFlow = () => {
    setStatus("idle");
    setProgressIndex(0);
    setProgressDone(false);
    setAuditResponse(null);
    setErrorMessage(null);
  };

  const handleGenerate = async () => {
    if (status === "loading") return;
    if (selectedTools.length === 0) {
      setErrorMessage("Select at least one AI tool to continue.");
      return;
    }
    if (selectedGoals.length === 0) {
      setErrorMessage("Select at least one audit goal to continue.");
      return;
    }
    if (spendValue <= 0) {
      setErrorMessage("Enter a valid monthly spend amount.");
      return;
    }

    setErrorMessage(null);
    setAuditResponse(null);
    setStatus("loading");

    const payload: AuditRequest = {
      teamSize: selectedSize,
      selectedTools,
      monthlySpend: spendValue,
      biggestChallenge: selectedChallenge,
      auditGoals: selectedGoals,
    };

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result?.ok) {
        setStatus("idle");
        setErrorMessage(result?.errors?.[0] || "Unable to generate audit.");
        return;
      }

      setAuditResponse(result.data as AuditResponse);
    } catch (error) {
      console.error("Audit request failed", error);
      setStatus("idle");
      setErrorMessage("Unable to generate audit. Please try again.");
    }
  };

  return (
    <section id="generate-audit" className="border-t border-border/40 py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6">
        <div className="max-w-2xl space-y-3">
          <Badge
            variant="outline"
            className="border-border/60 bg-background/70 text-slate-600 dark:text-slate-300"
          >
            Audit intake
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Start your AI spend audit in minutes.
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Share a few details and AuditSight will generate an executive-grade
            audit focused on savings, governance, and ROI.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-slate-50 via-white to-slate-100/80 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-900/70">
            <div className="grid gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Team size
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  {teamSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        selectedSize === size
                          ? "border-indigo-400/60 bg-indigo-50/70 text-indigo-700 shadow-sm dark:border-indigo-400/60 dark:bg-indigo-500/10 dark:text-indigo-300"
                          : "border-border/60 bg-background/80 text-slate-700 hover:border-indigo-200/70 hover:bg-indigo-50/50 dark:text-slate-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  AI tools in use
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {aiTools.map((tool) => (
                    <button
                      key={tool}
                      type="button"
                      onClick={() =>
                        toggleSelection(tool, selectedTools, setSelectedTools)
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        selectedTools.includes(tool)
                          ? "border-slate-900/10 bg-slate-900 text-white shadow-sm dark:border-slate-700 dark:bg-white dark:text-slate-900"
                          : "border-border/60 bg-background/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:text-slate-200"
                      }`}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Monthly AI spend
                </p>
                <div className="mt-3">
                  <Input
                    value={monthlySpend}
                    onChange={(event) => setMonthlySpend(event.target.value)}
                    className="h-12 rounded-2xl border-border/60 bg-background/90 text-base shadow-sm"
                    placeholder="$25,000"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Biggest challenge
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {challenges.map((challenge) => (
                    <button
                      key={challenge}
                      type="button"
                      onClick={() => setSelectedChallenge(challenge)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        selectedChallenge === challenge
                          ? "border-amber-400/60 bg-amber-50/70 text-amber-700 shadow-sm dark:border-amber-400/60 dark:bg-amber-500/10 dark:text-amber-300"
                          : "border-border/60 bg-background/80 text-slate-700 hover:border-amber-200/70 hover:bg-amber-50/40 dark:text-slate-200"
                      }`}
                    >
                      {challenge}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Audit goals
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {goals.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleSelection(goal, selectedGoals, setSelectedGoals)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        selectedGoals.includes(goal)
                          ? "border-emerald-400/60 bg-emerald-50/70 text-emerald-700 shadow-sm dark:border-emerald-400/60 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "border-border/60 bg-background/80 text-slate-700 hover:border-emerald-200/70 hover:bg-emerald-50/40 dark:text-slate-200"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Audit generation
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                We simulate an intelligent audit flow to preview the experience.
              </p>

              <div className="mt-6 space-y-4">
                {progressSteps.map((step, index) => {
                  const isActive = status === "loading" && index === progressIndex;
                  const isComplete =
                    status === "complete" ||
                    (status === "loading" && index < progressIndex);

                  return (
                    <div
                      key={step}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                        isComplete
                          ? "border-emerald-200/70 bg-emerald-50/70 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : isActive
                          ? "border-indigo-200/70 bg-indigo-50/60 text-indigo-700 dark:border-indigo-400/30 dark:bg-indigo-500/10 dark:text-indigo-200"
                          : "border-border/60 bg-background/80 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <span>{step}</span>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isComplete
                            ? "bg-emerald-400"
                            : isActive
                            ? "bg-indigo-400 animate-pulse"
                            : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Audit progress</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {progressPercent}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-indigo-400/80 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {errorMessage ? (
                <div className="mt-5 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                  {errorMessage}
                </div>
              ) : null}

              <div
                className={`mt-6 rounded-2xl border border-border/60 bg-slate-50/70 p-4 text-sm text-slate-700 transition duration-300 dark:bg-slate-900/50 dark:text-slate-200 ${
                  status === "complete"
                    ? "opacity-100 translate-y-0"
                    : "pointer-events-none opacity-0 translate-y-2"
                }`}
              >
                Audit ready. A sample report and optimization plan are prepared.
                <button
                  type="button"
                  onClick={resetFlow}
                  className="ml-2 text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
                >
                  Run again
                </button>
              </div>
            </div>

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
                    {auditResponse
                      ? `${auditResponse.metrics.optimizationScore}`
                      : "—"}
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                className="mt-6 w-full bg-white text-slate-900 hover:bg-slate-100"
                onClick={handleGenerate}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Generating..." : "Generate My Audit"}
              </Button>
            </div>

            <div
              className={`rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm transition duration-500 ${
                status === "complete"
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
