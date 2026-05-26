import { describe, expect, it } from "vitest";
import {
  computeOptimizationScore,
  computeRiskLevel,
  computeRiskScore,
} from "@/lib/scoring-engine";
import { OPTIMIZATION_SCORE_CONFIG } from "@/constants/audit-config";

describe("scoring-engine", () => {
  it("assigns High risk for large, high-spend, multi-tool stacks", () => {
    const score = computeRiskScore(600, 6, 120_000);
    expect(score).toBeGreaterThanOrEqual(6);
    expect(computeRiskLevel(score)).toBe("High");
  });

  it("clamps optimization score to the configured minimum", () => {
    const score = computeOptimizationScore(50, 20, 10, 25, 5);
    expect(score).toBe(OPTIMIZATION_SCORE_CONFIG.minScore);
  });

  it("returns zero risk score when totalMonthlySpend is zero", () => {
    // No spend data → no risk signal, regardless of team size or tool count
    const score = computeRiskScore(500, 5, 0);
    expect(score).toBe(0);
    expect(computeRiskLevel(score)).toBe("Low");
  });

  it("applies higher penalty for cross-tool overlaps than per-tool rules", () => {
    // Same tool count, same per-tool rules, but different cross-tool count
    const baseScore = computeOptimizationScore(3, 0, 100, 1, 0);
    const overlapScore = computeOptimizationScore(3, 0, 100, 1, 2);
    // Two overlap rules should reduce the score by 2 * overlapPenalty
    expect(baseScore - overlapScore).toBe(2 * OPTIMIZATION_SCORE_CONFIG.overlapPenalty);
  });

  it("returns baseScore when no tools, no rules, and no utilization penalty", () => {
    // Zero tools, zero rules, 100% utilization → should return baseScore
    const score = computeOptimizationScore(0, 0, 100, 0, 0);
    expect(score).toBe(OPTIMIZATION_SCORE_CONFIG.baseScore);
  });
});
