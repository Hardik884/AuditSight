"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type {
  AuditGoal,
  AuditRequest,
  Challenge,
  PrimaryUseCase,
  TeamSize,
  ToolName,
} from "@/types/audit";
import { AuditForm } from "@/components/forms/AuditForm";
import { AuditLoadingState } from "@/components/forms/AuditLoadingState";
import { requestAudit } from "@/lib/api/audit-client";
import {
  AUDIT_GOALS,
  CHALLENGES,
  PRIMARY_USE_CASES,
  TEAM_SIZES,
  TOOL_NAMES,
} from "@/constants/audit-config";

const progressSteps = [
  "Analyzing AI stack...",
  "Detecting overlapping subscriptions...",
  "Generating optimization insights...",
] as const;

type Status = "idle" | "loading" | "complete";

export function AuditIntakeSection() {
  const [selectedSize, setSelectedSize] = useState<TeamSize>(TEAM_SIZES[1]);
  const [selectedTools, setSelectedTools] = useState<ToolName[]>([
    TOOL_NAMES[0],
  ]);
  const [monthlySpend, setMonthlySpend] = useState<string>("$25,000");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(
    CHALLENGES[1]
  );
  const [selectedGoals, setSelectedGoals] = useState<AuditGoal[]>([
    AUDIT_GOALS[0],
  ]);
  const [primaryUseCase, setPrimaryUseCase] = useState<PrimaryUseCase>(
    PRIMARY_USE_CASES[0]
  );
  const [status, setStatus] = useState<Status>("idle");
  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [progressDone, setProgressDone] = useState<boolean>(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const spendValue = useMemo(() => {
    const numeric = Number(monthlySpend.replace(/[^0-9.]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  }, [monthlySpend]);

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
    if (!progressDone || !auditId) return;
    setStatus("complete");
  }, [auditId, progressDone, status]);

  useEffect(() => {
    if (!auditId || !progressDone) return;
    router.push(`/audit/${auditId}`);
  }, [auditId, progressDone, router]);

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
    setAuditId(null);
    setFormError(null);
    setSubmitError(null);
  };

  const handleGenerate = async () => {
    if (status === "loading") return;
    if (selectedTools.length === 0) {
      setFormError("Select at least one AI tool to continue.");
      return;
    }
    if (selectedGoals.length === 0) {
      setFormError("Select at least one audit goal to continue.");
      return;
    }
    if (!primaryUseCase) {
      setFormError("Select a primary use case to continue.");
      return;
    }
    if (spendValue <= 0) {
      setFormError("Enter a valid monthly spend amount.");
      return;
    }

    setFormError(null);
    setSubmitError(null);
    setStatus("loading");

    const payload: AuditRequest = {
      teamSize: selectedSize,
      selectedTools,
      monthlySpend: spendValue,
      biggestChallenge: selectedChallenge,
      auditGoals: selectedGoals,
      primaryUseCase,
    };

    const result = await requestAudit(payload);
    if (!result.ok) {
      setStatus("idle");
      setSubmitError(
        result.error?.details?.[0] ||
          result.error?.message ||
          "Unable to generate audit."
      );
      return;
    }
    console.log(result);
    console.log(result.data.auditId);
    setAuditId(result.data.auditId);
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
          <AuditForm
            teamSizes={TEAM_SIZES}
            aiTools={TOOL_NAMES}
            challenges={CHALLENGES}
            goals={AUDIT_GOALS}
            primaryUseCases={PRIMARY_USE_CASES}
            selectedSize={selectedSize}
            selectedTools={selectedTools}
            monthlySpend={monthlySpend}
            selectedChallenge={selectedChallenge}
            selectedGoals={selectedGoals}
            selectedPrimaryUseCase={primaryUseCase}
            isSubmitting={status === "loading"}
            errorMessage={formError}
            onSelectSize={setSelectedSize}
            onToggleTool={(tool) =>
              toggleSelection(tool, selectedTools, setSelectedTools)
            }
            onSpendChange={setMonthlySpend}
            onSelectChallenge={setSelectedChallenge}
            onToggleGoal={(goal) =>
              toggleSelection(goal, selectedGoals, setSelectedGoals)
            }
            onSelectPrimaryUseCase={setPrimaryUseCase}
            onSubmit={handleGenerate}
          />

          <div className="flex flex-col gap-6">
            <AuditLoadingState
              steps={progressSteps}
              status={status}
              progressIndex={progressIndex}
              progressPercent={progressPercent}
              errorMessage={submitError}
              onReset={resetFlow}
              successMessage="Audit generated successfully. Preparing your report..."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
