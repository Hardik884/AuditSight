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
    const score = computeOptimizationScore(50, 20, 10, 25);
    expect(score).toBe(OPTIMIZATION_SCORE_CONFIG.minScore);
  });
});
