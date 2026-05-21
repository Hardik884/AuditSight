import type {
  AuditRequest,
  ConfidenceLevel,
  RiskLevel,
} from "@/types/audit";
import {
  IMPACT_MULTIPLIER,
  MIN_ESTIMATED_SAVINGS,
  OPTIMIZATION_SCORE_CONFIG,
  POTENTIAL_SAVINGS_PERCENT_RANGE,
  RISK_SCORE_LIMITS,
  RISK_THRESHOLDS,
  SIZE_FACTORS,
  TOOL_FACTOR_INCREMENT,
  USAGE_INSIGHTS,
} from "@/constants/audit-config";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const computeRiskLevel = (score: number): RiskLevel => {
  if (score >= RISK_THRESHOLDS.critical) return "Critical";
  if (score >= RISK_THRESHOLDS.high) return "High";
  if (score >= RISK_THRESHOLDS.moderate) return "Moderate";
  return "Low";
};

export const computeRiskScore = (request: AuditRequest) => {
  let score = 0;
  const [lowSpend, midSpend, highSpend] = RISK_SCORE_LIMITS.spend;
  const [toolMid, toolHigh] = RISK_SCORE_LIMITS.toolCounts;

  if (request.monthlySpend > highSpend) score += 3;
  else if (request.monthlySpend > midSpend) score += 2;
  else if (request.monthlySpend > lowSpend) score += 1;

  if (request.teamSize === "500+") score += 3;
  else if (request.teamSize === "101-500") score += 2;
  else if (request.teamSize === "26-100") score += 1;

  if (request.selectedTools.length >= toolHigh) score += 2;
  else if (request.selectedTools.length >= toolMid) score += 1;

  if (request.biggestChallenge === "Overlapping subscriptions") score += 2;
  if (request.biggestChallenge === "Spend volatility") score += 1;

  return score;
};

export const computeOptimizationScore = (request: AuditRequest) => {
  const complexityPenalty =
    request.selectedTools.length * OPTIMIZATION_SCORE_CONFIG.toolPenalty +
    (request.biggestChallenge === "Spend volatility"
      ? OPTIMIZATION_SCORE_CONFIG.challengePenalty
      : OPTIMIZATION_SCORE_CONFIG.toolPenalty) +
    (request.teamSize === "500+" ? OPTIMIZATION_SCORE_CONFIG.sizePenalty : OPTIMIZATION_SCORE_CONFIG.toolPenalty);

  return clamp(
    OPTIMIZATION_SCORE_CONFIG.baseScore - complexityPenalty,
    OPTIMIZATION_SCORE_CONFIG.minScore,
    OPTIMIZATION_SCORE_CONFIG.baseScore
  );
};

export const computeConfidence = (request: AuditRequest): ConfidenceLevel => {
  if (request.selectedTools.length >= 4 && request.monthlySpend > 60_000) {
    return "High";
  }
  if (request.selectedTools.length >= 2) return "Medium";
  return "Low";
};

export const computeEstimatedSavings = (request: AuditRequest) => {
  const sizeFactor = SIZE_FACTORS[request.teamSize];
  const toolFactor = 1 + request.selectedTools.length * TOOL_FACTOR_INCREMENT;
  const base = request.monthlySpend * sizeFactor * toolFactor;
  return Math.max(base, MIN_ESTIMATED_SAVINGS);
};

export const computePotentialSavingsPercent = (request: AuditRequest, estimatedSavings: number) =>
  clamp(
    Math.round((estimatedSavings / request.monthlySpend) * 100),
    POTENTIAL_SAVINGS_PERCENT_RANGE.min,
    POTENTIAL_SAVINGS_PERCENT_RANGE.max
  );

export const computeImpactMultiplier = (monthlySpend: number) =>
  clamp(monthlySpend / IMPACT_MULTIPLIER.divisor, IMPACT_MULTIPLIER.min, IMPACT_MULTIPLIER.max);

export const computeSeatUtilization = (toolCount: number) =>
  clamp(100 - toolCount * 8, USAGE_INSIGHTS.minSeatUtilization, USAGE_INSIGHTS.maxSeatUtilization);

export const computePromptVolume = (monthlySpend: number) =>
  clamp(
    Math.round(monthlySpend / USAGE_INSIGHTS.promptVolumeDivisor),
    USAGE_INSIGHTS.promptVolumeMin,
    USAGE_INSIGHTS.promptVolumeMax
  );
