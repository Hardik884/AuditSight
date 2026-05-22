import type { TeamSize } from "@/types/audit";

export const TEAM_SIZES = ["1-25", "26-100", "101-500", "500+"] as const;
export const TOOL_NAMES = [
  "ChatGPT",
  "Claude",
  "Cursor",
  "GitHub Copilot",
  "Gemini",
  "Perplexity",
] as const;
export const CHALLENGES = [
  "Unclear ROI",
  "Overlapping subscriptions",
  "Spend volatility",
  "Model quality drift",
] as const;
export const AUDIT_GOALS = [
  "Reduce monthly spend",
  "Improve usage governance",
  "Consolidate vendors",
  "Optimize model routing",
] as const;

export const PRIMARY_USE_CASES = [
  "Engineering",
  "Marketing",
  "Research",
  "Customer Support",
  "Operations",
  "Sales",
  "Content Creation",
] as const;

export const AUDIT_LIMITS = {
  maxMonthlySpend: 10_000_000,
  minMonthlySpend: 1,
} as const;

export const SIZE_FACTORS: Record<TeamSize, number> = {
  "1-25": 0.12,
  "26-100": 0.16,
  "101-500": 0.2,
  "500+": 0.24,
};

export const TOOL_FACTOR_INCREMENT = 0.06;
export const MIN_ESTIMATED_SAVINGS = 2500;
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
  challengePenalty: 8,
  sizePenalty: 8,
} as const;

export const POTENTIAL_SAVINGS_PERCENT_RANGE = {
  min: 8,
  max: 32,
} as const;

export const RECOMMENDATION_LIMITS = {
  max: 6,
  base: 3,
} as const;

export const IMPACT_MULTIPLIER = {
  min: 0.7,
  max: 1.6,
  divisor: 40_000,
} as const;

export const USAGE_INSIGHTS = {
  minSeatUtilization: 58,
  maxSeatUtilization: 92,
  promptVolumeMin: 1800,
  promptVolumeMax: 26_000,
  promptVolumeDivisor: 9,
} as const;
