"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle, RotateCcw } from "lucide-react";

interface AuditLoadingStateProps {
  steps: readonly string[];
  status: "idle" | "loading" | "complete";
  progressIndex: number;
  progressPercent: number;
  errorMessage: string | null;
  successMessage: string;
  onReset: () => void;
}

export function AuditLoadingState({
  steps,
  status,
  progressIndex,
  progressPercent,
  errorMessage,
  successMessage,
  onReset,
}: AuditLoadingStateProps) {
  const isIdle = status === "idle";
  const isLoading = status === "loading";
  const isComplete = status === "complete";

  return (
    <div className="rounded-3xl border border-border/60 bg-background p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Audit generation
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {isIdle
              ? "Fill in your details to start the audit."
              : isLoading
              ? "Processing your AI stack..."
              : "Analysis complete."}
          </p>
        </div>
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
        )}
        {isComplete && (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        )}
      </div>

      {/* Steps */}
      <div className="mt-6 space-y-2.5">
        {steps.map((step, index) => {
          const stepComplete =
            isComplete || (isLoading && index < progressIndex);
          const stepActive = isLoading && index === progressIndex;

          return (
            <motion.div
              key={step}
              initial={false}
              animate={{
                opacity: isIdle ? 0.4 : 1,
              }}
              transition={{ duration: 0.3 }}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors duration-300 ${
                stepComplete
                  ? "border-emerald-200/60 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/8"
                  : stepActive
                  ? "border-indigo-200/70 bg-indigo-50/60 dark:border-indigo-400/30 dark:bg-indigo-500/8"
                  : "border-border/50 bg-slate-50/40 dark:bg-slate-900/20"
              }`}
            >
              <span
                className={`font-medium ${
                  stepComplete
                    ? "text-emerald-700 dark:text-emerald-300"
                    : stepActive
                    ? "text-indigo-700 dark:text-indigo-300"
                    : "text-slate-400"
                }`}
              >
                {step}
              </span>
              <div className="shrink-0">
                {stepComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : stepActive ? (
                  <span className="flex h-4 w-4 items-center justify-center">
                    <span className="h-2 w-2 animate-ping rounded-full bg-indigo-400 opacity-75" />
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Audit progress</span>
          <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
            {progressPercent}%
          </span>
        </div>
        <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-indigo-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {/* Shimmer overlay (only while loading) */}
          {isLoading && progressPercent > 0 && (
            <div
              className="shimmer absolute inset-0"
              style={{ width: `${progressPercent}%` }}
            />
          )}
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/80 p-4 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/8 dark:text-amber-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success state */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/8"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {successMessage}
              </p>
              <button
                type="button"
                onClick={onReset}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-100/60 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
              >
                <RotateCcw className="h-3 w-3" />
                Run again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle placeholder */}
      {isIdle && (
        <div className="mt-5 space-y-2.5">
          {["Savings analysis", "Governance check", "ROI calculation"].map((item) => (
            <div
              key={item}
              className="h-8 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60"
            />
          ))}
        </div>
      )}
    </div>
  );
}
