/**
 * AuditSight — Audit Engine
 *
 * Orchestrates the full audit pipeline:
 *  1. Run per-tool rules against each tool entry
 *  2. Run cross-tool rules across the full tool set
 *  3. Assemble tool breakdown with defensible savings estimates
 *  4. Build recommendations (de-duplicated, prioritized)
 *  5. Compute metrics and produce an honest executive summary
 *
 * Savings honesty rules:
 *  - Every per-tool saving derives from a rule with a concrete price basis
 *  - Cross-tool savings are conservative (≤50% of secondary spend)
 *  - Total projected savings < $100/mo → summary says stack is cost-efficient
 *  - We never claim savings we cannot explain
 */

import type { AuditRequest, AuditResponse, ConfidenceLevel, ToolBreakdown, ToolSelection } from "@/types/audit";
import {
  GOVERNANCE_INSIGHT_TEMPLATES,
  OPTIMIZATION_OPPORTUNITY_TEMPLATES,
  HIGH_TIER_PLANS,
  ruleZeroSeatSpend,
  ruleSeatsExceedTeam,
  ruleEnterpriseTinyTeam,
  ruleTeamPlanSolo,
  ruleHighSpendPerSeat,
  ruleLowUtilizationHighSpend,
  ruleSingleToolNoSpend,
  ruleCopilotOverlap,
  ruleLlmPremiumDuplicate,
  ruleLlmGeminiDuplicate,
  ruleApiVsSeatSameVendor,
} from "@/lib/audit-rules";
import type { CrossToolRuleResult, RuleResult } from "@/lib/audit-rules";
import {
  computeOptimizationScore,
  computePotentialSavingsPercent,
  computeRiskLevel,
  computeRiskScore,
  computeSeatUtilization,
  computeTotalMonthlySpend,
  computeTotalSeats,
  computeConfidenceFromSignals,
} from "@/lib/scoring-engine";
import { buildRecommendations } from "@/lib/recommendation-engine";
import { getToolCategory, getPlanDetail } from "@/constants/pricing";
import { OPTIMIZATION_SCORE_CONFIG } from "@/constants/audit-config";

// ─── Minimum savings threshold for the executive summary optimism ─────────────

/** Below this monthly total, the summary says the stack is cost-efficient */
const EXECUTIVE_SAVINGS_FLOOR = 100;

// ─── Per-Tool Rule Runner ────────────────────────────────────────────────────

/**
 * Runs all per-tool rules in priority order.
 * Returns the first triggered rule result (or the last if none trigger).
 * Rules are evaluated in order from most to least certain.
 */
const runPerToolRules = (
  entry: ToolSelection,
  teamSize: number,
  totalToolCount: number
): RuleResult => {
  const rules = [
    ruleSingleToolNoSpend(entry, totalToolCount),
    ruleZeroSeatSpend(entry),
    ruleSeatsExceedTeam(entry, teamSize),
    ruleEnterpriseTinyTeam(entry, teamSize),
    ruleTeamPlanSolo(entry),
    ruleHighSpendPerSeat(entry),
    ruleLowUtilizationHighSpend(entry, teamSize, totalToolCount),
  ];

  const triggered = rules.find((r) => r.triggered);
  if (triggered) return triggered;

  // No rule triggered — tool appears cost-efficient
  return {
    ruleId: "COST_EFFICIENT",
    triggered: false,
    savings: 0,
    confidence: "High",
    action: "Keep current plan",
    rationale:
      "Spend and seat allocation appear aligned with the reported team size and plan tier. No optimization opportunities identified for this tool.",
  };
};

// ─── Cross-Tool Rule Runner ──────────────────────────────────────────────────

const runCrossToolRules = (
  tools: ToolSelection[]
): CrossToolRuleResult[] => {
  const results: CrossToolRuleResult[] = [];

  const copilotResult = ruleCopilotOverlap(tools);
  if (copilotResult.triggered) results.push(copilotResult);

  const llmResult = ruleLlmPremiumDuplicate(tools);
  if (llmResult.triggered) results.push(llmResult);

  const geminiResult = ruleLlmGeminiDuplicate(tools);
  if (geminiResult.triggered) results.push(geminiResult);

  const apiResults = ruleApiVsSeatSameVendor(tools);
  results.push(...apiResults.filter((r) => r.triggered));

  return results;
};

// ─── Governance Insight Selector ─────────────────────────────────────────────

