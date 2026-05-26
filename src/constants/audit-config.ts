export const PRIMARY_USE_CASES = ["Coding", "Writing", "Data", "Research", "Mixed"] as const;

export const TEAM_SIZE_LIMITS = {
  min: 1,
  max: 5000,
} as const;

export const AUDIT_LIMITS = {
  maxMonthlySpend: 10_000_000,
  minMonthlySpend: 0,
} as const;

export const CONSULTATION_THRESHOLD = 10000;

export const RISK_THRESHOLDS = {
  critical: 9,
  high: 6,
  moderate: 3,
} as const;

export const RISK_SCORE_LIMITS = {
  spend: [20_000, 50_000, 100_000],
  toolCounts: [3, 5],
} as const;

export const OPTIMIZATION_SCORE_CONFIG = {
  /** A perfectly lean, right-sized stack scores 90 — not 100, because there is always monitoring overhead */
  baseScore: 90,
  minScore: 48,
  /** Per-tool penalty: each additional tool adds governance and overlap risk */
  toolPenalty: 3,
  /** Seat utilization penalty: low utilization (< 60%) is a material governance signal */
  sizePenalty: 10,
  /** Overlap penalty: applied once per triggered cross-tool overlap rule (copilot, LLM duplicate) */
  overlapPenalty: 6,
} as const;

