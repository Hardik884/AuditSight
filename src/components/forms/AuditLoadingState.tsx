interface AuditLoadingStateProps {
  steps: readonly string[];
  status: "idle" | "loading" | "complete";
  progressIndex: number;
  progressPercent: number;
  errorMessage: string | null;
  onReset: () => void;
}

export function AuditLoadingState({
  steps,
  status,
  progressIndex,
  progressPercent,
  errorMessage,
  onReset,
}: AuditLoadingStateProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Audit generation
      </p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        We simulate an intelligent audit flow to preview the experience.
      </p>

      <div className="mt-6 space-y-4">
        {steps.map((step, index) => {
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
          onClick={onReset}
          className="ml-2 text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
        >
          Run again
        </button>
      </div>
    </div>
  );
}
