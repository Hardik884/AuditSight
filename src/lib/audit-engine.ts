import type { AuditRequest, AuditResponse } from "@/types/audit";
import {
  GOVERNANCE_INSIGHT_TEMPLATES,
  OPTIMIZATION_OPPORTUNITY_TEMPLATES,
  TOOL_CATEGORY_MAP,
} from "@/lib/audit-rules";
import {
  computeEstimatedSavings,
  computeOptimizationScore,
  computePotentialSavingsPercent,
  computePromptVolume,
  computeRiskLevel,
  computeRiskScore,
  computeSeatUtilization,
} from "@/lib/scoring-engine";
import { buildRecommendations } from "@/lib/recommendation-engine";

export const generateAudit = (
  request: AuditRequest,
  requestId: string
): AuditResponse => {
  const riskScore = computeRiskScore(request);
  const riskLevel = computeRiskLevel(riskScore);
  const estimatedSavings = computeEstimatedSavings(request);
  const optimizationScore = computeOptimizationScore(request);
  const recommendations = buildRecommendations(request);
  const potentialSavingsPercent = computePotentialSavingsPercent(
    request,
    estimatedSavings
  );

  const toolCategories = Array.from(
    new Set(request.selectedTools.map((tool) => TOOL_CATEGORY_MAP[tool]))
  );

  const usageInsights = {
    topTools: request.selectedTools.slice(0, 3),
    seatUtilizationPercent: computeSeatUtilization(request.selectedTools.length),
    promptVolume: computePromptVolume(request.monthlySpend),
    toolCategories,
  };

  const auditSummary = {
    headline: "Audit complete with actionable savings",
    narrative: `We identified ${recommendations.length} high-impact opportunities with ${potentialSavingsPercent}% potential savings. Governance coverage is ${riskLevel.toLowerCase()} risk.`,
  };

  const governanceInsights = GOVERNANCE_INSIGHT_TEMPLATES.slice(
    0,
    request.selectedTools.length >= 4 ? 3 : 2
  );

  const optimizationOpportunities = OPTIMIZATION_OPPORTUNITY_TEMPLATES.slice(
    0,
    request.selectedTools.length >= 3 ? 4 : 3
  );

  return {
    requestId,
    generatedAt: new Date().toISOString(),
    metrics: {
      estimatedSavings,
      optimizationScore,
      riskLevel,
      potentialSavingsPercent,
    },
    recommendations,
    auditSummary,
    usageInsights,
    optimizationOpportunities,
    governanceInsights,
  };
};
