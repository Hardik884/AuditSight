# PROMPTS

## Overview
AuditSight uses Gemini in exactly one place: generating an executive-facing narrative summary after an audit has already been computed. The audit engine itself (pricing, scoring, savings math, and recommendations) is deterministic and rule-based, because the core output needs to be reproducible, explainable, and financially defensible.

That separation is deliberate:
- **LLM is used for narrative**: translate structured findings into a board-ready paragraph.
- **LLM is not used for decisions**: pricing intelligence, savings calculations, and recommendations are computed first by deterministic logic.

In code, the summary pipeline is:
- Deterministic audit: `src/lib/audit-engine.ts` (`generateAudit`)
- Executive narrative: `src/lib/ai-summary.ts` (`generateAiExecutiveSummary`)
- Low-level Gemini call: `src/lib/gemini.ts` (`callGemini`, `thinkingBudget: 0`, timeout, finishReason handling)

The AI layer is constrained on purpose. A summary that sounds polished but contains invented numbers (or “creative” recommendations that contradict the pricing engine) is worse than no AI at all in a finance-adjacent product.

---

## Executive Summary Prompt
The production prompt is built in `src/lib/ai-summary.ts` inside `buildPrompt(audit, primaryUseCase)`.

It’s a single prompt that embeds **only pre-computed values** from the deterministic audit response and then asks Gemini to write **one paragraph** in a tight executive voice. The key constraint is repeated twice: *do not alter numbers* and *do not invent dollar amounts*.

### Prompt template (as used in the product)

```text
You are an executive AI spend analyst writing a board-level summary for a company's AI tool audit.

AUDIT CONTEXT (do not alter these numbers — they are pre-computed by a deterministic audit engine):
- Primary use case: <PrimaryUseCase>
- Team seat utilization: <SeatUtilizationPercent>%
- Total monthly AI spend: $<TotalMonthlySpend>
- <SavingsContextLine>
- Risk level: <RiskLevel>
- Optimization score: <OptimizationScore>/100
- Highest-spend tool: <HighestSpendTool or N/A>

TOOLS IN AUDIT:
  - <Tool> [<Plan>]: $<MonthlySpend>/mo, <SeatCount> seats (cost-efficient | savings opportunity: $<ProjectedSavings>/mo)
  - ...

TOP RECOMMENDATIONS:
  - <Recommendation title>
  - ...

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
- Sound like a senior CFO advisor writing for a board deck, not a chatbot
```

### Why it’s structured this way (what I learned by debugging it)
- **The model only sees structured facts**: the prompt is assembled from `AuditResponse.metrics`, `toolBreakdown`, `usageInsights`, and the already-built recommendation titles. This keeps the model in “summarize what happened” mode.
- **Word count is the real control knob**: I originally tried token limits alone, but the model would still return fragments or meta-responses. The prompt pins a 90–120 word target and the runtime validates the response.
- **Tone constraints are explicit**: the “CFO advisor / board deck” wording materially reduced “chatbot energy” compared to generic “professional tone” instructions.

### Runtime configuration (Gemini call)
The prompt is sent via `callGemini` in `src/lib/gemini.ts` with:
- Model: `gemini-2.5-flash`
- `thinkingConfig.thinkingBudget: 0` (critical; see failures below)
- `maxOutputTokens: 1024` (visible output budget)
- `temperature: 0.4`, `topP: 0.9`
- Timeout: 20s (AbortController)

On a single retry, the summary nudges toward tighter structure with:
- Slightly lower temperature (`0.35`)
- An explicit “exactly FIVE sentences totalling 90–120 words” instruction

---

## Fallback Summary Logic
Gemini is treated as an optional layer. `generateAiExecutiveSummary(...)` always returns a string, even when the model fails.

The fallback lives in `src/lib/ai-summary.ts` as `buildFallbackSummary(...)` and is intentionally **templated but personalized**:
- **No spend data** (`totalMonthlySpend === 0`): returns a short “enter spend to enable analysis” summary.
- **Cost-efficient posture** (estimated savings below the `$100/mo` materiality threshold): returns a conservative summary anchored to the highest-spend tool, spend, tool count, optimization score, and risk level.
- **Savings available**: returns a summary with the computed monthly + annual savings and references the top recommendation title if present.

This is necessary for production reliability:
- `callGemini(...)` in `src/lib/gemini.ts` never throws; it returns `null` on missing keys, timeouts, safety blocks, or unexpected response shapes.
- Responses are validated by word count in `src/lib/ai-summary.ts` (rejects fragments, meta-previews, and run-on outputs).
- When Gemini fails, the app degrades gracefully: reports still render and emails still send.

Persistence and rendering are designed around this:
- `src/lib/audit-storage.ts` persists `ai_executive_summary` as `null` when Gemini was unavailable or fell back.
- `src/lib/public-audit.ts` and `src/lib/email/send-audit-email.ts` select the best available narrative in order: `aiExecutiveSummary` → deterministic `auditSummary.narrative` → `auditSummary.headline`.

---

## Prompt Iterations That Failed
These are the failures that showed up in real runs and led to the current prompt + runtime guardrails.

