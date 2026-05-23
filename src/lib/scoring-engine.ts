import type { ConfidenceLevel, RiskLevel, ToolSelection } from "@/types/audit";
import {
  OPTIMIZATION_SCORE_CONFIG,
  RISK_SCORE_LIMITS,
  RISK_THRESHOLDS,
} from "@/constants/audit-config";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const computeRiskLevel = (score: number): RiskLevel => {
  if (score >= RISK_THRESHOLDS.critical) return "Critical";
  if (score >= RISK_THRESHOLDS.high) return "High";
  if (score >= RISK_THRESHOLDS.moderate) return "Moderate";
  return "Low";
};

export const computeRiskScore = (
  teamSize: number,
  toolCount: number,
  totalMonthlySpend: number
) => {
  let score = 0;
  const [lowSpend, midSpend, highSpend] = RISK_SCORE_LIMITS.spend;
  const [toolMid, toolHigh] = RISK_SCORE_LIMITS.toolCounts;

  if (totalMonthlySpend > highSpend) score += 3;
  else if (totalMonthlySpend > midSpend) score += 2;
  else if (totalMonthlySpend > lowSpend) score += 1;

  if (teamSize >= 500) score += 3;
  else if (teamSize >= 100) score += 2;
  else if (teamSize >= 25) score += 1;

  if (toolCount >= toolHigh) score += 2;
  else if (toolCount >= toolMid) score += 1;

  return score;
};

export const computeOptimizationScore = (
  toolCount: number,
  highTierCount: number,
  seatUtilizationPercent: number
) => {
  const complexityPenalty =
    toolCount * OPTIMIZATION_SCORE_CONFIG.toolPenalty +
    highTierCount * 3 +
    (seatUtilizationPercent < 60 ? OPTIMIZATION_SCORE_CONFIG.sizePenalty : 0);

  return clamp(
    OPTIMIZATION_SCORE_CONFIG.baseScore - complexityPenalty,
    OPTIMIZATION_SCORE_CONFIG.minScore,
    OPTIMIZATION_SCORE_CONFIG.baseScore
  );
};

export const computeConfidence = (
  toolCount: number,
  totalMonthlySpend: number
): ConfidenceLevel => {
  if (toolCount >= 4 && totalMonthlySpend > 60_000) {
    return "High";
  }
  if (toolCount >= 2) return "Medium";
  return "Low";
};

export const computeSeatUtilization = (teamSize: number, totalSeats: number) => {
  if (teamSize <= 0) return 0;
  return clamp(Math.round((totalSeats / teamSize) * 100), 0, 100);
};

export const computePotentialSavingsPercent = (
  estimatedSavings: number,
  totalMonthlySpend: number
) => {
  if (totalMonthlySpend <= 0) return 0;
  return clamp(Math.round((estimatedSavings / totalMonthlySpend) * 100), 0, 40);
};

export const computeTotalMonthlySpend = (tools: ToolSelection[]) =>
  tools.reduce((total, tool) => total + tool.monthlySpend, 0);

export const computeTotalSeats = (tools: ToolSelection[]) =>
  tools.reduce((total, tool) => total + tool.seatCount, 0);
