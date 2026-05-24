/**
 * AuditSight — Gemini API Client
 *
 * Low-level wrapper around the Google Gemini REST API.
 * Handles:
 *  - Environment variable validation
 *  - Request construction
 *  - Timeout enforcement (8 seconds)
 *  - Response parsing and validation
 *  - Safe error swallowing (never throws — returns null on failure)
 *
 * SAFETY CONTRACT:
 *   This module is ONLY for summarizing deterministic audit outputs.
 *   It must never receive prompts that ask Gemini to compute savings,
 *   generate pricing, or make financial recommendations.
 */

/** Gemini REST API endpoint for gemini-2.5-flash */
const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_TIMEOUT_MS = 8_000;

/** Maximum characters we accept back from Gemini (safety cap) */
const MAX_RESPONSE_CHARS = 2_000;

/**
 * Call the Gemini API with a prompt string.
 *
 * @param prompt - The text prompt to send. Must not contain requests to
 *   compute financial figures — only summarization tasks.
 * @returns The generated text, or `null` if the API call fails for any reason.
 */
export async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // No key configured — log once, return null to trigger fallback
    console.warn("[AuditSight/gemini] GEMINI_API_KEY not set — using fallback summary");
    return null;
  }

  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = JSON.stringify({
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.4,       // Low temperature = consistent, professional tone
      maxOutputTokens: 256,   // ~200 words max
      topP: 0.9,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
  });

  try {
    // Race between the API call and a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error(`[AuditSight/gemini] API error ${res.status}`, errorText.slice(0, 200));
      return null;
    }

    // Parse JSON response
    const json = await res.json() as GeminiApiResponse;

    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof text !== "string" || text.trim().length === 0) {
      console.warn("[AuditSight/gemini] Empty or malformed response from API");
      return null;
    }

    // Truncate if unexpectedly long
    return text.trim().slice(0, MAX_RESPONSE_CHARS);

  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn("[AuditSight/gemini] API call timed out after", GEMINI_TIMEOUT_MS, "ms");
    } else {
      console.error("[AuditSight/gemini] Unexpected error:", err);
    }
    return null;
  }
}

// ─── Gemini Response Shape ────────────────────────────────────────────────────

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
}