### 1) “9–15 word summaries” (thinking token budget ate the output)
- **What happened:** `gemini-2.5-flash` is a thinking model. With a small `maxOutputTokens` budget, the model spent most tokens on internal thinking, leaving only a handful of visible output tokens.
- **Evidence in code:** Both `src/lib/ai-summary.ts` and `src/lib/gemini.ts` have an explicit architecture note documenting the truncation bug.
- **What I changed:** forced `thinkingConfig.thinkingBudget: 0` in `src/lib/gemini.ts`.
- **Why it worked:** the full budget goes to visible text (and latency drops). This task doesn’t benefit from multi-step reasoning anyway.

### 2) Meta-preambles and non-paragraph formatting
- **What happened:** early outputs sometimes started with “Here is your summary:” or drifted into list-like formatting when the tool breakdown/recommendations were present.
- **What I changed:** I added strict “OUTPUT RULES” that forbid headers, labels, bullets, and markdown.
- **Why it worked:** Gemini follows “don’t do X” instructions more reliably when they’re explicit and grouped as rules.

### 3) Too-short fragments vs. too-long essays
- **What happened:** even with a 90–120 word target, the model would sometimes return a short fragment (especially under truncation) or a longer “consulting memo.”
- **What I changed:** runtime validation + guardrails:
  - `MIN_WORDS = 50`, `MAX_WORDS = 250` in `src/lib/ai-summary.ts`
  - a hard character cap (`MAX_RESPONSE_CHARS = 3000`) in `src/lib/gemini.ts`
- **What eventually worked:** treat word count as a product constraint, not a best-effort guideline.

### 4) Hard truncation at `MAX_TOKENS`
- **What happened:** Gemini can legitimately stop with `finishReason: "MAX_TOKENS"` when it hits the limit.
- **What I changed:** `src/lib/gemini.ts` logs `finishReason` and token usage metadata, then still returns the partial text (so `ai-summary.ts` can decide if it’s acceptable).
- **What eventually worked:** a single retry that explicitly requests exactly five sentences tends to land inside the 90–120 word band more consistently.

### 5) Summary generation couldn’t be a hard dependency
- **What happened:** in local development, CI, or production incidents, the Gemini layer can be unavailable (missing `GEMINI_API_KEY`, timeouts, non-OK responses, or blocked generations).
- **Evidence in code:** `src/lib/gemini.ts` returns `null` on missing key/timeouts/safety blocks instead of throwing, and `src/lib/ai-summary.ts` always falls back to a deterministic summary.
- **What I changed:** treated Gemini as an optional enhancement:
  - swallow errors and return `null` from `callGemini(...)`
  - validate outputs (word count) and do a single retry for truncation/terse responses
  - persist `ai_executive_summary` as `null` when Gemini fails (`src/lib/audit-storage.ts`)
- **Why it worked:** report rendering and transactional email can always use deterministic copy (`auditSummary.narrative` / `auditSummary.headline`) without breaking the product.

---

## Why AI Was Not Trusted With Core Audit Logic
AuditSight is a spend optimization product. That means the output isn’t just “content” — it’s a financial claim.

The deterministic engine in `src/lib/audit-engine.ts` encodes “savings honesty rules,” including:
- every savings estimate must map back to a concrete pricing basis
- cross-tool overlap savings are conservative
- below a materiality floor ($100/month), the summary must say the stack is cost-efficient

This is the core philosophy:
1. **Compute first (deterministic):** pricing intelligence + rules + savings math are reproducible.
2. **Summarize second (LLM):** Gemini only turns the already-computed result into executive prose.

That division keeps stakeholder trust intact:
- Finance can sanity-check the math.
- Engineering can debug regressions.
- The product can be tested meaningfully (unit tests don’t chase nondeterministic outputs).

---

## Current Limitations
- **Summaries can still sound repetitive** across similar audits because the input structure is intentionally constrained (top tools, spend posture, recommendations, governance close).
- **Tone consistency varies** with model updates and edge-case inputs; runtime validation checks length, not “quality.”
- **Prompt tuning is manual:** changes are code changes, not a separate prompt management system.
- **Pricing intelligence changes over time:** summaries are grounded in current pricing config, but vendor plan changes require ongoing maintenance to keep the deterministic layer accurate.
- **LLM is still a dependency for the best experience:** the fallback is solid and reliable, but it’s visibly more templated than the Gemini output.

---

## Style Requirements
When modifying prompts or summary logic in AuditSight:
- **Never ask Gemini to compute savings, pricing, or recommendations.** Keep the deterministic/LLM boundary intact.
- **Keep the output contract tight:** one paragraph, executive voice, and grounded in values already computed.
- **Preserve validation + graceful degradation:** Gemini failures must not break report rendering or email delivery.
- **Prefer guardrails you can test:** if you add new prompt requirements, consider adding/adjusting unit tests around fallback behavior and summary selection.
- **Use debug logging intentionally:** `DEBUG_GEMINI_SUMMARY=1` should remain safe to enable locally without leaking secrets in logs.
