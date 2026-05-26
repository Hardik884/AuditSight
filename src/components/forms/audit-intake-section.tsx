"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AuditRequest,
  PrimaryUseCase,
  ToolSelection,
} from "@/types/audit";
import { AuditForm } from "@/components/forms/AuditForm";
import { AuditLoadingState } from "@/components/forms/AuditLoadingState";
import { requestAudit } from "@/lib/api/audit-client";
import {
  PRIMARY_USE_CASES,
  TEAM_SIZE_LIMITS,
} from "@/constants/audit-config";
import {
  TOOL_NAMES,
  getPlanOptions,
  type ToolPlan,
} from "@/constants/pricing";

const progressSteps = [
  "Analyzing AI stack...",
  "Detecting overlapping subscriptions...",
  "Generating optimization insights...",
] as const;

type Status = "idle" | "loading" | "complete";
const STORAGE_KEY = "audit-intake-v2";

const buildToolInputValues = (entries: ToolSelection[]) =>
  entries.reduce<Record<string, { monthlySpend: string; seatCount: string }>>(
    (acc, entry) => {
      acc[entry.tool] = {
        monthlySpend: entry.monthlySpend > 0 ? String(entry.monthlySpend) : "",
        seatCount: entry.seatCount > 0 ? String(entry.seatCount) : "",
      };
      return acc;
    },
    {}
  );

const createDefaultTool = (tool = TOOL_NAMES[0]): ToolSelection => {
  const plan = getPlanOptions(tool)[0] as ToolPlan;
  const isApiPlan = plan.toLowerCase().includes("api");
  return {
    tool,
    plan,
    monthlySpend: 0,
    seatCount: isApiPlan ? 0 : 1,
  };
};

