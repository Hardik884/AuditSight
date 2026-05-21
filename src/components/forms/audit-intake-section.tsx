"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const teamSizes = ["1-25", "26-100", "101-500", "500+"] as const;
const aiTools = [
  "ChatGPT",
  "Claude",
  "Cursor",
  "GitHub Copilot",
  "Gemini",
  "Perplexity",
] as const;
const challenges = [
  "Unclear ROI",
  "Overlapping subscriptions",
  "Spend volatility",
  "Model quality drift",
] as const;
const goals = [
  "Reduce monthly spend",
  "Improve usage governance",
  "Consolidate vendors",
  "Optimize model routing",
] as const;

const progressSteps = [
  "Analyzing AI stack...",
  "Detecting overlapping subscriptions...",
  "Generating optimization insights...",
] as const;

const baseRecommendations = {
  "Unclear ROI": [
    "Map AI usage to revenue-driving workflows",
    "Benchmark cost per output across teams",
  ],
  "Overlapping subscriptions": [
    "Consolidate duplicate seats across vendors",
    "Retire underused copilots in back-office teams",
  ],
  "Spend volatility": [
    "Add spend guardrails on high-variance prompts",
    "Shift bursty traffic to reserved capacity",
  ],
  "Model quality drift": [
    "Tighten evaluation gates for critical workflows",
    "Align routing with quality thresholds",
  ],
} as const;

const goalPriorities = {
  "Reduce monthly spend": "Savings prioritized",
  "Improve usage governance": "Governance prioritized",
  "Consolidate vendors": "Vendor consolidation prioritized",
  "Optimize model routing": "Routing prioritized",
} as const;

type Status = "idle" | "loading" | "complete";

export function AuditIntakeSection() {
  const [selectedSize, setSelectedSize] = useState<string>(teamSizes[1]);
  const [selectedTools, setSelectedTools] = useState<string[]>([aiTools[0]]);
  const [monthlySpend, setMonthlySpend] = useState<string>("$25,000");
  const [selectedChallenge, setSelectedChallenge] = useState<string>(
    challenges[1]
  );
  const [selectedGoals, setSelectedGoals] = useState<string[]>([goals[0]]);
  const [status, setStatus] = useState<Status>("idle");
  const [progressIndex, setProgressIndex] = useState<number>(0);

  const spendValue = useMemo(() => {
    const numeric = Number(monthlySpend.replace(/[^0-9.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  }, [monthlySpend]);

  const sizeFactor = useMemo(() => {
    if (selectedSize === "1-25") return 0.12;
    if (selectedSize === "26-100") return 0.16;
    if (selectedSize === "101-500") return 0.2;
    return 0.24;
  }, [selectedSize]);

  const toolFactor = useMemo(() => 1 + selectedTools.length * 0.06, [selectedTools.length]);

  const estimatedSavings = useMemo(() => {
    const base = spendValue * sizeFactor * toolFactor;
    return Math.max(base, 2400);
  }, [sizeFactor, spendValue, toolFactor]);

  const riskCoverage = useMemo(() => {
    if (selectedChallenge === "Overlapping subscriptions") return "High";
    if (selectedChallenge === "Spend volatility") return "Moderate";
    return "Stable";
  }, [selectedChallenge]);

  const confidenceLabel = useMemo(() => {
    if (selectedTools.length >= 4 && spendValue > 50000) return "High";
    if (selectedTools.length >= 2) return "Medium";
    return "Focused";
  }, [selectedTools.length, spendValue]);

  const recommendations = useMemo(() => {
    const challengeRecs = baseRecommendations[selectedChallenge] ?? [];
    const toolRecommendations = selectedTools.length >= 4
      ? ["Rationalize overlapping copilots in adjacent teams"]
      : ["Standardize usage policies for core tools"];
    const goalRecommendation = selectedGoals[0]
      ? [goalPriorities[selectedGoals[0]]]
      : ["Savings prioritized"];
    const total = Math.min(5, 2 + selectedTools.length);
    return [...challengeRecs, ...toolRecommendations, ...goalRecommendation].slice(0, total);
  }, [selectedChallenge, selectedGoals, selectedTools.length]);

  const progressPercent = useMemo(() => {
    const stepCount = progressSteps.length;
    if (status === "idle") return 0;
    if (status === "complete") return 100;
    return Math.round(((progressIndex + 1) / stepCount) * 100);
  }, [progressIndex, status]);

  useEffect(() => {
    if (status !== "loading") return;

    setProgressIndex(0);
    const interval = setInterval(() => {
      setProgressIndex((current) =>
        Math.min(current + 1, progressSteps.length - 1)
      );
    }, 1200);

    const timeout = setTimeout(() => {
      setStatus("complete");
    }, progressSteps.length * 1200 + 400);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [status]);

  const toggleSelection = (
    value: string,
    values: string[],
    setValues: (next: string[]) => void
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
  };

  const handleGenerate = () => {
    if (status === "loading") return;
    setStatus("loading");
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
                    ${Math.round(estimatedSavings / 1000).toFixed(1)}k
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Risk coverage</span>
                  <span className="font-semibold text-amber-200">
                    {riskCoverage}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Optimization confidence</span>
                  <span className="font-semibold text-indigo-200">
                    {confidenceLabel}
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
                {recommendations.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-slate-50/70 px-4 py-3 text-sm text-slate-700 shadow-sm dark:bg-slate-900/50 dark:text-slate-200"
                  >
                    <span>{item}</span>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                      Priority
                    </span>
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
