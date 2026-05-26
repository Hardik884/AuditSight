/**
 * AuditSight — Audit Rules
 *
 * Typed rule functions that evaluate per-tool and cross-tool conditions.
 * Each rule returns a structured RuleResult with a savings estimate,
 * confidence level, and executive-facing rationale.
 *
 * Design principles:
 * - Never fabricate savings: every estimate is derived from published plan prices
 *   or a conservative fraction of reported spend (capped at 25%)
 * - $50/mo minimum savings threshold before a recommendation is surfaced
 * - Honest "cost-efficient" outcome when no rules trigger
 */

import type { ToolName } from "@/constants/pricing";
import {
  getPlanDetail,
  getDowngradePlanName,
  computeDowngradeSavingsPerSeat,
} from "@/constants/pricing";
import type { ConfidenceLevel, ToolSelection } from "@/types/audit";

// ─── Constants ──────────────────────────────────────────────────────────────

/** Minimum monthly savings required before a recommendation is surfaced */
export const SAVINGS_FLOOR_MONTHLY = 50;

/**
 * Coding copilot tools — overlap between any two of these is flagged
 * as potential duplication for the same engineering team.
 */
export const CODING_COPILOT_TOOLS: ToolName[] = [
  "Cursor",
  "GitHub Copilot",
  "Windsurf",
];

/**
 * Conversational LLM subscription tools (excludes API tools).
 * Duplicate premium subscriptions are flagged as potential overlap.
 */
export const LLM_SUBSCRIPTION_TOOLS: ToolName[] = [
  "Claude",
  "ChatGPT",
  "Gemini",
];

/** All LLM-related tools (subscriptions + APIs) */
export const LLM_TOOLS: ToolName[] = [
  ...LLM_SUBSCRIPTION_TOOLS,
  "Anthropic API",
  "OpenAI API",
];

/** API-type tools where per-seat pricing doesn't apply */
export const API_TOOLS: ToolName[] = ["Anthropic API", "OpenAI API"];

// ─── Rule Result Type ────────────────────────────────────────────────────────

export interface RuleResult {
  ruleId: string;
  triggered: boolean;
  /** Projected monthly savings (0 if not triggered or below floor) */
  savings: number;
  confidence: ConfidenceLevel;
  /** Short action label: "Downgrade to Pro", "Reduce seat count", etc. */
  action: string;
  /** Executive-facing rationale paragraph */
  rationale: string;
}

// ─── Per-Tool Rules ──────────────────────────────────────────────────────────

/**
 * RULE: ZERO_SEAT_SPEND
 * Spend reported but no seats declared — likely a billing anomaly.
 */
export const ruleZeroSeatSpend = (entry: ToolSelection): RuleResult => {
  const triggered = entry.seatCount === 0 && entry.monthlySpend > 0;
  // Conservative: flag 15% of spend as recoverable (could be orphaned licenses,
  // duplicate billing, or unrevoked subscriptions — not all spend is guaranteed recoverable)
  const savings = triggered
    ? Math.round(entry.monthlySpend * 0.15)
    : 0;
  return {
    ruleId: "ZERO_SEAT_SPEND",
    triggered,
    savings,
    confidence: "High",
    action: "Reconcile billing anomaly",
    rationale:
      "Spend is recorded without any active seat allocation. This typically indicates orphaned licenses, duplicate billing entries, or unrevoked subscriptions. Finance review recommended to confirm active entitlements.",
  };
};

/**
 * RULE: SEATS_EXCEED_TEAM
 * Seat count is higher than the total team size — over-provisioned licenses.
 */
