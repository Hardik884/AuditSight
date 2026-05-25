/**
 * AuditSight — Gemini API Client
 *
 * Low-level wrapper around the Google Gemini REST API.
 * Handles:
 *  - Environment variable validation
 *  - Request construction for gemini-2.5-flash (thinking model)
 *  - Timeout enforcement (20 seconds — thinking models need more time)
 *  - Complete response extraction with finishReason validation
 *  - Structured debug logging
 *  - Safe error swallowing (never throws — returns null on failure)
 *
 * KEY ARCHITECTURE NOTE — thinkingBudget:
 *   gemini-2.5-flash is a "thinking" model. maxOutputTokens is shared between
 *   internal thinking tokens and visible output tokens. Without setting
 *   thinkingBudget: 0, the model can burn nearly all tokens on reasoning,
 *   leaving only ~10 visible output tokens — causing the truncation bug.
 *   We set thinkingBudget: 0 to disable thinking for this summarization task
 *   (which does not benefit from multi-step reasoning) and give all token
 *   budget to visible output.
 *
 * SAFETY CONTRACT:
 *   This module is ONLY for summarizing deterministic audit outputs.
 *   It must never receive prompts that ask Gemini to compute savings,
 *   generate pricing, or make financial recommendations.
 */

/**
 * Use the stable v1beta model string for gemini-2.5-flash.
 * The thinking budget feature requires the v1beta endpoint.
 */
const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Thinking models (2.5 series) need additional time because they perform
 * internal reasoning before generating output. Even with thinkingBudget: 0
 * the model still initialises the thinking pathway.
 */
const GEMINI_TIMEOUT_MS = 20_000;

/** Maximum characters we accept back from Gemini (safety cap) */
const MAX_RESPONSE_CHARS = 3_000;

export type GeminiCallOptions = {
  /**
   * Maximum *visible output* tokens.
   * NOTE: For gemini-2.5-flash this budget is SEPARATE from thinking tokens
   * because we force thinkingBudget: 0. Set generously — the model will stop
   * at a natural sentence boundary well before the limit.
   */
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  /** Optional per-call timeout override (ms) */
  timeoutMs?: number;
};

/**
 * Call the Gemini API with a prompt string.
 *
 * @param prompt - The text prompt to send.
 * @returns The generated text, or `null` if the API call fails for any reason.
 */
export async function callGemini(
  prompt: string,
  options: GeminiCallOptions = {}
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.warn("[gemini] GEMINI_API_KEY not configured — using fallback summary");
    return null;
  }

  const {
    maxOutputTokens = 1024,  // generous budget; thinking tokens are excluded (budget=0)
    temperature = 0.4,
    topP = 0.9,
    timeoutMs = GEMINI_TIMEOUT_MS,
  } = options;

  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens,
      topP,
      /**
       * CRITICAL: thinkingBudget: 0 disables the thinking phase entirely.
       *
       * Without this, gemini-2.5-flash uses shared token budget for both
       * thinking and output. A 256-token budget is consumed by ~240 thinking
       * tokens, leaving ~10–15 for visible text — causing the truncation bug.
       *
       * For a summarization task (no multi-step reasoning needed), disabling
       * thinking is correct: lower latency, full output budget, same quality.
       */
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  };

  const isDebug = process.env.DEBUG_GEMINI_SUMMARY === "1";

  if (isDebug) {
    console.log("[gemini] Request config:", JSON.stringify({
      model: GEMINI_MODEL,
      maxOutputTokens,
      temperature,
      topP,
      thinkingBudget: 0,
      timeoutMs,
    }));
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error(`[gemini] HTTP error ${res.status}:`, errorText.slice(0, 400));
      return null;
    }

    const json = await res.json() as GeminiApiResponse;

    // ── Structured debug logging ───────────────────────────────────────────
    if (isDebug) {
      const candidate = json?.candidates?.[0];
      console.log("[gemini] Response debug:", JSON.stringify({
        finishReason: candidate?.finishReason,
        candidateCount: json?.candidates?.length ?? 0,
        partsCount: candidate?.content?.parts?.length ?? 0,
        usageMetadata: json?.usageMetadata,
      }));
    }

    // ── Extract candidate ──────────────────────────────────────────────────
    const candidate = json?.candidates?.[0];

    if (!candidate) {
      console.warn("[gemini] No candidates in response:", JSON.stringify(json).slice(0, 300));
      return null;
    }

    // ── Check finish reason ────────────────────────────────────────────────
    const finishReason = candidate.finishReason;

    if (finishReason === "MAX_TOKENS") {
      // Response was hard-truncated at the token limit.
      // Log token counts to help diagnose if the limit needs to be raised.
      console.warn("[gemini] Response was cut off at MAX_TOKENS.", {
        maxOutputTokens,
        candidatesTokenCount: json?.usageMetadata?.candidatesTokenCount,
        promptTokenCount: json?.usageMetadata?.promptTokenCount,
      });
      // Fall through — we still extract whatever text was generated, then
      // let ai-summary.ts decide whether it's usable based on word count.
    } else if (finishReason === "SAFETY") {
      console.warn("[gemini] Response blocked by safety filters.");
      return null;
    } else if (finishReason === "RECITATION") {
      console.warn("[gemini] Response blocked for recitation.");
      return null;
    } else if (finishReason && finishReason !== "STOP" && finishReason !== "END_OF_TURN") {
      // Unexpected finish reason — log it but still attempt to extract text
      console.warn("[gemini] Unexpected finishReason:", finishReason);
    }

    // ── Extract and assemble text from all parts ───────────────────────────
    const parts = candidate.content?.parts;

    if (!Array.isArray(parts) || parts.length === 0) {
      console.warn("[gemini] No content parts in candidate. Full response:", JSON.stringify(json).slice(0, 400));
      return null;
    }

    // Join all text parts — gemini can split content across multiple parts
    const text = parts
      .map((p) => p.text ?? "")
      .join("")
      .trim();

    if (!text) {
      console.warn("[gemini] Assembled text is empty after joining all parts.");
      return null;
    }

    if (isDebug) {
      console.log("[gemini] Extracted text:", {
        charCount: text.length,
        wordCount: text.trim().split(/\s+/).filter(Boolean).length,
        preview: text.slice(0, 200),
      });
    }

    // Cap at MAX_RESPONSE_CHARS (safety valve, should never trigger for 80–120 word summaries)
    return text.slice(0, MAX_RESPONSE_CHARS);

  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn(`[gemini] API call timed out after ${timeoutMs}ms`);
    } else {
      console.error("[gemini] Unexpected error:", err);
    }
    return null;
  }
}

// ─── Gemini REST API Response Types ──────────────────────────────────────────

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
      role?: string;
    };
    /**
     * Why the model stopped generating:
     *   "STOP"        — natural end of generation (normal)
     *   "MAX_TOKENS"  — hit the maxOutputTokens limit (indicates truncation)
     *   "SAFETY"      — blocked by safety filters
     *   "RECITATION"  — blocked for recitation
     *   "END_OF_TURN" — normal end (streaming)
     */
    finishReason?: string;
    index?: number;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
    /** Tokens used for thinking (excluded from candidatesTokenCount when thinkingBudget=0) */
    thoughtsTokenCount?: number;
  };
  /** Present when the prompt itself was blocked */
  promptFeedback?: {
    blockReason?: string;
  };
}
