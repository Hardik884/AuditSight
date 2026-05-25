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
 * ARCHITECTURE NOTE — why thinkingBudget: 0 matters:
 *   gemini-2.5-flash is a thinking model. Without thinkingBudget: 0, the
 *   model's maxOutputTokens budget is shared with internal reasoning tokens.
 *   A 256-token budget left ~10–15 visible tokens after thinking consumed the
 *   rest — causing the observed 9–15 word truncation. The fix is in gemini.ts:
 *   thinkingBudget: 0 disables thinking so all token budget goes to output.
 */

import type { AuditResponse, PrimaryUseCase } from "@/types/audit";
import { callGemini } from "@/lib/gemini";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Minimum words to accept a Gemini response (rejects meta-refusals & fragments) */
const MIN_WORDS = 50;
/** Maximum words — far above our ~120 word target, only filters runaway outputs */
const MAX_WORDS = 250;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isValidSummary(text: string): boolean {
  const wc = wordCount(text);
  return wc >= MIN_WORDS && wc <= MAX_WORDS;
}

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

  const toolSummaryLines = toolBreakdown
    .map((t) => {
      const status =
        t.projectedSavings > 0
          ? `(savings opportunity: $${t.projectedSavings}/mo)`
          : "(cost-efficient)";
      return `  - ${t.tool} [${t.plan}]: $${t.monthlySpend}/mo, ${t.seatCount} seats ${status}`;
    })
    .join("\n");

  const topRecommendations =
    recommendations
      .filter((r) => r.estimatedSavingsImpact > 0)
      .slice(0, 3)
      .map((r) => `  - ${r.title}`)
      .join("\n") || "  - No high-priority savings actions identified";

  const savingsContext =
    estimatedSavings >= 100
      ? `Estimated monthly savings: $${estimatedSavings.toLocaleString()} ($${annualSavings.toLocaleString()}/year)`
      : "The stack appears cost-efficient — no material savings opportunities were identified.";

  return `You are an executive AI spend analyst writing a board-level summary for a company's AI tool audit.

AUDIT CONTEXT (do not alter these numbers — they are pre-computed by a deterministic audit engine):
- Primary use case: ${primaryUseCase}
- Team seat utilization: ${usageInsights.seatUtilizationPercent}%
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
Write a single executive summary paragraph (90–120 words) that:
1. Opens with the overall spend posture and risk level
2. Names the primary use case and the top 1–2 specific tools
3. States the key finding (savings opportunity OR cost-efficiency)
4. Mentions the top 1–2 recommended actions naturally in prose
5. Closes with a forward-looking governance note

OUTPUT RULES (follow strictly):
- Output ONLY the paragraph text — no headers, no labels, no preamble like "Here is your summary:"
- Do NOT use bullet points, numbered lists, or markdown formatting
- Do NOT invent any dollar amounts — use only the exact figures provided above
- Write in third-person professional tone ("The audit found..." or "This team's AI stack...")
- The paragraph must be between 90 and 120 words
- Sound like a senior CFO advisor writing for a board deck, not a chatbot`;
}

// ─── Fallback Summary ─────────────────────────────────────────────────────────

/**
 * High-quality templated fallback when Gemini is unavailable.
 * Interpolates real audit data so it reads as personalized.
 */