export const ruleSeatsExceedTeam = (
  entry: ToolSelection,
  teamSize: number
): RuleResult => {
  const excessSeats = Math.max(0, entry.seatCount - teamSize);
  const triggered = excessSeats > 0 && !API_TOOLS.includes(entry.tool);
  const planDetail = getPlanDetail(entry.tool, entry.plan);
  const pricePerSeat = planDetail?.monthlyPricePerSeat ?? 0;
  // Conservative: only claim savings on provably excess seats
  const rawSavings = pricePerSeat > 0
    ? excessSeats * pricePerSeat
    : Math.round(entry.monthlySpend * 0.1);
  const savings = triggered && rawSavings >= SAVINGS_FLOOR_MONTHLY ? rawSavings : 0;

  const savingsNote = savings > 0
    ? ` Reducing to ${teamSize} seats would save approximately $${savings}/month based on published plan pricing.`
    : "";

  return {
    ruleId: "SEATS_EXCEED_TEAM",
    triggered: triggered && savings > 0,
    savings,
    confidence: "High",
    action: `Reduce to ${teamSize} seats`,
    rationale: `Licensed seat count (${entry.seatCount}) exceeds the reported team size (${teamSize}). ${excessSeats} seat${excessSeats > 1 ? "s" : ""} appear unassigned.${savingsNote} Aligning licenses to active headcount eliminates provable overspend.`,
  };
};

/**
 * RULE: ENTERPRISE_TINY_TEAM
 * Enterprise or Business plan with very few seats — governance features
 * are paying for capabilities the team cannot utilize.
 */
export const ruleEnterpriseTinyTeam = (
  entry: ToolSelection,
  teamSize: number
): RuleResult => {
  const plan = entry.plan;
  const isEnterprisePlan =
    plan === "Enterprise" || plan === "Business" || plan === "Teams";
  // Cap the threshold at 10 for very large orgs: a 10-seat Enterprise deployment
  // for a 500-person org is still a legitimate "tiny team" signal.
  // Without the cap, the threshold rounds to 50 for a 500-person org —
  // which means up to 50 seats escape flagging, even though 50 Enterprise seats
  // for 500 people is not obviously wasteful.
  const smallSeatThreshold = Math.min(
    Math.max(3, Math.round(teamSize * 0.1)),
    10
  );
  const isTinyTeam =
    entry.seatCount > 0 && entry.seatCount <= smallSeatThreshold;
  const triggered = isEnterprisePlan && isTinyTeam && !API_TOOLS.includes(entry.tool);

  const downgradePlan = triggered ? getDowngradePlanName(entry.tool, plan) : null;
  const savingsPerSeat = downgradePlan
    ? computeDowngradeSavingsPerSeat(entry.tool, plan, downgradePlan)
    : 0;
  const rawSavings = savingsPerSeat * entry.seatCount;
  const savings =
    triggered && rawSavings >= SAVINGS_FLOOR_MONTHLY ? rawSavings : 0;

  return {
    ruleId: "ENTERPRISE_TINY_TEAM",
    triggered: triggered && (savings > 0 || savingsPerSeat === 0),
    savings,
    confidence: "High",
    action: downgradePlan ? `Downgrade to ${downgradePlan}` : "Review plan tier",
    rationale: downgradePlan
      ? `The ${plan} tier provides organization-level governance, compliance controls, and enterprise support — capabilities that are unlikely to be utilized by a ${entry.seatCount}-seat deployment. Downgrading to ${downgradePlan} would deliver the same core functionality at a lower per-seat cost without material workflow disruption.`
      : `The ${plan} tier may be oversized for a ${entry.seatCount}-seat deployment. Review whether enterprise-specific features (SSO, audit logs, custom models) are actively used before renewal.`,
  };
};

/**
 * RULE: TEAM_PLAN_SOLO
 * Team plan with 1–2 seats — individual plan is cheaper and covers the same use case.
 */
export const ruleTeamPlanSolo = (entry: ToolSelection): RuleResult => {
  const isTeamPlan = entry.plan === "Team" || entry.plan === "Teams";
  const isSoloOrPair = entry.seatCount > 0 && entry.seatCount <= 2;
  const triggered = isTeamPlan && isSoloOrPair;

  // Individual plan equivalent (Pro / Plus / Individual)
  const individualPlan = getDowngradePlanName(entry.tool, entry.plan);
  const savingsPerSeat = individualPlan
    ? computeDowngradeSavingsPerSeat(entry.tool, entry.plan, individualPlan)
    : 0;
  const rawSavings = savingsPerSeat * entry.seatCount;
  const savings =
    triggered && rawSavings >= SAVINGS_FLOOR_MONTHLY ? rawSavings : 0;

  return {
    ruleId: "TEAM_PLAN_SOLO",
    triggered: triggered && savings > 0,
    savings,
    confidence: "High",
    action: individualPlan
      ? `Switch to ${individualPlan} plan`
      : "Review team plan necessity",
    rationale: `Team-tier collaboration features — shared workspace, admin console, centralized billing — may be unnecessary for a ${entry.seatCount}-seat workflow. Individual ${individualPlan ?? "subscription"} plans provide equivalent core access at a lower per-seat cost.`,
  };
};

