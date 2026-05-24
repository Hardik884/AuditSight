# AuditSight — Prompt Engineering Documentation

## Overview

This document contains the exact production Gemini prompt used in AuditSight,
the design rationale behind it, and the fallback strategy.

---

## Prompt Design Principles

### Core Safety Contract

AuditSight's recommendation engine is **fully deterministic**. Every savings
figure, plan comparison, and optimization recommendation is computed by a
rule-based engine in `src/lib/audit-rules.ts` using published vendor pricing.

Gemini's role is **strictly limited to summarization**:

> Gemini receives pre-computed numbers and must only rephrase them in
> executive-grade prose. It must never compute, invent, or modify any
> financial figure.

This is enforced via:
1. Explicit instruction in the system prompt: *"Do NOT invent any dollar amounts — only use the exact figures provided above"*
2. Only derived audit outputs are injected — never raw pricing tables or formulas
3. Word count validation (40–200 words) rejects hallucinated long-form content
4. `temperature: 0.4` — low randomness for consistent, professional tone

---

## Production Prompt

```
You are an executive AI spend analyst writing a board-level summary for a company's AI tool audit.

AUDIT CONTEXT (do not alter these numbers — they are pre-computed by a deterministic audit engine):
- Primary use case: {primaryUseCase}
- Team size context: {seatUtilizationPercent}% seat utilization
- Total monthly AI spend: ${totalMonthlySpend}
- {savingsContext}
- Risk level: {riskLevel}
- Optimization score: {optimizationScore}/100
- Highest-spend tool: {highestSpendTool}

TOOLS IN AUDIT:
  - {tool} [{plan}]: ${monthlySpend}/mo, {seatCount} seats (savings opportunity: ${projectedSavings}/mo | cost-efficient)

TOP RECOMMENDATIONS:
  - {recommendation.title}

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
- Sound like a senior CFO advisor, not a chatbot
```

### Variable Injection

| Template variable | Source |
|---|---|
| `{primaryUseCase}` | `AuditRequest.primaryUseCase` |
| `{seatUtilizationPercent}` | `computeSeatUtilization()` from scoring engine |
| `{totalMonthlySpend}` | `computeTotalMonthlySpend()` |
| `{savingsContext}` | Conditional: "Estimated monthly savings: $X ($Y/year)" or "The stack appears cost-efficient" |
| `{riskLevel}` | `computeRiskLevel()` |
| `{optimizationScore}` | `computeOptimizationScore()` |
| `{highestSpendTool}` | Top tool by monthlySpend |
| `{tool lines}` | `toolBreakdown` — each row with savings status |
| `{recommendation titles}` | Top 3 recommendations with `estimatedSavingsImpact > 0` |

---

## Model Configuration

| Parameter | Value | Rationale |
|---|---|---|
| Model | `gemini-2.5-flash-preview-05-20` | Fast, cost-effective, strong instruction-following |
| Temperature | `0.4` | Low variance = consistent professional tone |
| `maxOutputTokens` | `256` | ~200 words hard cap |
| `topP` | `0.9` | Slightly focused sampling |
| Timeout | `8000ms` | Prevents blocking audit generation |

---

## Fallback Strategy

If Gemini fails for **any reason** — missing API key, timeout, rate limit, API outage,
or malformed response — the system generates a high-quality **deterministic fallback summary**:

### Fallback Logic (`buildFallbackSummary` in `src/lib/ai-summary.ts`)

Three fallback paths:

**1. No spend data:**
> *"This team's AI audit was completed across N tools in the {useCase} workflow. No spend data was recorded — enter monthly spend values to enable savings analysis."*

**2. Cost-efficient stack (savings < $100/mo):**
> *"This team's AI stack — anchored by {topTool} — totals ${spend}/month across N tools for {useCase} workflows. The audit engine found no material optimization opportunities... Risk is rated {riskLevel}..."*

**3. Savings identified:**
> *"This team's AI stack — led by {topTool} — currently runs ${spend}/month across N tools... The audit identified ${savings}/month in optimization potential... Priority action: {topRecommendation}..."*

### Why the fallback feels polished

- It interpolates **real audit data** (tool names, spend, savings)
- It uses the same executive tone as the prompt instructions
- It references the specific optimization score and risk level
- A finance person reading both versions cannot tell which is AI vs. template

---

## Why Deterministic Logic Is Preserved

The internship specification requires:

> *"ONLY the personalized summary should use AI. Audit math and optimization logic must remain rule-based."*

AuditSight enforces this at multiple layers:

1. **Architectural separation**: `generateAudit()` (deterministic) runs first. Gemini is called only after all financial outputs are computed.
2. **Prompt injection only**: Gemini sees outputs, never inputs or formulas.
3. **No feedback loop**: Gemini's output is stored as a display string. It never influences the rule engine, recommendations, or savings figures.
4. **Auditability**: Every number in the AI summary can be traced to a specific rule in `audit-rules.ts` and a pricing entry in `pricing.ts`.

This architecture means the product passes a "defensibility test": a finance or operations leader can agree with the reasoning because the math is rule-derived and the AI layer only explains it.

---

## Files

| File | Role |
|---|---|
| `src/lib/gemini.ts` | Low-level Gemini REST client |
| `src/lib/ai-summary.ts` | Summary generator + fallback |
| `src/app/api/audit/route.ts` | Calls AI summary after deterministic engine |
| `src/components/forms/AiExecutiveSummaryCard.tsx` | Premium UI card |
| `supabase/add_ai_summary.sql` | Additive DB migration |