const selectGovernanceInsights = (
  toolCount: number,
  tools: ToolSelection[],
  crossToolResults: CrossToolRuleResult[],
  hasApiTools: boolean
): string[] => {
  const insights: string[] = [];

  if (toolCount >= 2) {
    insights.push(GOVERNANCE_INSIGHT_TEMPLATES[1]); // spend fragmented
  }
  if (crossToolResults.length > 0) {
    insights.push(GOVERNANCE_INSIGHT_TEMPLATES[0]); // no centralized owner
  }
  if (hasApiTools) {
    insights.push(GOVERNANCE_INSIGHT_TEMPLATES[3]); // API spend guardrails
  }
  if (toolCount >= 4 && insights.length < 3) {
    insights.push(GOVERNANCE_INSIGHT_TEMPLATES[2]); // seat allocation policies
  }
  // Flag renewal review when any tool has custom/enterprise pricing (monthlyPricePerSeat === 0
  // with a non-API plan indicates a negotiated contract without published pricing)
  if (insights.length < 3) {
    const hasCustomPricedEnterprisePlan = tools.some((t) => {
      const detail = getPlanDetail(t.tool, t.plan);
      return detail !== null && detail.monthlyPricePerSeat === 0 && t.monthlySpend > 0;
    });
    if (hasCustomPricedEnterprisePlan) {
      insights.push(GOVERNANCE_INSIGHT_TEMPLATES[4]); // vendor contract renewal dates
    }
  }

  return insights.slice(0, 3);
};

// ─── Optimization Opportunity Selector ────────────────────────────────────────

const selectOptimizationOpportunities = (
  crossToolResults: CrossToolRuleResult[],
  hasApiTools: boolean,
  hasSeatsAboveTeam: boolean
): string[] => {
  const opportunities: string[] = [];

  if (crossToolResults.some((r) => r.ruleId === "COPILOT_OVERLAP")) {
    opportunities.push(OPTIMIZATION_OPPORTUNITY_TEMPLATES[0]);
  }
  if (hasSeatsAboveTeam) {
    opportunities.push(OPTIMIZATION_OPPORTUNITY_TEMPLATES[1]);
  }
  if (hasApiTools) {
    opportunities.push(OPTIMIZATION_OPPORTUNITY_TEMPLATES[2]);
  }
  opportunities.push(OPTIMIZATION_OPPORTUNITY_TEMPLATES[3]); // always recommend quarterly review

  if (opportunities.length < 3) {
    opportunities.push(OPTIMIZATION_OPPORTUNITY_TEMPLATES[4]);
  }

  return opportunities.slice(0, 4);
};

// ─── Savings Cause Phrase ──────────────────────────────────────────────────────

/**
 * Derives a specific, contextual cause phrase for the executive summary
 * based on which rules actually triggered — rather than using a generic catch-all.
 */
const deriveSavingsCausePhrase = (
  perToolResults: RuleResult[],
  crossToolResults: CrossToolRuleResult[]
): string => {
  const triggeredCrossIds = crossToolResults.filter((r) => r.triggered).map((r) => r.ruleId);
  const triggeredPerIds = perToolResults.filter((r) => r.triggered).map((r) => r.ruleId);

  if (triggeredCrossIds.includes("COPILOT_OVERLAP")) {
    return "driven by tool overlap consolidation opportunities";
  }
  if (triggeredPerIds.includes("SEATS_EXCEED_TEAM")) {
    return "driven by seat right-sizing opportunities";
  }
  if (
    triggeredPerIds.includes("ENTERPRISE_TINY_TEAM") ||
    triggeredPerIds.includes("TEAM_PLAN_SOLO")
  ) {
    return "driven by plan-tier optimization";
  }
  if (
    triggeredCrossIds.includes("LLM_PREMIUM_DUPLICATE") ||
    triggeredCrossIds.includes("LLM_GEMINI_DUPLICATE")
  ) {
    return "driven by overlapping LLM subscription consolidation";
  }
  if (triggeredPerIds.includes("HIGH_SPEND_PER_SEAT")) {
    return "driven by billing anomalies and contract reconciliation";
  }
  return "driven by plan-tier alignment and seat utilization analysis";
};

// ─── Executive Summary Builder ────────────────────────────────────────────────

const buildAuditSummary = (
  estimatedSavings: number,
  potentialSavingsPercent: number,
  recommendationCount: number,
  totalMonthlySpend: number,
  causePhrase: string
): { headline: string; narrative: string } => {
  const isOptimized = estimatedSavings < EXECUTIVE_SAVINGS_FLOOR;

  if (totalMonthlySpend === 0) {
    return {
      headline: "Audit complete — no spend data provided",
      narrative:
        "Enter monthly spend values for each tool to enable savings analysis. The audit engine requires reported spend to compute defensible optimization estimates.",
    };
  }

  if (isOptimized) {
    return {
      headline: "Current AI spend configuration appears cost-efficient",
      narrative:
        "Based on reported spend, seat allocations, and plan tiers, no material optimization opportunities were identified. Continue monitoring vendor pricing, headcount changes, and new tool additions on a quarterly basis to maintain spend efficiency.",
    };
  }

  const savingsText =
    potentialSavingsPercent >= 5
      ? `approximately ${potentialSavingsPercent}% of current monthly spend`
      : `an estimated $${estimatedSavings.toLocaleString()}/month`;

  return {
    headline: `${recommendationCount} optimization ${recommendationCount === 1 ? "opportunity" : "opportunities"} identified`,
    narrative: `The audit identified potential savings of ${savingsText} ${causePhrase}. Estimates are conservative and derived from published vendor pricing. Actual savings will depend on implementation timing and vendor negotiation.`,
  };
};

// ─── Main Audit Generator ────────────────────────────────────────────────────