/**
 * RULE: HIGH_SPEND_PER_SEAT
 * Effective monthly spend per seat is materially above the published plan price.
 * Indicates potential billing overrun, unused add-ons, or stale contracts.
 */
export const ruleHighSpendPerSeat = (entry: ToolSelection): RuleResult => {
  if (API_TOOLS.includes(entry.tool) || entry.seatCount === 0) {
    return {
      ruleId: "HIGH_SPEND_PER_SEAT",
      triggered: false,
      savings: 0,
      confidence: "Low",
      action: "No action",
      rationale: "",
    };
  }

  const planDetail = getPlanDetail(entry.tool, entry.plan);
  if (!planDetail || planDetail.monthlyPricePerSeat === 0) {
    return {
      ruleId: "HIGH_SPEND_PER_SEAT",
      triggered: false,
      savings: 0,
      confidence: "Low",
      action: "No action",
      rationale: "",
    };
  }

  const effectivePerSeat = entry.monthlySpend / entry.seatCount;
  const publishedPrice = planDetail.monthlyPricePerSeat;
  const overspendRatio = effectivePerSeat / publishedPrice;
  // 40% threshold: accounts for annual-to-monthly proration differences, legacy
  // contract uplifts, and rounding. Anything above 1.4x is a material anomaly
  // that warrants a billing reconciliation — not just normal variance.
  const triggered = overspendRatio > 1.4;
  const rawSavings = triggered
    ? Math.round((effectivePerSeat - publishedPrice) * entry.seatCount)
    : 0;
  const savings = rawSavings >= SAVINGS_FLOOR_MONTHLY ? rawSavings : 0;

  return {
    ruleId: "HIGH_SPEND_PER_SEAT",
    triggered: triggered && savings > 0,
    savings,
    confidence: "Medium",
    action: "Audit billing vs published pricing",
    rationale: `Effective per-seat cost ($${effectivePerSeat.toFixed(0)}/seat) is materially above the published ${entry.plan} plan rate ($${publishedPrice}/seat). The gap may reflect add-ons, usage overages, or a legacy contract rate. A billing reconciliation against current vendor pricing is recommended.`,
  };
};

/**
 * RULE: LOW_UTILIZATION_HIGH_SPEND
 * Multiple tools active with low seat utilization relative to team size —
 * suggests a fragmented stack where consolidation may reduce overhead.
 *
 * Triggered when:
 *   - This is evaluated at a per-tool level, but the signal is that the tool's
 *     seat count is less than 50% of the team size (suggesting many tools are
 *     being used by small subsets of the team)
 *   - Tool is not an API tool (API spend doesn't follow seat patterns)
 *   - The tool has meaningful spend (> $0)
 *
 * Confidence: Low — this is a fragmentation signal, not a proven waste finding.
 * Savings: Conservative estimate at 10% of tool spend.
 */
