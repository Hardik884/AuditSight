"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { X, Plus, ArrowRight, DollarSign, Users, Layers } from "lucide-react";
import { listItem } from "@/lib/motion";

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
  honeypotValue: string;
  onHoneypotChange: (value: string) => void;
  onSubmit: () => void;
}

const USE_CASE_ICONS: Record<PrimaryUseCase, string> = {
  Coding: "⌨️",
  Writing: "✍️",
  Data: "📊",
  Research: "🔬",
  Mixed: "⚡",
};

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
  honeypotValue,
  onHoneypotChange,
  onSubmit,
}: AuditFormProps) {
  const [pendingTool, setPendingTool] = useState<string>("");
  const toolOptions = useMemo(() => availableTools, [availableTools]);
  const addDisabled = toolOptions.length === 0;

  return (
    <div className="rounded-3xl border border-border/60 bg-background p-6 shadow-sm">
      <div className="grid gap-7">
        <div className="sr-only" aria-hidden="true">
          <label className="sr-only" htmlFor="audit-homepage">
            Homepage
          </label>
          <input
            id="audit-homepage"
            type="text"
            name="homepage"
            tabIndex={-1}
            autoComplete="off"
            defaultValue={honeypotValue}
            onChange={(e) => onHoneypotChange(e.target.value)}
          />
        </div>

        {/* ── Team size ──────────────────────────────────────────────────── */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            <Users className="h-3.5 w-3.5" />
            Total team size
          </label>
          <div className="relative mt-3">
            <Input
              type="number"
              min={1}
              value={teamSize}
              onChange={(e) => onTeamSizeChange(Number(e.target.value) || 0)}
              className="h-12 rounded-2xl border-border/70 bg-background pl-4 text-base shadow-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
              placeholder="25"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              people
            </span>
          </div>
        </div>

        {/* ── Tool entries ───────────────────────────────────────────────── */}
        <div>
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            <Layers className="h-3.5 w-3.5" />
            AI tools & plans
          </label>

          <div className="mt-3 grid gap-3">
            <AnimatePresence initial={false}>
              {toolEntries.map((entry) => (
                <motion.div
                  key={entry.tool}
                  variants={listItem}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden rounded-2xl border border-border/70 bg-slate-50/60 dark:bg-slate-900/40"
                >
                  {/* Tool header */}
                  <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {entry.tool}
                      </p>
                      <p className="text-xs text-slate-400">
                        Plan · Spend · Seats
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveTool(entry.tool)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                      aria-label={`Remove ${entry.tool}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Config row */}
                  <div className="grid gap-3 p-4 sm:grid-cols-3">
                    {/* Plan */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Plan
                      </p>
                      <Select
                        value={entry.plan}
                        onValueChange={(v) =>
                          onUpdateTool(entry.tool, { plan: v as ToolSelection["plan"] })
                        }
                      >
                        <SelectTrigger className="h-10 border-border/60 bg-background text-sm">
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

                    {/* Monthly spend */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Monthly spend
                      </p>
                      <div className="relative">
                        <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <Input
                          type="number"
                          min={0}
                          value={entry.monthlySpend}
                          onChange={(e) =>
                            onUpdateTool(entry.tool, {
                              monthlySpend: Number(e.target.value) || 0,
                            })
                          }
                          className="h-10 border-border/60 bg-background pl-8 text-sm"
                          placeholder="200"
                        />
                      </div>
                    </div>

                    {/* Seats */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                        Seats
                      </p>
                      <div className="relative">
                        <Users className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <Input
                          type="number"
                          min={0}
                          value={entry.seatCount}
                          onChange={(e) =>
                            onUpdateTool(entry.tool, {
                              seatCount: Number(e.target.value) || 0,
                            })
                          }
                          className="h-10 border-border/60 bg-background pl-8 text-sm"
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add tool */}
            <div className="rounded-2xl border border-dashed border-border/70 bg-transparent p-4 transition hover:border-indigo-400/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 shrink-0 text-slate-400" />
                <Select
                  value={pendingTool}
                  onValueChange={(v) => {
                    onAddTool(v as ToolName);
                    setPendingTool("");
                  }}
                  disabled={addDisabled}
                >
                  <SelectTrigger className="border-0 bg-transparent p-0 text-sm text-slate-500 shadow-none focus:ring-0 dark:text-slate-400">
                    <SelectValue placeholder={addDisabled ? "All tools added" : "Add another tool..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {addDisabled ? (
                      <SelectItem value="none" disabled>All tools added</SelectItem>
                    ) : (
                      toolOptions.map((tool) => (
                        <SelectItem key={tool} value={tool}>{tool}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Primary use case ───────────────────────────────────────────── */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
            Primary use case
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {primaryUseCases.map((useCase) => (
              <button
                key={useCase}
                type="button"
                onClick={() => onSelectPrimaryUseCase(useCase)}
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-sm font-semibold transition-all duration-150 ${
                  selectedPrimaryUseCase === useCase
                    ? "border-indigo-500/30 bg-indigo-500/8 text-indigo-700 ring-1 ring-indigo-500/20 dark:border-indigo-400/30 dark:text-indigo-300"
                    : "border-border/60 bg-background text-slate-600 hover:border-slate-300 hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-900/60"
                }`}
              >
                <span className="text-base">{USE_CASE_ICONS[useCase]}</span>
                {useCase}
              </button>
            ))}
          </div>
        </div>

        {/* ── Error ─────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-amber-200/70 bg-amber-50/80 p-4 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/8 dark:text-amber-300"
            >
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Submit ─────────────────────────────────────────────────────── */}
        <Button
          size="lg"
          className="group w-full gap-2 bg-slate-900 text-white shadow-md shadow-black/10 transition-all hover:bg-slate-700 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900" />
              Generating audit...
            </>
          ) : (
            <>
              Generate My Audit
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
