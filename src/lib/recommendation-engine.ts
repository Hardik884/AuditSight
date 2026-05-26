/**
 * AuditSight — Recommendation Engine
 *
 * Builds a structured, de-duplicated, priority-ordered recommendation list
 * from per-tool and cross-tool rule results.
 *
 * Design principles:
 * - $50/mo savings floor: recommendations below this are suppressed
 * - De-duplication: cross-tool rules and per-tool rules don't double-count savings
 * - Same-title deduplication: two tools triggering the same rule title are merged
 * - Grouped by severity: High → Medium → Low
 * - Difficulty is mapped per rule type (not a blanket "Low"/"Medium")
 * - Maximum 8 recommendations: beyond this the list becomes noise
 * - Honest empty state: returns a "cost-efficient" record when no rules trigger
 * - No fabricated savings: every number comes from the rule engine
 */

import type {
  AuditRequest,
  ConfidenceLevel,
  DifficultyLevel,
  Recommendation,
  SeverityLevel,
  ToolBreakdown,
} from "@/types/audit";
import type { CrossToolRuleResult } from "@/lib/audit-rules";
import { SAVINGS_FLOOR_MONTHLY } from "@/lib/audit-rules";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum number of recommendations to surface in a single audit report */
const MAX_RECOMMENDATIONS = 8;

// ─── Severity Mapping ────────────────────────────────────────────────────────

const savingsToSeverity = (savings: number): SeverityLevel => {
  if (savings >= 500) return "High";
  if (savings >= 150) return "Medium";
  return "Low";
};

// ─── Difficulty Mapping ───────────────────────────────────────────────────────

/**
 * Maps rule IDs to implementation difficulty.
 *
 * Difficulty reflects the operational effort required to act on a recommendation,
 * not the financial magnitude. A billing reconciliation is "Low" effort even if
 * it saves $500/mo; a copilot consolidation is "Medium" because it involves
 * team change management.
 */
const ruleToDifficulty = (ruleId: string): DifficultyLevel => {
  switch (ruleId) {
    // Billing / admin actions — low coordination overhead
    case "ZERO_SEAT_SPEND":
    case "SEATS_EXCEED_TEAM":
    case "TEAM_PLAN_SOLO":
    case "SINGLE_TOOL_NO_SPEND":
      return "Low";

    // Plan changes or billing reconciliation — require vendor engagement
    case "ENTERPRISE_TINY_TEAM":
    case "HIGH_SPEND_PER_SEAT":
    case "LLM_PREMIUM_DUPLICATE":
    case "LLM_GEMINI_DUPLICATE":
      return "Medium";

    // Cross-tool consolidation — involves team workflow changes
    case "COPILOT_OVERLAP":
    case "LOW_UTILIZATION_HIGH_SPEND":
      return "Medium";

    // API vs seat overlap — requires architectural workflow assessment
    default:
      if (ruleId.startsWith("API_VS_SEAT_")) return "Medium";
      return "Low";
  }
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
      difficulty: ruleToDifficulty(entry.ruleId ?? ""),
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
      difficulty: ruleToDifficulty(r.ruleId),
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
    // Final tiebreaker: higher savings first
    return b.estimatedSavingsImpact - a.estimatedSavingsImpact;
  });

// ─── Same-Title Deduplication ─────────────────────────────────────────────────

/**
 * Merges recommendations with the same title that are within $100 of each other
 * in estimated savings. This prevents the same rule firing for two different tools
 * from producing near-identical side-by-side entries (e.g., two HIGH_SPEND_PER_SEAT
 * entries both titled "Audit billing vs published pricing").
 *
 * The merged recommendation takes the higher confidence and combined savings.
 */
const deduplicateByTitle = (recs: Recommendation[]): Recommendation[] => {
  const merged: Map<string, Recommendation> = new Map();

  for (const rec of recs) {
    const existing = merged.get(rec.title);
    if (!existing) {
      merged.set(rec.title, { ...rec });
      continue;
    }

    // Merge if savings are within $100 of each other
    const savingsDiff = Math.abs(existing.estimatedSavingsImpact - rec.estimatedSavingsImpact);
    if (savingsDiff <= 100) {
      const combinedSavings = existing.estimatedSavingsImpact + rec.estimatedSavingsImpact;
      // Take the higher confidence signal
      const CONFIDENCE_ORDER_MAP: Record<ConfidenceLevel, number> = { High: 2, Medium: 1, Low: 0 };
      const betterConfidence =
        CONFIDENCE_ORDER_MAP[existing.confidence] >= CONFIDENCE_ORDER_MAP[rec.confidence]
          ? existing.confidence
          : rec.confidence;

      merged.set(rec.title, {
        ...existing,
        estimatedSavingsImpact: combinedSavings,
        severity: savingsToSeverity(combinedSavings),
        confidence: betterConfidence,
      });
    } else {
      // Different magnitudes — keep both but disambiguate title
      merged.set(`${rec.title} (2)`, rec);
    }
  }

  return Array.from(merged.values());
};

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

  // Cross-tool recs go first so they sort ahead of per-tool recs at equal severity+confidence
  const sorted = sortRecommendations([...crossToolRecs, ...perToolRecs]);

  // Merge near-duplicate same-title recommendations (e.g., two HIGH_SPEND_PER_SEAT)
  const deduped = deduplicateByTitle(sorted);

  // Re-sort after deduplication (merged savings may have changed severity)
  const final = sortRecommendations(deduped);

  // Cap at MAX_RECOMMENDATIONS to keep the report actionable
  const all = final.slice(0, MAX_RECOMMENDATIONS);

  if (all.length > 0) return all;

  // ── Honest empty state ───────────────────────────────────────────────────
  // No rules triggered above the savings floor — return a credible
  // "cost-efficient" outcome rather than fabricating recommendations.
  const totalSpend = request.tools.reduce((s, t) => s + t.monthlySpend, 0);
  const totalSeats = request.tools.reduce((s, t) => s + t.seatCount, 0);
  const toolCount = request.tools.length;

  let emptyStateDescription: string;

  if (totalSpend === 0 && totalSeats === 0 && toolCount === 1) {
    // Single tool, no data entered at all
    emptyStateDescription = `No spend or seat data has been entered for ${request.tools[0]?.tool ?? "your tool"}. Add monthly spend and seat count values to enable savings analysis and plan-tier recommendations.`;
  } else if (totalSpend === 0 && totalSeats > 0) {
    // Seats entered but no spend data
    emptyStateDescription = "Seat counts are recorded but no monthly spend has been provided. Add your spend figures to enable savings analysis and billing anomaly detection.";
  } else if (totalSpend === 0) {
    // No spend data was provided at all
    emptyStateDescription = "No spend data was provided. Add monthly spend values to enable savings analysis.";
  } else if (toolCount === 1) {
    // Single tool, appears clean
    emptyStateDescription = `Your ${request.tools[0]?.tool ?? "tool"} configuration appears appropriately sized for your current team. No material optimization opportunities were identified based on reported spend and seat counts.`;
  } else {
    // Multi-tool, appears clean
    emptyStateDescription = "Your current AI tool configuration appears cost-efficient relative to reported spend and seat allocations. Continue monitoring for vendor pricing changes, seat count drift, and new tool additions on a quarterly basis.";
  }

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