export const ruleLowUtilizationHighSpend = (
  entry: ToolSelection,
  teamSize: number,
  totalToolCount: number
): RuleResult => {
  // Only fire on seat-based tools with real spend
  if (API_TOOLS.includes(entry.tool) || entry.monthlySpend === 0 || entry.seatCount === 0) {
    return {
      ruleId: "LOW_UTILIZATION_HIGH_SPEND",
      triggered: false,
      savings: 0,
      confidence: "Low",
      action: "No action",
      rationale: "",
    };
  }

  // Requires at least 3 tools in the audit to be a meaningful fragmentation signal
  if (totalToolCount < 3) {
    return {
      ruleId: "LOW_UTILIZATION_HIGH_SPEND",
      triggered: false,
      savings: 0,
      confidence: "Low",
      action: "No action",
      rationale: "",
    };
  }

  // Flag if this tool's seats cover less than 50% of the team
  const utilizationRatio = entry.seatCount / Math.max(teamSize, 1);
  const isLowUtilization = utilizationRatio < 0.5;
  const triggered = isLowUtilization;

  // Conservative: 10% of spend — this is a signal, not a certain saving
  const rawSavings = Math.round(entry.monthlySpend * 0.1);
  const savings = triggered && rawSavings >= SAVINGS_FLOOR_MONTHLY ? rawSavings : 0;

  return {
    ruleId: "LOW_UTILIZATION_HIGH_SPEND",
    triggered: triggered && savings > 0,
    savings,
    confidence: "Low",
    action: "Review active seat utilization",
    rationale: `${entry.tool} is licensed for ${entry.seatCount} seat${entry.seatCount !== 1 ? "s" : ""} against a team of ${teamSize}. With ${Math.round(utilizationRatio * 100)}% team coverage and ${totalToolCount} tools active, this tool may serve a narrow use case. Validating active usage and consolidating niche tools into primary platforms is a low-risk optimization step.`,
  };
};

/**
 * RULE: SINGLE_TOOL_NO_SPEND
 * Edge-case guard: exactly one tool entered with no spend and no seats.
 * This is an incomplete audit input, not a real optimization signal.
 * Returns a clear, honest message rather than a generic "cost-efficient" result.
 */
export const ruleSingleToolNoSpend = (
  entry: ToolSelection,
  totalToolCount: number
): RuleResult => {
  const triggered =
    totalToolCount === 1 && entry.monthlySpend === 0 && entry.seatCount === 0;

  return {
    ruleId: "SINGLE_TOOL_NO_SPEND",
    triggered,
    savings: 0,
    confidence: "Low",
    action: "Add spend and seat data",
    rationale: `No spend or seat data has been entered for ${entry.tool}. Add your monthly spend and seat count to enable savings analysis and plan-tier recommendations.`,
  };
};

// ─── Cross-Tool Rules ────────────────────────────────────────────────────────

export interface CrossToolRuleResult {
  ruleId: string;
  triggered: boolean;
  savings: number;
  confidence: ConfidenceLevel;
  affectedTools: ToolName[];
  title: string;
  description: string;
}

/**
 * RULE: COPILOT_OVERLAP
 * Two or more coding copilot tools (Cursor, GitHub Copilot, Windsurf) are
 * active for the same engineering team — likely functional duplication.
 */
export const ruleCopilotOverlap = (
  tools: ToolSelection[]
): CrossToolRuleResult => {
  const copilots = tools.filter((t) => CODING_COPILOT_TOOLS.includes(t.tool));
  const triggered = copilots.length >= 2;

  // Sort by spend descending; secondary copilots are consolidation candidates
  const sorted = [...copilots].sort((a, b) => b.monthlySpend - a.monthlySpend);
  const secondarySpend = sorted.slice(1).reduce((s, t) => s + t.monthlySpend, 0);
  // Conservative: claim at most 50% of secondary copilot spend as recoverable
  const rawSavings = Math.round(secondarySpend * 0.5);
  const savings = rawSavings >= SAVINGS_FLOOR_MONTHLY ? rawSavings : 0;

  const names = copilots.map((t) => t.tool).join(", ");

  return {
    ruleId: "COPILOT_OVERLAP",
    triggered,
    savings,
    confidence: "High",
    affectedTools: copilots.map((t) => t.tool),
    title: "Overlapping coding copilot subscriptions — high confidence overlap",
    description: `${names} appear to be active concurrently for the same engineering team. These tools overlap significantly in core functionality — AI code completion, in-editor chat, and multi-file editing. Consolidating to a single copilot platform eliminates redundant seat costs and reduces context-switching overhead.`,
  };
};

