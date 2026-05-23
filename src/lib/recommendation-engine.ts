/**
 * AuditSight — Recommendation Engine
 *
 * Builds a structured, de-duplicated, priority-ordered recommendation list
 * from per-tool and cross-tool rule results.
 *
 * Design principles:
 * - $50/mo savings floor: recommendations below this are suppressed
 * - De-duplication: cross-tool rules and per-tool rules don't double-count savings
 * - Grouped by severity: High → Medium → Low
 * - Honest empty state: returns a "cost-efficient" record when no rules trigger
 * - No fabricated savings: every number comes from the rule engine
 */

import type {
  AuditRequest,
  ConfidenceLevel,
  Recommendation,
  SeverityLevel,
  ToolBreakdown,
} from "@/types/audit";
import type { CrossToolRuleResult } from "@/lib/audit-rules";
import { SAVINGS_FLOOR_MONTHLY } from "@/lib/audit-rules";

// ─── Severity Mapping ────────────────────────────────────────────────────────

const savingsToSeverity = (savings: number): SeverityLevel => {
  if (savings >= 500) return "High";
  if (savings >= 150) return "Medium";
  return "Low";
};

// ─── Per-Tool Recommendation Builder ─────────────────────────────────────────

/**
 * Converts tool breakdown entries (which already carry rule results) into
 * Recommendation objects. Only entries with savings above the floor are included.
 *
 * To avoid double-counting with cross-tool rules, tool entries flagged by
 * a cross-tool rule (e.g. copilot overlap) have their savings capped — the
 * full saving is attributed to the cross-tool recommendation.
 */
const buildPerToolRecommendations = (
  toolBreakdown: ToolBreakdown[],
  crossToolAffectedToolIds: Set<string>
): Recommendation[] => {
  return toolBreakdown
    .filter((entry) => {
      // Suppress if savings are below floor
      if (entry.projectedSavings < SAVINGS_FLOOR_MONTHLY) return false;
      // Suppress if this tool's savings are already captured by a cross-tool rule
      const toolKey = `${entry.tool}__crosstool`;
      if (crossToolAffectedToolIds.has(toolKey)) return false;
      return true;
    })
    .map((entry) => ({
      title: entry.recommendedAction,
      description: entry.rationale,
      confidence: entry.confidence as ConfidenceLevel,
      estimatedSavingsImpact: entry.projectedSavings,
      severity: savingsToSeverity(entry.projectedSavings),
      difficulty: "Low" as const,
    }));
};

// ─── Cross-Tool Recommendation Builder ───────────────────────────────────────

const buildCrossToolRecommendations = (
  crossToolResults: CrossToolRuleResult[]
): Recommendation[] => {
  return crossToolResults
    .filter((r) => r.triggered)
    .map((r) => ({
      title: r.title,
      description: r.description,
      confidence: r.confidence,
      estimatedSavingsImpact: r.savings,
      severity: savingsToSeverity(r.savings),
      difficulty: "Medium" as const,
    }));
};

// ─── Sort by Priority ────────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<SeverityLevel, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const CONFIDENCE_ORDER: Record<ConfidenceLevel, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const sortRecommendations = (recs: Recommendation[]): Recommendation[] =>
  [...recs].sort((a, b) => {
    const severityDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (severityDiff !== 0) return severityDiff;
    const confidenceDiff =
      CONFIDENCE_ORDER[a.confidence] - CONFIDENCE_ORDER[b.confidence];
    if (confidenceDiff !== 0) return confidenceDiff;
    return b.estimatedSavingsImpact - a.estimatedSavingsImpact;
  });

// ─── Main Builder ─────────────────────────────────────────────────────────────

export const buildRecommendations = (
  request: AuditRequest,
  toolBreakdown: ToolBreakdown[],
  crossToolResults: CrossToolRuleResult[] = []
): Recommendation[] => {
  // Track which tool entries are already covered by cross-tool rules
  // so we don't double-count their savings
  const crossToolAffectedToolIds = new Set<string>(
    crossToolResults
      .filter((r) => r.triggered && r.savings > 0)
      .flatMap((r) => r.affectedTools.map((t) => `${t}__crosstool`))
  );

  const perToolRecs = buildPerToolRecommendations(
    toolBreakdown,
    crossToolAffectedToolIds
  );

  const crossToolRecs = buildCrossToolRecommendations(crossToolResults);

  const all = sortRecommendations([...crossToolRecs, ...perToolRecs]);

  if (all.length > 0) return all;

  // ── Honest empty state ───────────────────────────────────────────────────
  // No rules triggered above the savings floor — return a credible
  // "cost-efficient" outcome rather than fabricating recommendations.
  const totalSpend = request.tools.reduce((s, t) => s + t.monthlySpend, 0);
  const toolCount = request.tools.length;

  const emptyStateDescription =
    totalSpend === 0
      ? "No spend data was provided. Add monthly spend values to enable savings analysis."
      : toolCount === 1
      ? `Your ${request.tools[0]?.tool ?? "tool"} configuration appears appropriately sized for your current team. No material optimization opportunities were identified based on reported spend and seat counts.`
      : "Your current AI tool configuration appears cost-efficient relative to reported spend and seat allocations. Continue monitoring for vendor pricing changes, seat count drift, and new tool additions.";

  return [
    {
      title: "Current configuration appears cost-efficient",
      description: emptyStateDescription,
      confidence: "High",
      estimatedSavingsImpact: 0,
      severity: "Low",
      difficulty: "Low",
    },
  ];
};
