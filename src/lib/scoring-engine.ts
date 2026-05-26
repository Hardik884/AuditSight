/**
 * AuditSight — Scoring Engine
 *
 * Computes risk levels, optimization scores, and confidence levels.
 * Confidence is now signal-driven rather than a function of tool count alone.
 */

import type { ConfidenceLevel, RiskLevel, ToolSelection } from "@/types/audit";
import type { RuleResult, CrossToolRuleResult } from "@/lib/audit-rules";
import {
  OPTIMIZATION_SCORE_CONFIG,
  RISK_SCORE_LIMITS,
  RISK_THRESHOLDS,
} from "@/constants/audit-config";

// ─── Utility ─────────────────────────────────────────────────────────────────

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// ─── Risk Scoring ─────────────────────────────────────────────────────────────

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
  // No spend data → no risk signal. Avoid penalizing teams that haven't
  // entered spend yet — a zero-spend audit is incomplete input, not a risk indicator.
  if (totalMonthlySpend === 0) return 0;

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

// ─── Optimization Scoring ────────────────────────────────────────────────────

export const computeOptimizationScore = (
  toolCount: number,
  highTierCount: number,
  seatUtilizationPercent: number,
  triggeredRuleCount: number = 0,
  crossToolTriggeredCount: number = 0
) => {
  const complexityPenalty =
    toolCount * OPTIMIZATION_SCORE_CONFIG.toolPenalty +
    highTierCount * 3 +
    (seatUtilizationPercent < 60 ? OPTIMIZATION_SCORE_CONFIG.sizePenalty : 0) +
    triggeredRuleCount * 2 + // Each triggered per-tool rule adds a small penalty
    crossToolTriggeredCount * OPTIMIZATION_SCORE_CONFIG.overlapPenalty; // Overlap rules are heavier

  return clamp(
    OPTIMIZATION_SCORE_CONFIG.baseScore - complexityPenalty,
    OPTIMIZATION_SCORE_CONFIG.minScore,
    OPTIMIZATION_SCORE_CONFIG.baseScore
  );
};

// ─── Signal-Based Confidence ─────────────────────────────────────────────────

/**
 * Confidence is derived from the quality of signals available, not just
 * the volume of data entered.
 *
 * High confidence:
 * - Clear, verifiable overlap (≥2 copilots, seats > teamSize)
 * - Confirmed overprovisioning (enterprise plan for tiny team)
 * - Hard billing anomaly (spend with 0 seats)
 *
 * Medium confidence:
 * - Pattern-based inference (LLM duplicate, high per-seat spend)
 * - API vs seat overlap (without token volume data)
 *
 * Low confidence:
 * - No rules triggered, or only speculative workflow assumptions
 * - Single tool with ambiguous configuration
 */
export const computeConfidenceFromSignals = (
  perToolResults: RuleResult[],
  crossToolResults: CrossToolRuleResult[]
): ConfidenceLevel => {
  const HIGH_CONFIDENCE_RULES = [
    "ZERO_SEAT_SPEND",
    "SEATS_EXCEED_TEAM",
    "ENTERPRISE_TINY_TEAM",
    "TEAM_PLAN_SOLO",
    "COPILOT_OVERLAP",
  ];

  const MEDIUM_CONFIDENCE_RULES = [
    "LLM_PREMIUM_DUPLICATE",
    "LLM_GEMINI_DUPLICATE",
    "HIGH_SPEND_PER_SEAT",
  ];

  const triggeredPer = perToolResults.filter((r) => r.triggered);
  const triggeredCross = crossToolResults.filter((r) => r.triggered);

  const hasHighSignal =
    triggeredPer.some((r) => HIGH_CONFIDENCE_RULES.includes(r.ruleId)) ||
    triggeredCross.some((r) => r.ruleId === "COPILOT_OVERLAP");

  if (hasHighSignal) return "High";

  const hasMediumSignal =
    triggeredPer.some((r) => MEDIUM_CONFIDENCE_RULES.includes(r.ruleId)) ||
    triggeredCross.some((r) => r.triggered);

  if (hasMediumSignal) return "Medium";

  return "Low";
};

/**
 * Legacy confidence fallback — used when no rule-based signals are available.
 * Kept for backward compatibility with any callers not yet migrated.
 */
export const computeConfidence = (
  toolCount: number,
  totalMonthlySpend: number
): ConfidenceLevel => {
  if (toolCount >= 4 && totalMonthlySpend > 60_000) return "High";
  if (toolCount >= 2) return "Medium";
  return "Low";
};

// ─── Seat & Spend Metrics ────────────────────────────────────────────────────

export const computeSeatUtilization = (teamSize: number, totalSeats: number) => {
  // Guard: zero or negative team size → no utilization signal
  if (teamSize <= 0) return 0;
  // totalSeats === 0 with a real team size legitimately returns 0 (no seats provisioned)
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