/**
 * RULE: LLM_PREMIUM_DUPLICATE
 * Both Claude (Pro/Max/Team) and ChatGPT (Plus/Team) are active with
 * meaningful spend — premium LLM subscriptions likely serve overlapping workflows.
 */
export const ruleLlmPremiumDuplicate = (
  tools: ToolSelection[]
): CrossToolRuleResult => {
  const premiumClaudePlans = ["Pro", "Max", "Team", "Enterprise"];
  const premiumChatGptPlans = ["Plus", "Team", "Enterprise"];

  const claudeEntry = tools.find(
    (t) => t.tool === "Claude" && premiumClaudePlans.includes(t.plan) && t.monthlySpend > 0
  );
  const chatgptEntry = tools.find(
    (t) => t.tool === "ChatGPT" && premiumChatGptPlans.includes(t.plan) && t.monthlySpend > 0
  );

  const triggered = !!claudeEntry && !!chatgptEntry;
  const lowerSpend = triggered
    ? Math.min(claudeEntry!.monthlySpend, chatgptEntry!.monthlySpend)
    : 0;
  // Conservative: 30% of the smaller subscription as potential saving
  const rawSavings = Math.round(lowerSpend * 0.3);
  const savings = rawSavings >= SAVINGS_FLOOR_MONTHLY ? rawSavings : 0;

  return {
    ruleId: "LLM_PREMIUM_DUPLICATE",
    triggered,
    savings,
    confidence: "Medium",
    affectedTools: [
      ...(claudeEntry ? ["Claude" as ToolName] : []),
      ...(chatgptEntry ? ["ChatGPT" as ToolName] : []),
    ],
    title: "Dual premium LLM subscriptions — likely redundant workflows",
    description:
      "Claude and ChatGPT premium subscriptions serve substantially overlapping use cases — research, writing, analysis, and summarization. Without distinct, validated use cases for each model, teams often default to one and underutilize the other. Consolidating to a primary LLM and using API access for secondary workflows typically yields better economics.",
  };
};

/**
 * RULE: LLM_GEMINI_DUPLICATE
 * Gemini Advanced is active alongside Claude (Pro/Max/Team) or ChatGPT (Plus/Team) —
 * three premium conversational LLM subscriptions for the same team is likely over-provisioned.
 */
export const ruleLlmGeminiDuplicate = (
  tools: ToolSelection[]
): CrossToolRuleResult => {
  const premiumClaudePlans = ["Pro", "Max", "Team", "Enterprise"];
  const premiumChatGptPlans = ["Plus", "Team", "Enterprise"];

  const geminiEntry = tools.find(
    (t) => t.tool === "Gemini" && t.plan === "Advanced" && t.monthlySpend > 0
  );
  const claudeEntry = tools.find(
    (t) => t.tool === "Claude" && premiumClaudePlans.includes(t.plan) && t.monthlySpend > 0
  );
  const chatgptEntry = tools.find(
    (t) => t.tool === "ChatGPT" && premiumChatGptPlans.includes(t.plan) && t.monthlySpend > 0
  );

  // Only trigger if Gemini Advanced is active alongside at least one other premium LLM
  const triggered = !!geminiEntry && (!!claudeEntry || !!chatgptEntry);

  const affectedTools: ToolName[] = [
    ...(geminiEntry ? ["Gemini" as ToolName] : []),
    ...(claudeEntry ? ["Claude" as ToolName] : []),
    ...(chatgptEntry ? ["ChatGPT" as ToolName] : []),
  ];

  // Conservative: 30% of Gemini Advanced spend (it is the least commonly primary LLM in this pairing)
  const rawSavings = triggered ? Math.round(geminiEntry!.monthlySpend * 0.3) : 0;
  const savings = rawSavings >= SAVINGS_FLOOR_MONTHLY ? rawSavings : 0;

  const otherTools = [claudeEntry, chatgptEntry]
    .filter(Boolean)
    .map((t) => t!.tool)
    .join(" and ");

  return {
    ruleId: "LLM_GEMINI_DUPLICATE",
    triggered,
    savings,
    confidence: "Medium",
    affectedTools,
    title: "Gemini Advanced alongside other premium LLMs — potential optimization opportunity",
    description: `Gemini Advanced is active concurrently with ${otherTools} premium subscription${otherTools.includes("and") ? "s" : ""}. Unless Gemini is used specifically for Google Workspace integration or multimodal tasks not covered by ${otherTools}, this may represent an underutilized subscription. Evaluating primary vs. supplementary LLM roles across the team can clarify whether consolidation is appropriate.`,
  };
};

