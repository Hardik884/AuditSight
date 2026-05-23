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
  baseScore: 92,
  minScore: 48,
  toolPenalty: 4,
  sizePenalty: 8,
} as const;