export function AuditIntakeSection() {
  const [teamSize, setTeamSize] = useState<number>(25);
  const [teamSizeInput, setTeamSizeInput] = useState<string>("25");
  const [primaryUseCase, setPrimaryUseCase] = useState<PrimaryUseCase>(
    PRIMARY_USE_CASES[0]
  );
  const [toolEntries, setToolEntries] = useState<ToolSelection[]>([
    createDefaultTool(),
  ]);
  const [toolInputValues, setToolInputValues] = useState(
    buildToolInputValues([createDefaultTool()])
  );
  const [homepage, setHomepage] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [progressDone, setProgressDone] = useState<boolean>(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const availableTools = useMemo(
    () => TOOL_NAMES.filter((tool) => !toolEntries.some((entry) => entry.tool === tool)),
    [toolEntries]
  );

  const progressPercent = useMemo(() => {
    const stepCount = progressSteps.length;
    if (status === "idle") return 0;
    if (status === "complete") return 100;
    return Math.round(((progressIndex + 1) / stepCount) * 100);
  }, [progressIndex, status]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<{
        teamSize: number;
        primaryUseCase: PrimaryUseCase;
        tools: ToolSelection[];
      }>;

      const parsedTeamSize = parsed.teamSize;
      if (typeof parsedTeamSize === "number") {
        setTimeout(() => {
          setTeamSize(parsedTeamSize);
          setTeamSizeInput(String(parsedTeamSize));
        }, 0);
      }
      const parsedUseCase = parsed.primaryUseCase;
      if (parsedUseCase && PRIMARY_USE_CASES.includes(parsedUseCase)) {
        setTimeout(() => setPrimaryUseCase(parsedUseCase), 0);
      }
      if (Array.isArray(parsed.tools) && parsed.tools.length > 0) {
        const sanitized = parsed.tools
          .filter((tool) => TOOL_NAMES.includes(tool.tool))
          .map((tool) => {
            const plans = getPlanOptions(tool.tool);
            const plan = plans.includes(tool.plan) ? tool.plan : plans[0];
            return {
              tool: tool.tool,
              plan: plan as ToolPlan,
              monthlySpend: Number.isFinite(tool.monthlySpend) ? tool.monthlySpend : 0,
              seatCount: Number.isFinite(tool.seatCount) ? tool.seatCount : 0,
            };
          });

        if (sanitized.length > 0) {
          setTimeout(() => setToolEntries(sanitized), 0);
          setTimeout(() => setToolInputValues(buildToolInputValues(sanitized)), 0);
        }
      }
    } catch (error) {
      console.warn("Unable to restore audit intake state", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        teamSize,
        primaryUseCase,
        tools: toolEntries,
      })
    );
  }, [primaryUseCase, teamSize, toolEntries]);


  useEffect(() => {
    if (status !== "loading") return;

    setTimeout(() => {
      setProgressIndex(0);
      setProgressDone(false);
    }, 0);
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
    setTimeout(() => setStatus("complete"), 0);
  }, [auditId, progressDone, status]);

  useEffect(() => {
    if (!auditId || !progressDone) return;
    router.push(`/audit/${auditId}`);
  }, [auditId, progressDone, router]);

  const addTool = (tool: ToolSelection["tool"]) => {
    if (toolEntries.some((entry) => entry.tool === tool)) return;
    const newEntry = createDefaultTool(tool);
    setToolEntries((current) => [...current, newEntry]);
    setToolInputValues((current) => ({
      ...current,
      [tool]: {
        monthlySpend: newEntry.monthlySpend > 0 ? String(newEntry.monthlySpend) : "",
        seatCount: newEntry.seatCount > 0 ? String(newEntry.seatCount) : "",
      },
    }));
  };

  const removeTool = (tool: ToolSelection["tool"]) => {
    setToolEntries((current) => current.filter((entry) => entry.tool !== tool));
    setToolInputValues((current) => {
      const next = { ...current };
      delete next[tool];
      return next;
    });
  };

  const updateTool = (
    tool: ToolSelection["tool"],
    patch: Partial<ToolSelection>
  ) => {
    setToolEntries((current) =>
      current.map((entry) =>
        entry.tool === tool ? { ...entry, ...patch } : entry
      )
    );
  };

  const updateToolInput = (
    tool: ToolSelection["tool"],
    patch: Partial<{ monthlySpend: string; seatCount: string }>
  ) => {
    setToolInputValues((current) => ({
      ...current,
      [tool]: {
        monthlySpend: patch.monthlySpend ?? current[tool]?.monthlySpend ?? "",
        seatCount: patch.seatCount ?? current[tool]?.seatCount ?? "",
      },
    }));
  };

  const resetFlow = () => {
    setStatus("idle");
    setProgressIndex(0);
    setProgressDone(false);
    setAuditId(null);
    setFormError(null);
    setSubmitError(null);
  };

  const handleTeamSizeInputChange = (value: string) => {
    setTeamSizeInput(value);
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      setTeamSize(parsed);
    } else if (value.trim() === "") {
      setTeamSize(0);
    }
  };

  const handleGenerate = async () => {
    if (status === "loading") return;
    if (toolEntries.length === 0) {
      setFormError("Add at least one AI tool to continue.");
      return;
    }
    if (!primaryUseCase) {
      setFormError("Select a primary use case to continue.");
      return;
    }
    if (teamSize < TEAM_SIZE_LIMITS.min || teamSize > TEAM_SIZE_LIMITS.max) {
      setFormError("Enter a valid team size to continue.");
      return;
    }

    const invalidTool = toolEntries.find(
      (tool) => tool.monthlySpend < 0 || tool.seatCount < 0
    );
    if (invalidTool) {
      setFormError("Tool spend and seat counts must be zero or greater.");
      return;
    }

    setFormError(null);
    setSubmitError(null);
    setStatus("loading");

    const payload: AuditRequest = {
      primaryUseCase,
      teamSize,
      tools: toolEntries,
      homepage,
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
    setAuditId(result.data.auditId);
  };

  return (
    <section id="generate-audit" className="border-t border-border/40 py-16 md:py-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6">
        {/* Section header */}
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center rounded-full border border-border/70 bg-background px-3.5 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Audit intake
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-[2.25rem]">
            Start your AI spend audit in minutes.
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Share a few details and AuditSight will generate an executive-grade
            audit focused on savings, governance, and ROI.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3">
          {["Add your tools", "Configure spend & seats", "Generate audit"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                i === 0
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "border border-border/60 text-slate-400"
              }`}>
                {i + 1}
              </div>
              <span className={`hidden text-xs font-medium sm:inline ${i === 0 ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
                {step}
              </span>
              {i < 2 && <div className="h-px w-8 bg-border/60" />}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <AuditForm
            primaryUseCases={PRIMARY_USE_CASES}
            teamSizeInput={teamSizeInput}
            toolEntries={toolEntries}
            toolInputValues={toolInputValues}
            availableTools={availableTools}
            selectedPrimaryUseCase={primaryUseCase}
            isSubmitting={status === "loading"}
            errorMessage={formError}
            onTeamSizeInputChange={handleTeamSizeInputChange}
            onSelectPrimaryUseCase={setPrimaryUseCase}
            onAddTool={addTool}
            onRemoveTool={removeTool}
            onUpdateTool={updateTool}
            onUpdateToolInput={updateToolInput}
            honeypotValue={homepage}
            onHoneypotChange={setHomepage}
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