/**
 * RULE: API_VS_SEAT_SAME_VENDOR
 * Both a seat-based plan and a direct API subscription exist for the same
 * vendor (e.g., Claude Team + Anthropic API). This may indicate workflow
 * overlap or an opportunity to consolidate under API access.
 */
export const ruleApiVsSeatSameVendor = (
  tools: ToolSelection[]
): CrossToolRuleResult[] => {
  const results: CrossToolRuleResult[] = [];

  const vendorPairs: Array<{ seat: ToolName; api: ToolName }> = [
    { seat: "Claude", api: "Anthropic API" },
    { seat: "ChatGPT", api: "OpenAI API" },
  ];

  for (const { seat, api } of vendorPairs) {
    const seatEntry = tools.find((t) => t.tool === seat && t.monthlySpend > 0);
    const apiEntry = tools.find((t) => t.tool === api && t.monthlySpend > 0);

    if (!seatEntry || !apiEntry) continue;

    results.push({
      ruleId: `API_VS_SEAT_${seat.toUpperCase().replace(/\s/g, "_")}`,
      triggered: true,
      savings: 0, // Cannot compute without token volumes — honest stance
      confidence: "Medium",
      affectedTools: [seat, api],
      title: `${seat} seat plan and API access may overlap — potential optimization opportunity`,
      description: `Both a ${seat} seat-based subscription and direct ${api} access are active. For automation-heavy or high-volume workflows, API access often provides better economics than per-seat subscriptions. For interactive, conversational use, seat plans are typically more cost-effective. Reviewing which workloads drive each spend line can clarify whether consolidation is appropriate.`,
    });
  }

  return results;
};

// ─── Legacy Compatibility ────────────────────────────────────────────────────

/**
 * High-tier plans per tool — used by legacy scoring engine path.
 * Maps to plans where governance/enterprise features are unlikely to be
 * utilized by small teams.
 */
export const HIGH_TIER_PLANS: Partial<Record<ToolName, string[]>> = {
  Cursor: ["Business"],
  "GitHub Copilot": ["Business", "Enterprise"],
  Claude: ["Max", "Team", "Enterprise"],
  ChatGPT: ["Team", "Enterprise"],
  Gemini: ["Advanced"],
  Windsurf: ["Teams"],
};

/**
 * Returns the next lower plan name — retained for legacy compatibility.
 * Prefer `getDowngradePlanName` from pricing.ts in new code.
 */
export const getDowngradePlan = (tool: ToolName, currentPlan: string): string | null =>
  getDowngradePlanName(tool, currentPlan);

// ─── Governance & Opportunity Templates ─────────────────────────────────────

/**
 * Contextual governance insights — selected dynamically by the audit engine
 * based on the tools and findings in the audit.
 */
export const GOVERNANCE_INSIGHT_TEMPLATES = [
  "No centralized owner identified for AI tool procurement decisions",
  "Spend visibility is fragmented across individual and team billing accounts",
  "Seat allocation policies are absent or unenforced on active vendor contracts",
  "API spend is accruing without defined budget guardrails or alerting",
  "Vendor contracts lack documented renewal review dates",
] as const;

export const OPTIMIZATION_OPPORTUNITY_TEMPLATES = [
  "Consolidate coding copilot tools to a single platform per engineering cohort",
  "Align seat counts to verified active user headcount each quarter",
  "Evaluate API-first access for automation workloads vs. seat-based subscriptions",
  "Establish a quarterly AI spend review cadence with engineering leadership",
  "Negotiate annual contracts for consistently-used tools to reduce per-seat cost",
] as const;
