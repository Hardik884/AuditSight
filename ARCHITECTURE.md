# Architecture

## System Diagram

diagram/mermaid-diagram.png

```mermaid
flowchart TB
  %% AuditSight (Next.js App Router) — high-level production architecture

  U[User / Buyer] -->|Browser| WEB[Next.js App Router UI]
  WEB -->|POST /api/audit| API_AUDIT[Route Handler: /app/api/audit/route.ts]
  WEB -->|POST /api/email-capture| API_EMAIL[Route Handler: /app/api/email-capture/route.ts]

  API_AUDIT -->|Zod validate + normalize| VALID[Validation Layer<br/>(Zod schema)]
  VALID -->|deterministic scoring| ENGINE[Audit Engine<br/>(scoring + rules + recommendation)]
  ENGINE -->|pricing lookups| PRICING[Pricing Intelligence<br/>(config + vendor plan mapping)]

  ENGINE -->|structured findings| SUMMARY[Gemini Summary<br/>(executive narrative)]
  SUMMARY -.->|fallback: templated summary| FALLBACK[Summary Fallback<br/>(no LLM / error)]

  ENGINE -->|persist report + inputs| DB[(Supabase Postgres)]
  API_EMAIL -->|store lead + unlock state| DB

  DB -->|read via /audit/[id]| REPORT[Shareable Report Route<br/>/app/audit/[id]/page.tsx]
  REPORT --> OG[Open Graph Image<br/>/app/audit/[id]/opengraph-image.tsx]

  API_EMAIL -->|send transactional email| RESEND[Resend API]
  RESEND -->|delivered to inbox| U

  WEB -->|abuse protection| ABUSE[Honeypot / bot checks]
  ABUSE --> API_AUDIT
```

## Data Flow

This is the end-to-end request path for generating and sharing an audit report, mapped to how the project is structured in the repo.

1. **User input is collected (UI + form state)**
   - The onboarding/audit intake experience is implemented in the App Router UI and form components.
   - The user enters their AI tooling mix (vendor plans), seat counts, and spend assumptions through the intake flow (see the form components under `src/components/forms/`).
   - As part of intake, a lightweight **abuse protection** layer is applied (honeypot-style bot checks) to avoid adding friction while still blocking obvious automation.

2. **Input is validated (Zod) before any audit work happens**
   - The API boundary is the route handler at `src/app/api/audit/route.ts`.
   - The request payload is validated and normalized using the Zod schema in `src/lib/validation/audit-schema.ts`.
   - This is intentionally strict: invalid vendor plan combinations, missing fields, or malformed numbers are rejected early so the downstream audit engine stays deterministic and safe.

3. **The audit is processed through deterministic logic (scoring + rules)**
   - After validation, the route handler calls into the audit pipeline (`src/lib/audit-engine.ts`, `src/lib/scoring-engine.ts`, `src/lib/audit-rules.ts`).
   - The system calculates a structured set of findings:
     - baseline spend by tool/plan
     - projected savings opportunities
     - risk / confidence signals
     - recommendation set (what to downgrade, consolidate, or right-size)
   - The recommendation logic is deterministic by design (given the same inputs and pricing config, the output should be reproducible). This keeps reports defensible when shared with finance or leadership.

4. **Findings are enriched with pricing intelligence**
   - Pricing intelligence is treated as configuration and mapping logic (see `src/constants/pricing.ts` and related audit config under `src/constants/audit-config.ts`).
   - The audit engine uses this structured pricing data to compute deltas between plans and to justify why a recommendation exists (not “because the model said so,” but because the numbers change).

5. **Gemini generates an executive summary on top of structured findings**
   - Once the deterministic findings are produced, the system generates an executive-facing narrative summary using Gemini (`src/lib/gemini.ts` and `src/lib/ai-summary.ts`).
   - The key design choice: Gemini is not asked to “invent” savings or decide what to recommend; it summarizes the already-computed results.
   - **Fallback behavior:** if Gemini is unavailable, slow, or returns an invalid response, the API returns the report with a conservative fallback summary (a templated summary derived from structured findings). This keeps the product usable and prevents the LLM from becoming a hard dependency.

6. **The report is persisted in Supabase (and later retrievable by ID)**
   - The final audit artifact (inputs + computed findings + summary + metadata) is stored in Supabase via the server-side client (`src/lib/supabase/server.ts`) and storage helpers (`src/lib/audit-storage.ts`, `src/lib/public-audit.ts`).
   - Persistence is what enables:
     - gated report unlock flows
     - stable, shareable URLs
     - re-rendering of reports without recomputing the audit each page view