function buildFallbackSummary(
  audit: AuditResponse,
  primaryUseCase: PrimaryUseCase
): string {
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

  const topTool =
    usageInsights.highestSpendTool ?? toolBreakdown[0]?.tool ?? "AI tools";
  const toolCount = toolBreakdown.length;
  const hasOpportunities = estimatedSavings >= 100;

  if (totalMonthlySpend === 0) {
    return `This team's AI audit was completed across ${toolCount} tool${
      toolCount !== 1 ? "s" : ""
    } in the ${primaryUseCase.toLowerCase()} workflow. No spend data was recorded — enter monthly spend values to enable savings analysis and ROI benchmarking. Once spend data is available, the audit engine will apply defensible, rule-based analysis across plan tiers, seat allocations, and tool overlap to surface actionable optimization opportunities.`;
  }

  if (!hasOpportunities) {
    return (
      `This team's AI stack — anchored by ${topTool} — totals $${totalMonthlySpend.toLocaleString()}/month ` +
      `across ${toolCount} active tool${toolCount !== 1 ? "s" : ""} supporting ${primaryUseCase.toLowerCase()} workflows. ` +
      `The audit engine found no material optimization opportunities based on current plan tiers and seat allocations, ` +
      `placing the stack in a cost-efficient posture with an optimization score of ${optimizationScore}/100. ` +
      `Risk is rated ${riskLevel}. A quarterly review is recommended to capture future vendor pricing changes, ` +
      `headcount shifts, and newly available plan tiers that may unlock additional savings.`
    );
  }

  const topRec = recommendations.find((r) => r.estimatedSavingsImpact > 0);
  const topRecText = topRec
    ? ` Priority action: ${topRec.title.toLowerCase()}.`
    : "";

  return (
    `This team's AI stack — led by ${topTool} — currently runs $${totalMonthlySpend.toLocaleString()}/month ` +
    `across ${toolCount} tool${toolCount !== 1 ? "s" : ""} supporting ${primaryUseCase.toLowerCase()} workflows. ` +
    `The audit identified $${estimatedSavings.toLocaleString()}/month in optimization potential ` +
    `($${annualSavings.toLocaleString()} annually), driven by plan-tier misalignment and seat over-provisioning.` +
    `${topRecText} Risk is rated ${riskLevel} with an optimization score of ${optimizationScore}/100. ` +
    `Implementing the top recommendations and establishing a quarterly AI spend review cadence ` +
    `would materially improve unit economics and reduce governance exposure.`
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Generate an AI executive summary for a completed audit.
 *
 * Pipeline:
 *   1. Build prompt from deterministic audit outputs
 *   2. Call Gemini (thinkingBudget=0, maxOutputTokens=1024, 20s timeout)
 *   3. Validate response word count (50–250 words)
 *   4. On failure: one retry with explicit sentence-count instruction
 *   5. Final fallback: high-quality deterministic template — always returns a string
 *
 * @param audit - The completed, deterministic AuditResponse
 * @param primaryUseCase - The team's primary AI use case
 * @returns A personalized executive summary string, always defined
 */
export async function generateAiExecutiveSummary(
  audit: AuditResponse,
  primaryUseCase: PrimaryUseCase
): Promise<string> {
  const isDebug = process.env.DEBUG_GEMINI_SUMMARY === "1";

  try {
    const prompt = buildPrompt(audit, primaryUseCase);

    if (isDebug) {
      console.log("[ai-summary] Sending prompt to Gemini. Prompt length:", prompt.length, "chars");
    }

    // ── First attempt ────────────────────────────────────────────────────
    const geminiText = await callGemini(prompt, {
      maxOutputTokens: 1024,
      temperature: 0.4,
      topP: 0.9,
    });

    if (geminiText) {
      const wc = wordCount(geminiText);

      if (isDebug) {
        console.log("[ai-summary] First attempt result:", {
          wordCount: wc,
          isValid: isValidSummary(geminiText),
          preview: geminiText.slice(0, 150),
        });
      }

      if (isValidSummary(geminiText)) {
        return geminiText;
      }

      console.warn(
        `[ai-summary] First attempt failed validation (${wc} words, need ${MIN_WORDS}–${MAX_WORDS}). ` +
        `Retrying with explicit instruction.`
      );

      // ── Single retry ─────────────────────────────────────────────────
      // Only retry if we got something (truncation or too-terse), not for null (API error)
      const retryPrompt =
        `${prompt}\n\n---\n\n` +
        `IMPORTANT: Write exactly FIVE sentences totalling 90–120 words. ` +
        `Output only the paragraph — no labels, no preamble, no formatting. ` +
        `Third-person executive tone.`;

      const retryText = await callGemini(retryPrompt, {
        maxOutputTokens: 1024,
        temperature: 0.35,
        topP: 0.9,
      });

      if (retryText) {
        const retryWc = wordCount(retryText);

        if (isDebug) {
          console.log("[ai-summary] Retry result:", {
            wordCount: retryWc,
            isValid: isValidSummary(retryText),
            preview: retryText.slice(0, 150),
          });
        }

        if (isValidSummary(retryText)) {
          return retryText;
        }

        console.warn(`[ai-summary] Retry also failed validation (${retryWc} words). Using deterministic fallback.`);
      } else {
        console.warn("[ai-summary] Retry returned null. Using deterministic fallback.");
      }
    } else {
      console.warn("[ai-summary] First attempt returned null (API unavailable or key missing). Using fallback.");
    }
  } catch (err) {
    console.error("[ai-summary] Unexpected error during summary generation:", err);
  }

  // ── Deterministic fallback ───────────────────────────────────────────────
  return buildFallbackSummary(audit, primaryUseCase);
}
