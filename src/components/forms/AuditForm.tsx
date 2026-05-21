import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuditGoal, Challenge, TeamSize, ToolName } from "@/types/audit";

interface AuditFormProps {
  teamSizes: readonly TeamSize[];
  aiTools: readonly ToolName[];
  challenges: readonly Challenge[];
  goals: readonly AuditGoal[];
  selectedSize: TeamSize;
  selectedTools: ToolName[];
  monthlySpend: string;
  selectedChallenge: Challenge;
  selectedGoals: AuditGoal[];
  isSubmitting: boolean;
  errorMessage: string | null;
  onSelectSize: (size: TeamSize) => void;
  onToggleTool: (tool: ToolName) => void;
  onSpendChange: (value: string) => void;
  onSelectChallenge: (challenge: Challenge) => void;
  onToggleGoal: (goal: AuditGoal) => void;
  onSubmit: () => void;
}

export function AuditForm({
  teamSizes,
  aiTools,
  challenges,
  goals,
  selectedSize,
  selectedTools,
  monthlySpend,
  selectedChallenge,
  selectedGoals,
  isSubmitting,
  errorMessage,
  onSelectSize,
  onToggleTool,
  onSpendChange,
  onSelectChallenge,
  onToggleGoal,
  onSubmit,
}: AuditFormProps) {
  return (
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
                onClick={() => onSelectSize(size)}
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
                onClick={() => onToggleTool(tool)}
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
              onChange={(event) => onSpendChange(event.target.value)}
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
                onClick={() => onSelectChallenge(challenge)}
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
                onClick={() => onToggleGoal(goal)}
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