export const generateAudit = (
  request: AuditRequest,
  auditId: string
): AuditResponse => {
  const { tools, teamSize } = request;

  // ── Metrics ────────────────────────────────────────────────────────────────
  const totalMonthlySpend = computeTotalMonthlySpend(tools);
  const totalSeats = computeTotalSeats(tools);
  const seatUtilizationPercent = computeSeatUtilization(teamSize, totalSeats);

  const highTierCount = tools.filter((tool) =>
    (HIGH_TIER_PLANS[tool.tool] ?? []).includes(tool.plan)
  ).length;

  const riskScore = computeRiskScore(teamSize, tools.length, totalMonthlySpend);
  const riskLevel = computeRiskLevel(riskScore);

  // ── Per-Tool Analysis ───────────────────────────────────────────────────────
  const perToolResults: RuleResult[] = tools.map((entry) =>
    runPerToolRules(entry, teamSize, tools.length)
  );

  // ── Cross-Tool Analysis ────────────────────────────────────────────────────
  const crossToolResults = runCrossToolRules(tools);

  // ── Confidence ─────────────────────────────────────────────────────────────
  const confidence: ConfidenceLevel = computeConfidenceFromSignals(
    perToolResults,
    crossToolResults
  );

  // ── Tool Breakdown Assembly ─────────────────────────────────────────────────
  const toolBreakdown: ToolBreakdown[] = tools.map((entry, i) => {
    const result = perToolResults[i]!;
    return {
      ...entry,
      recommendedAction: result.action,
      projectedSavings: result.savings,
      rationale: result.rationale,
      confidence,
      ruleId: result.ruleId,
    };
  });

  // ── Aggregate Savings ───────────────────────────────────────────────────────
  // Cross-tool savings are capped at their own rule estimates to avoid double-counting
  const crossToolSavings = crossToolResults
    .filter((r) => r.triggered)
    .reduce((sum, r) => sum + r.savings, 0);

  // De-duplicate: if a tool is covered by a cross-tool rule, don't add per-tool savings for it
  const crossToolCoveredTools = new Set(
    crossToolResults
      .filter((r) => r.triggered && r.savings > 0)
      .flatMap((r) => r.affectedTools as string[])
  );
  const dedupedPerToolSavings = toolBreakdown.reduce((sum, t) => {
    if (crossToolCoveredTools.has(t.tool) && crossToolSavings > 0) return sum;
    return sum + t.projectedSavings;
  }, 0);

  const estimatedSavings = dedupedPerToolSavings + crossToolSavings;
  const annualSavings = estimatedSavings * 12;
  const potentialSavingsPercent = computePotentialSavingsPercent(
    estimatedSavings,
    totalMonthlySpend
  );

  // ── Optimization Score ────────────────────────────────────────────────────
  const perToolTriggeredCount = perToolResults.filter((r) => r.triggered).length;
  const crossToolTriggeredCount = crossToolResults.filter((r) => r.triggered).length;

  // Zero-spend + zero-seats edge case: no data → no penalty, report base score
  const optimizationScore =
    totalMonthlySpend === 0 && totalSeats === 0
      ? OPTIMIZATION_SCORE_CONFIG.baseScore
      : computeOptimizationScore(
          tools.length,
          highTierCount,
          seatUtilizationPercent,
          perToolTriggeredCount,
          crossToolTriggeredCount
        );

  // ── Recommendations ────────────────────────────────────────────────────────
  const recommendations = buildRecommendations(
    request,
    toolBreakdown,
    crossToolResults
  );

  // ── Usage Insights ─────────────────────────────────────────────────────────
  const toolCategories = Array.from(
    new Set(tools.map((tool) => getToolCategory(tool.tool)))
  );
  const topTools = [...toolBreakdown]
    .sort((a, b) => b.monthlySpend - a.monthlySpend)
    .slice(0, 3)
    .map((t) => t.tool);
  const highestSpendTool = toolBreakdown.length > 0 ? topTools[0] : null;

  const usageInsights = {
    topTools,
    seatUtilizationPercent,
    highestSpendTool,
    toolCategories,
  };

  // ── Contextual Governance & Opportunities ──────────────────────────────────
  const hasApiTools = tools.some((t) =>
    ["Anthropic API", "OpenAI API"].includes(t.tool)
  );
  const hasSeatsAboveTeam = tools.some((t) => t.seatCount > teamSize);

  const governanceInsights = selectGovernanceInsights(
    tools.length,
    tools,
    crossToolResults,
    hasApiTools
  );

  const optimizationOpportunities = selectOptimizationOpportunities(
    crossToolResults,
    hasApiTools,
    hasSeatsAboveTeam
  );

  // ── Executive Summary ──────────────────────────────────────────────────────
  const causePhrase = deriveSavingsCausePhrase(perToolResults, crossToolResults);
  const auditSummary = buildAuditSummary(
    estimatedSavings,
    potentialSavingsPercent,
    recommendations.filter((r) => r.estimatedSavingsImpact > 0).length,
    totalMonthlySpend,
    causePhrase
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
