# AuditSight Testing

## Overview
AuditSight uses Vitest for deterministic, business-logic-focused testing. The goal is to validate the audit engine, scoring, recommendations, validation rules, and AI-summary fallbacks without relying on fragile UI snapshots.

## What Is Tested
- Audit engine summary behavior for cost-efficient stacks.
- Risk and optimization scoring boundaries.
- Recommendation engine "already optimized" outcomes.
- Validation schema rejection of invalid payloads.
- Gemini executive summary fallback behavior.

## Why These Tests Matter
These tests cover the deterministic core of AuditSight's value proposition:
- Financial correctness and honest messaging.
- Stable scoring and risk assignments.
- Clear recommendation defaults when no savings are detected.
- Reliable validation that protects API integrity.
- Safe AI behavior when the LLM is unavailable.

## How To Run Tests
```bash
npm run test
```

Watch mode:
```bash
npm run test:watch
```

Coverage:
```bash
npm run test:coverage
```

## Notes
- Tests are intentionally focused on business logic in `src/lib`.
- UI rendering tests are avoided to keep the suite stable and fast.