7. **The audit is rendered as a shareable report route**
   - Reports are served via dynamic routing: `src/app/audit/[id]/page.tsx`.
   - The page fetches the persisted audit by ID (server-side), then renders the dashboard/report panels.
   - Loading states are handled by `src/app/audit/[id]/loading.tsx` to keep perceived performance high.

8. **OG metadata + previews are generated per report**
   - Each shareable report includes an Open Graph image route at `src/app/audit/[id]/opengraph-image.tsx`.
   - This ensures links pasted into Slack/iMessage/LinkedIn render a clean preview without requiring the client to run JS.
   - Metadata helpers live in `src/lib/metadata.ts` and are composed at the App Router layer.

9. **Transactional email flow (unlock / delivery / follow-up)**
   - Lead capture and report unlocking runs through `src/app/api/email-capture/route.ts`.
   - The route persists the email capture record and uses Resend (`src/lib/email/resend-client.ts`, `src/lib/email/send-audit-email.ts`) to send a transactional email (template in `src/lib/email/templates/audit-email.ts`).
   - This flow is intentionally kept server-side to protect API keys and prevent client tampering.

## Why I Chose This Stack

- **Next.js App Router**
  - I wanted one cohesive surface area for UI, API endpoints, OG images, and dynamic routes without spinning up a separate backend service.
  - App Router makes it straightforward to keep the report rendering server-first (faster initial load, better link previews) while still building a polished UI.

- **Supabase**
  - Supabase gives Postgres + auth primitives + server/client SDKs with minimal setup, which is ideal for an MVP that still needs real persistence.
  - It also keeps the “shareable audit URL” story simple: persist the report once, then read by ID on every view.

- **Gemini**
  - Gemini is used where it adds leverage: turning structured findings into executive-ready narrative.
  - Keeping Gemini out of the core financial math reduces risk (hallucinations, inconsistent outputs) and keeps unit tests meaningful.

- **Resend**
  - Resend is pragmatic for transactional email: clean API, fast setup, and templates that fit a SaaS unlock/lead flow.
  - It lets the product behave like a real SaaS without building a full email infrastructure.

- **Vitest**
  - The audit engine is deterministic and math-heavy, which benefits from fast unit tests.
  - Vitest runs quickly locally and in CI, so changes to pricing logic or scoring don’t silently shift report outputs.

- **Vercel**
  - Vercel is the cleanest deployment target for a Next.js App Router product.
  - It reduces ops overhead (build + deploy + env vars + previews) and keeps iteration speed high.

## What I’d Change at 10k Audits/Day

At MVP scale, synchronous request/response generation is fine. At ~10k audits/day, the pressure points become LLM latency/cost, DB write volume, and burst traffic patterns.

- **Move audit generation to background jobs**
  - The `/api/audit` route would enqueue a job and return a `reportId` immediately.
  - A worker would compute the audit, persist results, then notify the user (email + UI polling). This removes request timeouts and makes throughput predictable.

- **Add queue-based processing + dedicated workers**
  - Use a managed queue (e.g., a Redis-backed queue or a hosted job system) and run compute in worker processes separate from the web tier.
  - This prevents audit spikes from impacting report reads, marketing traffic, or email capture.

- **Cache vendor pricing intelligence**
  - Pricing config is currently fast, but at scale I’d formalize it: versioned pricing tables, cached lookups, and explicit “pricing version” stored on each audit.
  - This makes audits reproducible over time even as pricing changes.

- **Redis/session optimization for gated reports**
  - If unlock state becomes hot-path, I’d store short-lived unlock/session state in Redis instead of repeatedly hitting Postgres.
  - This keeps report reads cheap and reduces DB contention.

- **Rate limiting + abuse protection upgrades**
  - Honeypots are great for low-friction protection, but at higher volume I’d add IP/user-agent rate limiting at the edge and route-level throttling.
  - I’d also track suspicious patterns in a small audit-log table to ban repeat offenders.

- **Separate read-heavy report traffic from write-heavy generation**
  - Split endpoints (or even services) so shareable report rendering is optimized for fast reads and caching, while generation is optimized for throughput.
  - Consider edge caching for report pages where appropriate (and safe) plus cached OG images.

- **Database indexing + storage hygiene**
  - Add targeted indexes on report lookup fields (`reportId`, creation time, email capture associations) and routinely prune/compact any high-churn tables.
  - Store large LLM payloads separately if they become a cost or performance issue.

- **Observability and cost controls**
  - Add structured logging around audit generation (timings, pricing version, summary token usage).
  - Track Gemini usage per audit and enforce budgets (fallback summary when the budget is exceeded).

- **Reduce Gemini latency and cost**
  - Summaries become asynchronous (job step) with caching and deduping.
  - Use smaller prompts, truncate inputs deterministically, and only summarize deltas when re-running an audit.
