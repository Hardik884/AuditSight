/**
 * AuditSight — AI Executive Summary Generator
 *
 * Generates a personalized, executive-grade summary of a completed audit
 * using the Gemini API. Falls back to a high-quality deterministic template
 * if the API is unavailable, times out, or returns invalid output.
 *
 * SAFETY CONTRACT:
 *   Gemini receives ONLY pre-computed, deterministic values (tool names,
 *   spend totals, savings amounts already computed by the rule engine).
 *   The prompt explicitly instructs Gemini NOT to invent or recalculate
 *   any financial figures. All numbers in the summary come from the prompt.
 *
 * TONE GUIDELINES (enforced via system prompt):
 *   - Executive-facing, concise, credible
 *   - ~80–120 words
 *   - Business-oriented, no jargon overload
 *   - Mentions the team's specific tools and use case
 */

import type { AuditResponse, PrimaryUseCase } from "@/types/audit";
import { callGemini } from "@/lib/gemini";

/** Word count range we accept from Gemini before falling back */
const MIN_WORDS = 40;
const MAX_WORDS = 200;

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildPrompt(audit: AuditResponse, primaryUseCase: PrimaryUseCase): string {
  const {
    metrics: {
      estimatedSavings,
      annualSavings,
      totalMonthlySpend,
      riskLevel,
      optimizationScore,
    },
    toolBreakdown,
    recommendations,
    usageInsights,
  } = audit;

  // Build a concise tool list with status
  const toolSummaryLines = toolBreakdown
    .map((t) => {
      const status = t.projectedSavings > 0
        ? `(savings opportunity: $${t.projectedSavings}/mo)`
        : "(cost-efficient)";
      return `  - ${t.tool} [${t.plan}]: $${t.monthlySpend}/mo, ${t.seatCount} seats ${status}`;
    })
    .join("\n");

  // Top recommendation titles only
  const topRecommendations = recommendations
    .filter((r) => r.estimatedSavingsImpact > 0)
    .slice(0, 3)
    .map((r) => `  - ${r.title}`)
    .join("\n") || "  - No high-priority savings actions identified";

  const savingsContext = estimatedSavings >= 100
    ? `Estimated monthly savings: $${estimatedSavings.toLocaleString()} ($${annualSavings.toLocaleString()}/year)`
    : "The stack appears cost-efficient — no material savings opportunities were identified.";

  return `You are an executive AI spend analyst writing a board-level summary for a company's AI tool audit.

AUDIT CONTEXT (do not alter these numbers — they are pre-computed by a deterministic audit engine):
- Primary use case: ${primaryUseCase}
- Team size context: ${usageInsights.seatUtilizationPercent}% seat utilization
- Total monthly AI spend: $${totalMonthlySpend.toLocaleString()}
- ${savingsContext}
- Risk level: ${riskLevel}
- Optimization score: ${optimizationScore}/100
- Highest-spend tool: ${usageInsights.highestSpendTool ?? "N/A"}

TOOLS IN AUDIT:
${toolSummaryLines}

TOP RECOMMENDATIONS:
${topRecommendations}

INSTRUCTIONS:
Write a single, concise executive summary paragraph (80–120 words) that:
1. Opens with the overall spend posture and risk level
2. Names the team's primary use case and top 1-2 tools specifically
3. States the key finding (either savings opportunity or cost-efficiency)
4. Mentions the top 1-2 recommended actions naturally
5. Closes with a forward-looking governance note

CONSTRAINTS (CRITICAL):
- Do NOT invent any dollar amounts — only use the exact figures provided above
- Do NOT add recommendations not listed above
- Do NOT use bullet points, headers, or markdown
- Write in third-person professional tone ("The audit found..." or "This team's AI stack...")
- Target 80–120 words exactly
- Sound like a senior CFO advisor, not a chatbot`;
}

// ─── Fallback Summary Builder ──────────────────────────────────────────────────

/**
 * High-quality templated fallback when Gemini is unavailable.
 * Interpolates real audit data so it still feels personalized.
 */
function buildFallbackSummary(audit: AuditResponse, primaryUseCase: PrimaryUseCase): string {
  const {
    metrics: { estimatedSavings, annualSavings, totalMonthlySpend, riskLevel, optimizationScore },
    toolBreakdown,
    recommendations,
    usageInsights,
  } = audit;

  const topTool = usageInsights.highestSpendTool ?? toolBreakdown[0]?.tool ?? "AI tools";
  const toolCount = toolBreakdown.length;
  const hasOpportunities = estimatedSavings >= 100;

  if (totalMonthlySpend === 0) {
    return `This team's AI audit was completed across ${toolCount} tool${toolCount !== 1 ? "s" : ""} in the ${primaryUseCase.toLowerCase()} workflow. No spend data was recorded — enter monthly spend values to enable savings analysis and ROI benchmarking.`;
  }

  if (!hasOpportunities) {
    return `This team's AI stack — anchored by ${topTool} — totals $${totalMonthlySpend.toLocaleString()}/month across ${toolCount} active tool${toolCount !== 1 ? "s" : ""} for ${primaryUseCase.toLowerCase()} workflows. The audit engine found no material optimization opportunities based on current plan tiers and seat allocations, placing the stack in a cost-efficient posture with an optimization score of ${optimizationScore}/100. Risk is rated ${riskLevel}. A quarterly review is recommended to capture future vendor pricing changes and headcount shifts.`;
  }

  const topRec = recommendations.find((r) => r.estimatedSavingsImpact > 0);
  const topRecText = topRec
    ? ` Priority action: ${topRec.title.toLowerCase()}.`
    : "";

  return `This team's AI stack — led by ${topTool} — currently runs $${totalMonthlySpend.toLocaleString()}/month across ${toolCount} tool${toolCount !== 1 ? "s" : ""} supporting ${primaryUseCase.toLowerCase()} workflows. The audit identified $${estimatedSavings.toLocaleString()}/month in optimization potential ($${annualSavings.toLocaleString()} annually), driven by plan-tier misalignment and seat over-provisioning.${topRecText} Risk is rated ${riskLevel} with an optimization score of ${optimizationScore}/100. Implementing the top recommendations and establishing a quarterly AI spend review would materially improve unit economics.`;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function isValidSummary(text: string): boolean {
  const words = text.trim().split(/\s+/).length;
  return words >= MIN_WORDS && words <= MAX_WORDS;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Generate an AI executive summary for a completed audit.
 *
 * Pipeline:
 *   1. Build prompt from deterministic audit outputs
 *   2. Call Gemini API (with 8s timeout)
 *   3. Validate response word count
 *   4. Return Gemini text OR high-quality fallback — never null
 *
 * @param audit - The completed, deterministic AuditResponse
 * @param primaryUseCase - The team's primary AI use case
 * @returns A personalized executive summary string, always defined
 */
export async function generateAiExecutiveSummary(
  audit: AuditResponse,
  primaryUseCase: PrimaryUseCase
): Promise<string> {
  try {
    const prompt = buildPrompt(audit, primaryUseCase);
    const geminiText = await callGemini(prompt);

    if (geminiText && isValidSummary(geminiText)) {
      return geminiText;
    }

    if (geminiText) {
      console.warn(
        "[AuditSight/ai-summary] Gemini response failed word count validation " +
        `(${geminiText.split(/\s+/).length} words). Using fallback.`
      );
    }
  } catch (err) {
    console.error("[AuditSight/ai-summary] Unexpected error during summary generation:", err);
  }

  return buildFallbackSummary(audit, primaryUseCase);
}
