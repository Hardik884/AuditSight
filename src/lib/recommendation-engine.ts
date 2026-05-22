import type { AuditRequest, Recommendation } from "@/types/audit";
import {
  CHALLENGE_RECOMMENDATIONS,
  GOAL_RECOMMENDATIONS,
  TOOL_BASED_RECOMMENDATIONS,
  TOOL_CATEGORY_MAP,
  USE_CASE_RECOMMENDATIONS,
} from "@/lib/audit-rules";
import { RECOMMENDATION_LIMITS } from "@/constants/audit-config";
import { computeConfidence, computeImpactMultiplier } from "@/lib/scoring-engine";

const adjustRecommendationImpact = (
  recommendation: Recommendation,
  multiplier: number
): Recommendation => ({
  ...recommendation,
  estimatedSavingsImpact: Math.round(recommendation.estimatedSavingsImpact * multiplier),
});

const adjustDifficulty = (recommendation: Recommendation, factor: number): Recommendation => {
  if (factor > 1.2 && recommendation.difficulty === "Low") {
    return { ...recommendation, difficulty: "Medium" };
  }
  if (factor > 1.4 && recommendation.difficulty === "Medium") {
    return { ...recommendation, difficulty: "High" };
  }
  return recommendation;
};

export const buildRecommendations = (request: AuditRequest) => {
  const confidence = computeConfidence(request);
  const impactMultiplier = computeImpactMultiplier(request.monthlySpend);
  const toolCategories = Array.from(
    new Set(request.selectedTools.map((tool) => TOOL_CATEGORY_MAP[tool]))
  );

  const baseRecs = [
    ...CHALLENGE_RECOMMENDATIONS[request.biggestChallenge],
    USE_CASE_RECOMMENDATIONS[request.primaryUseCase],
    ...request.auditGoals.map((goal) => GOAL_RECOMMENDATIONS[goal]),
  ];

  const toolRecs = toolCategories.includes("Developer")
    ? [TOOL_BASED_RECOMMENDATIONS[0]]
    : [];
  const llmRecs = toolCategories.includes("LLM")
    ? [TOOL_BASED_RECOMMENDATIONS[1]]
    : [];
  const searchRecs = toolCategories.includes("Search")
    ? [TOOL_BASED_RECOMMENDATIONS[2]]
    : [];

  const totalRecommendations = Math.min(
    RECOMMENDATION_LIMITS.max,
    RECOMMENDATION_LIMITS.base + request.selectedTools.length
  );

  return [...baseRecs, ...toolRecs, ...llmRecs, ...searchRecs]
    .slice(0, totalRecommendations)
    .map((recommendation) => ({
      ...adjustDifficulty(
        adjustRecommendationImpact(recommendation, impactMultiplier),
        impactMultiplier
      ),
      confidence,
    }));
};
