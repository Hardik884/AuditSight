"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPlanOptions } from "@/constants/pricing";
import type { PrimaryUseCase, ToolSelection } from "@/types/audit";
import type { ToolName } from "@/constants/pricing";

interface AuditFormProps {
  primaryUseCases: readonly PrimaryUseCase[];
  teamSize: number;
  toolEntries: ToolSelection[];
  availableTools: ToolName[];
  selectedPrimaryUseCase: PrimaryUseCase;
  isSubmitting: boolean;
  errorMessage: string | null;
  onTeamSizeChange: (size: number) => void;
  onSelectPrimaryUseCase: (useCase: PrimaryUseCase) => void;
  onAddTool: (tool: ToolName) => void;
  onRemoveTool: (tool: ToolName) => void;
  onUpdateTool: (tool: ToolName, patch: Partial<ToolSelection>) => void;
  onSubmit: () => void;
}

export function AuditForm({
  primaryUseCases,
  teamSize,
  toolEntries,
  availableTools,
  selectedPrimaryUseCase,
  isSubmitting,
  errorMessage,
  onTeamSizeChange,
  onSelectPrimaryUseCase,
  onAddTool,
  onRemoveTool,
  onUpdateTool,
  onSubmit,
}: AuditFormProps) {
  const [pendingTool, setPendingTool] = useState<string>("");
  const toolOptions = useMemo(() => availableTools, [availableTools]);
  const addDisabled = toolOptions.length === 0;

  return (
    <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-slate-50 via-white to-slate-100/80 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-900/70">
      <div className="grid gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Total team size
          </p>
          <div className="mt-3">
            <Input
              type="number"
              min={1}
              value={teamSize}
              onChange={(event) =>
                onTeamSizeChange(Number(event.target.value) || 0)
              }
              className="h-12 rounded-2xl border-border/60 bg-background/90 text-base shadow-sm"
              placeholder="50"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            AI tools & plans
          </p>
          <div className="mt-3 grid gap-4">
            {toolEntries.map((entry) => (
              <div
                key={entry.tool}
                className="rounded-2xl border border-border/60 bg-background/90 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {entry.tool}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure plan, spend, and seat count.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => onRemoveTool(entry.tool)}
                  >
                    Remove
                  </Button>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Plan
                    </p>
                    <Select
                      value={entry.plan}
                      onValueChange={(value) =>
                        onUpdateTool(entry.tool, { plan: value as ToolSelection["plan"] })
                      }
                    >
                      <SelectTrigger className="w-full border-border/60">
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {getPlanOptions(entry.tool).map((plan) => (
                          <SelectItem key={plan} value={plan}>
                            {plan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Monthly spend
                    </p>
                    <Input
                      type="number"
                      min={0}
                      value={entry.monthlySpend}
                      onChange={(event) =>
                        onUpdateTool(entry.tool, {
                          monthlySpend: Number(event.target.value) || 0,
                        })
                      }
                      className="h-11 rounded-2xl border-border/60 bg-background/90 text-base shadow-sm"
                      placeholder="200"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Seats
                    </p>
                    <Input
                      type="number"
                      min={0}
                      value={entry.seatCount}
                      onChange={(event) =>
                        onUpdateTool(entry.tool, {
                          seatCount: Number(event.target.value) || 0,
                        })
                      }
                      className="h-11 rounded-2xl border-border/60 bg-background/90 text-base shadow-sm"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-dashed border-border/70 bg-white/70 p-4 dark:bg-slate-950/40">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Add another tool
              </p>
              <div className="mt-3">
                <Select
                  value={pendingTool}
                  onValueChange={(value) => {
                    onAddTool(value as ToolName);
                    setPendingTool("");
                  }}
                  disabled={addDisabled}
                >
                  <SelectTrigger className="w-full border-border/60">
                    <SelectValue placeholder="Select a tool" />
                  </SelectTrigger>
                  <SelectContent>
                    {addDisabled ? (
                      <SelectItem value="none" disabled>
                        All tools added
                      </SelectItem>
                    ) : (
                      toolOptions.map((tool) => (
                        <SelectItem key={tool} value={tool}>
                          {tool}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Primary use case
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {primaryUseCases.map((useCase) => (
              <button
                key={useCase}
                type="button"
                onClick={() => onSelectPrimaryUseCase(useCase)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                  selectedPrimaryUseCase === useCase
                    ? "border-slate-400/60 bg-slate-900 text-white shadow-sm dark:border-slate-600 dark:bg-white dark:text-slate-900"
                    : "border-border/60 bg-background/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:text-slate-200"
                }`}
              >
                {useCase}
              </button>
            ))}
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            {errorMessage}
          </div>
        ) : null}

        <Button
          size="lg"
          className="w-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Generating..." : "Generate My Audit"}
        </Button>
      </div>
    </div>
  );
}
