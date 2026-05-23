import type { AuditRequest, Recommendation, ToolBreakdown } from "@/types/audit";
import { LLM_TOOLS } from "@/lib/audit-rules";
import { computeConfidence } from "@/lib/scoring-engine";

const baseRecommendation = (
  overrides: Partial<Recommendation>
): Recommendation => ({
  title: "Optimization review",
  description: "Review vendor usage against team needs.",
  confidence: "Medium",
  estimatedSavingsImpact: 0,
  severity: "Low",
  difficulty: "Low",
  ...overrides,
});

export const buildRecommendations = (
  request: AuditRequest,
  toolBreakdown: ToolBreakdown[]
) => {
  const confidence = computeConfidence(request.tools.length, request.tools.reduce((sum, tool) => sum + tool.monthlySpend, 0));
  const recommendations: Recommendation[] = [];

  const llmTools = request.tools.filter((tool) => LLM_TOOLS.includes(tool.tool));
  const llmSpend = llmTools.reduce((sum, tool) => sum + tool.monthlySpend, 0);

  if (llmTools.length >= 2 && llmSpend > 0) {
    recommendations.push(
      baseRecommendation({
        title: "Consolidate overlapping LLM subscriptions",
        description: "Reduce redundant LLM plans and route workloads to primary vendors.",
        confidence,
        estimatedSavingsImpact: Math.round(llmSpend * 0.1),
        severity: "Medium",
        difficulty: "Medium",
      })
    );
  }

  toolBreakdown.forEach((entry) => {
    if (entry.projectedSavings <= 0) return;
    recommendations.push(
      baseRecommendation({
        title: entry.recommendedAction,
        description: entry.rationale,
        confidence,
        estimatedSavingsImpact: entry.projectedSavings,
        severity: entry.projectedSavings > 2000 ? "High" : "Medium",
        difficulty: "Low",
      })
    );
  });

  if (recommendations.length === 0) {
    recommendations.push(
      baseRecommendation({
        title: "Spend is aligned to current usage",
        description: "No immediate reductions detected based on the current plans and seat counts.",
        confidence: "Medium",
        estimatedSavingsImpact: 0,
        severity: "Low",
        difficulty: "Low",
      })
    );
  }

  return recommendations;
};
