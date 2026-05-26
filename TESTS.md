# AuditSight — Tests & CI

## Overview

AuditSight’s automated tests are intentionally focused on deterministic business logic: scoring, recommendation generation, validation, and audit correctness. That’s the part of the product that can silently regress and produce incorrect savings recommendations if it isn’t exercised consistently.

Frontend snapshot testing was intentionally deprioritized because the UI changed frequently throughout development (animations, layout, copy, onboarding flow), while the more important risk area was the financial logic underneath the reports. The goal of the test suite is to ensure that identical inputs continue producing stable, defensible audit outputs.

---

## How to Run Tests

Run all tests:

```bash
npm run test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run coverage:

```bash
npm run test:coverage
```

### Notes

- `npm run test` maps to `vitest run`
- Coverage uses the V8 provider configured in `vitest.config.ts`
- The tests primarily target `src/lib/**` because most critical business logic lives there

---

# List of Automated Tests

The repository currently contains 5 test files under `src/lib/__tests__/` with 6 runnable unit tests covering the audit engine, recommendation logic, validation, scoring, and Gemini fallback behavior.

---

## `src/lib/__tests__/audit-engine.test.ts`

### What it covers

Tests the top-level audit generation flow and validates how the audit engine behaves when savings opportunities are minimal.

### Why it matters

This test protects the main audit flow and ensures low-savings audits don’t manufacture fake optimization opportunities.

### Validated behaviors / assertions

#### `it("returns a cost-efficient summary when savings are below the threshold")`

- verifies `estimatedSavings` is `0`
- verifies the generated messaging contains “cost-efficient”
- ensures the audit behaves conservatively instead of forcing recommendations

---

## `src/lib/__tests__/recommendation-engine.test.ts`

### What it covers

Tests recommendation aggregation behavior when no optimization rules trigger.

### Why it matters

The product should still return a coherent report even when the stack is already reasonably optimized.

### Validated behaviors / assertions

#### `it("returns a cost-efficient recommendation when no rules trigger")`

- verifies recommendation output length
- verifies the recommendation title contains “cost-efficient”
- ensures the fallback recommendation path behaves consistently

---

## `src/lib/__tests__/scoring-engine.test.ts`

### What it covers

Tests risk scoring and optimization scoring logic.

### Why it matters

The scoring layer influences the overall framing of the audit report, especially for executive summaries and CTA visibility.

### Validated behaviors / assertions

#### `it("assigns High risk for large, high-spend, multi-tool stacks")`

- computes risk scores for large organizations
- verifies numeric risk score thresholds
- verifies the returned risk level equals `"High"`

#### `it("clamps optimization score to the configured minimum")`

- tests extreme low-score conditions
- verifies score clamping behavior using `OPTIMIZATION_SCORE_CONFIG`

---

## `src/lib/__tests__/validation.test.ts`

### What it covers

Tests the Zod validation schema used by the audit API boundary.

### Why it matters

Most major backend issues during development came from schema mismatches between frontend form state, API payloads, and database persistence.

### Validated behaviors / assertions

#### `it("rejects payloads with no tool entries")`

- validates `auditRequestSchema.safeParse(...)`
- verifies malformed payloads fail validation correctly
- prevents invalid audit generation requests from reaching the engine

---

## `src/lib/__tests__/ai-summary.test.ts`

### What it covers

Tests Gemini executive summary fallback behavior.

### Why it matters

The audit product should remain usable even if Gemini fails, returns invalid output, or becomes temporarily unavailable.

### Validated behaviors / assertions

#### `it("falls back to the deterministic summary when Gemini returns null")`

- mocks Gemini returning `null`
- verifies deterministic fallback summary generation
- ensures report generation never fully depends on the LLM layer

---

# CI / GitHub Actions

AuditSight uses GitHub Actions for automated validation on every push and pull request through:

```txt
.github/workflows/ci.yml
```

## CI Pipeline

The workflow automatically runs:

```bash
npm ci
npm run lint
npm run test
npm run build
```

## What CI Validates

- ESLint cleanliness
- Vitest unit tests
- deterministic audit engine stability
- production build health
- TypeScript safety
- App Router compatibility

## Why This Setup

The goal of the CI pipeline is to catch regressions early while keeping the workflow lightweight and fast. Since the product relies heavily on deterministic recommendation logic, automated validation became especially important after the onboarding and pricing-model refactors introduced more complex persistence and scoring behavior.
