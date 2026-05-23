import type { AuditRequest, AuditResponse } from "@/types/audit";
import {
  GOVERNANCE_INSIGHT_TEMPLATES,
  OPTIMIZATION_OPPORTUNITY_TEMPLATES,
  HIGH_TIER_PLANS,
  LLM_TOOLS,
  getDowngradePlan,
} from "@/lib/audit-rules";
import {
  computeOptimizationScore,
  computePotentialSavingsPercent,
  computeRiskLevel,
  computeRiskScore,
  computeSeatUtilization,
  computeTotalMonthlySpend,
  computeTotalSeats,
} from "@/lib/scoring-engine";
import { buildRecommendations } from "@/lib/recommendation-engine";
import { getToolCategory } from "@/constants/pricing";

export const generateAudit = (
  request: AuditRequest,
  auditId: string
): AuditResponse => {
  const totalMonthlySpend = computeTotalMonthlySpend(request.tools);
  const totalSeats = computeTotalSeats(request.tools);
  const seatUtilizationPercent = computeSeatUtilization(request.teamSize, totalSeats);
  const highTierCount = request.tools.filter((tool) =>
    (HIGH_TIER_PLANS[tool.tool] ?? []).includes(tool.plan)
  ).length;

  const riskScore = computeRiskScore(
    request.teamSize,
    request.tools.length,
    totalMonthlySpend
  );
  const riskLevel = computeRiskLevel(riskScore);
  const optimizationScore = computeOptimizationScore(
    request.tools.length,
    highTierCount,
    seatUtilizationPercent
  );

  const toolBreakdown = request.tools.map((toolEntry) => {
    const highTierPlans = HIGH_TIER_PLANS[toolEntry.tool] ?? [];
    const isHighTier = highTierPlans.includes(toolEntry.plan);
    const downgradePlan = getDowngradePlan(toolEntry.tool, toolEntry.plan);
    const hasSpend = toolEntry.monthlySpend > 0;

    if (toolEntry.seatCount === 0 && hasSpend) {
      return {
        ...toolEntry,
        recommendedAction: "Reconcile unused seats",
        projectedSavings: Math.round(toolEntry.monthlySpend * 0.15),
        rationale: "Reported spend exists without active seats. Review billing owners and remove idle plans.",
      };
    }

    if (toolEntry.seatCount > request.teamSize) {
      return {
        ...toolEntry,
        recommendedAction: "Reduce seat count",
        projectedSavings: Math.round(toolEntry.monthlySpend * 0.1),
        rationale: "Seat count exceeds reported team size. Align licenses with active users.",
      };
    }

    if (isHighTier && toolEntry.seatCount <= Math.max(3, Math.round(request.teamSize * 0.1))) {
      return {
        ...toolEntry,
        recommendedAction: downgradePlan
          ? `Downgrade to ${downgradePlan}`
          : "Review plan tier",
        projectedSavings: Math.round(toolEntry.monthlySpend * 0.2),
        rationale: "High-tier plan coverage is oversized for the current seat count.",
      };
    }

    return {
      ...toolEntry,
      recommendedAction: "Keep current plan",
      projectedSavings: 0,
      rationale: "Spend and seat allocation appear aligned for this tool.",
    };
  });

  const llmTools = toolBreakdown.filter((tool) => LLM_TOOLS.includes(tool.tool));
  if (llmTools.length >= 2) {
    const primary = [...llmTools].sort((a, b) => b.monthlySpend - a.monthlySpend)[0];
    toolBreakdown.forEach((tool) => {
      if (tool.tool === primary.tool) return;
      if (tool.projectedSavings > 0) return;
      if (!LLM_TOOLS.includes(tool.tool)) return;
      tool.projectedSavings = Math.round(tool.monthlySpend * 0.1);
      tool.recommendedAction = `Consolidate with ${primary.tool}`;
      tool.rationale = "Multiple LLM subscriptions overlap in capability. Consolidate where possible.";
    });
  }

  const estimatedSavings = toolBreakdown.reduce(
    (sum, tool) => sum + tool.projectedSavings,
    0
  );
  const annualSavings = estimatedSavings * 12;
  const potentialSavingsPercent = computePotentialSavingsPercent(
    estimatedSavings,
    totalMonthlySpend
  );

  const recommendations = buildRecommendations(request, toolBreakdown);
  const toolCategories = Array.from(
    new Set(request.tools.map((tool) => getToolCategory(tool.tool)))
  );
  const topTools = [...toolBreakdown]
    .sort((a, b) => b.monthlySpend - a.monthlySpend)
    .slice(0, 3)
    .map((tool) => tool.tool);
  const highestSpendTool = toolBreakdown.length > 0 ? topTools[0] : null;

  const usageInsights = {
    topTools,
    seatUtilizationPercent,
    highestSpendTool,
    toolCategories,
  };

  const auditSummary = {
    headline:
      estimatedSavings > 0
        ? "Audit complete with prioritized savings"
        : "Current spend aligns with usage",
    narrative:
      estimatedSavings > 0
        ? `We identified ${recommendations.length} optimization opportunities with ${potentialSavingsPercent}% potential savings across your current plans.`
        : "Current plan mix appears reasonable. Continue monitoring seat utilization and vendor overlap for future optimization.",
  };

  const governanceInsights = GOVERNANCE_INSIGHT_TEMPLATES.slice(
    0,
    request.tools.length >= 4 ? 3 : 2
  );

  const optimizationOpportunities = OPTIMIZATION_OPPORTUNITY_TEMPLATES.slice(
    0,
    request.tools.length >= 3 ? 4 : 3
  );

  return {
    auditId,
    generatedAt: new Date().toISOString(),
    metrics: {
      estimatedSavings,
      annualSavings,
      optimizationScore,
      riskLevel,
      potentialSavingsPercent,
      totalMonthlySpend,
      totalSeats,
    },
    recommendations,
    auditSummary,
    usageInsights,
    toolBreakdown,
    optimizationOpportunities,
    governanceInsights,
  };
};
