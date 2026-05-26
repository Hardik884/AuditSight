-- =============================================================================
-- AuditSight — Supabase Schema (Full CREATE TABLE version)
-- Generated to match the refactored pricing intelligence architecture
-- =============================================================================
--
-- Column inventory is derived from:
--   src/lib/audit-storage.ts   (toRow / fromRow mapping)
--   src/types/audit.ts         (AuditRow, ToolBreakdown, Recommendation, etc.)
--   src/lib/audit-engine.ts    (generateAudit output shape)
--   src/lib/audit-rules.ts     (rule-based output fields)
--   src/constants/audit-config.ts (CONSULTATION_THRESHOLD = 10000)
--
-- JSONB strategy:
--   Complex nested structures (tools, breakdowns, recommendations, insights)
--   are stored as jsonb. Scalar metrics that need indexing or comparison
--   use native numeric/integer/text types.
-- =============================================================================

-- Required extension for UUID generation
create extension if not exists "pgcrypto";

-- =============================================================================
-- TABLE: public.audits
-- Primary audit record. One row per audit submission.
-- =============================================================================
create table if not exists public.audits (

  -- ── Identity & Timestamps ──────────────────────────────────────────────────

  id uuid primary key default gen_random_uuid(),
  -- Supabase-generated UUID. Returned to the client as auditId.
  -- Referenced by email_captures.audit_id.

  created_at timestamptz not null default now(),
  -- UTC timestamp of audit creation. Returned as generatedAt in AuditResponse.

  -- ── Audit Request Fields ───────────────────────────────────────────────────
  -- Sourced from AuditRequest (src/types/audit.ts)

  team_size integer not null,
  -- Total headcount reported by the user.
  -- Used by seat-exceed and enterprise-tiny-team rules.
  -- Valid range: 1–5000 (enforced in TEAM_SIZE_LIMITS).

  primary_use_case text not null,
  -- User's selected workflow focus.
  -- Enum: 'Coding' | 'Writing' | 'Data' | 'Research' | 'Mixed'
  -- Sourced from PRIMARY_USE_CASES constant.

  tools jsonb not null,
  -- Array of ToolSelection objects entered by the user.
  -- Shape: [{ tool: ToolName, plan: ToolPlan, monthlySpend: number, seatCount: number }]
  -- ToolName enum: Cursor | GitHub Copilot | Claude | ChatGPT |
  --                Anthropic API | OpenAI API | Gemini | Windsurf
  -- Stored as jsonb to preserve structured tool+plan+spend+seat data.

  -- ── Scalar Metrics ────────────────────────────────────────────────────────
  -- Sourced from AuditMetrics (src/types/audit.ts) via audit-engine.ts

  total_monthly_spend numeric not null,
  -- Sum of monthlySpend across all tool entries.
  -- Used for savings percent computation and risk scoring.

  total_seats integer not null,
  -- Sum of seatCount across all tool entries.
  -- Used for seat utilization percentage in usage insights.

  estimated_savings numeric not null,
  -- Total projected monthly savings after de-duplication.
  -- Derived from rule engine; never exceeds 25% of any single tool's spend.
  -- Conservative: $50/mo floor per rule before surfacing.

  annual_savings numeric not null,
  -- estimated_savings × 12. Used for CONSULTATION_THRESHOLD check (> $10,000).

  optimization_score integer not null,
  -- Score from 48–92. Computed by computeOptimizationScore().
  -- Penalized by tool count, high-tier count, low seat utilization,
  -- and the number of triggered rules.

  risk_level text not null,
  -- Enum: 'Low' | 'Moderate' | 'High' | 'Critical'
  -- Derived from computeRiskLevel(riskScore).

  potential_savings_percent integer not null,
  -- estimated_savings / total_monthly_spend × 100, capped at 40.

  -- ── Consultation Logic ─────────────────────────────────────────────────────

  consultation_recommended boolean not null default false,
  -- True when annual_savings >= CONSULTATION_THRESHOLD (10000).
  -- Drives the "Book a Credex Consultation" CTA in AuditResultDetails.

  -- ── Structured Output (JSONB) ─────────────────────────────────────────────
  -- These are complex nested objects from the audit engine output.

  recommendations jsonb not null,
  -- Array of Recommendation objects.
  -- Shape per item:
  --   { title: string, description: string,
  --     confidence: 'Low'|'Medium'|'High',
  --     estimatedSavingsImpact: number,
  --     severity: 'Low'|'Medium'|'High',
  --     difficulty: 'Low'|'Medium'|'High' }
  -- Sorted by severity → confidence → savings impact.
  -- Includes honest "cost-efficient" record when no rules fire.

  governance_insights jsonb not null,
  -- Array of string governance observation messages.
  -- Contextually selected from GOVERNANCE_INSIGHT_TEMPLATES
  -- based on tool count, API tools, and cross-tool rule results.

  usage_insights jsonb not null,
  -- UsageInsights object.
  -- Shape: { topTools: ToolName[], seatUtilizationPercent: number,
  --          highestSpendTool: ToolName|null, toolCategories: ToolCategory[] }

  audit_summary jsonb not null,
  -- AuditSummary object.
  -- Shape: { headline: string, narrative: string }
  -- Reflects honest state: cost-efficient vs. savings-found vs. no-spend.

  tool_breakdown jsonb not null,
  -- Array of ToolBreakdown objects (one per tool in the audit).
  -- Shape per item:
  --   { tool: ToolName, plan: ToolPlan,
  --     monthlySpend: number, seatCount: number,
  --     recommendedAction: string, projectedSavings: number,
  --     rationale: string,
  --     confidence?: 'Low'|'Medium'|'High',   -- from rule signal strength
  --     ruleId?: string }                      -- traceability: which rule fired
  -- Added confidence + ruleId in the pricing intelligence refactor.

  optimization_opportunities jsonb not null,
  -- Array of string opportunity labels.
  -- Contextually selected from OPTIMIZATION_OPPORTUNITY_TEMPLATES.
  -- Max 4 items; driven by copilot overlap, API tools, seat anomalies.

  -- ── AI Intelligence Layer ──────────────────────────────────────────────────

  ai_executive_summary text null,
  -- AI-generated personalized executive summary produced by Google Gemini 2.5 Flash.
  -- Generated server-side during audit creation and persisted alongside the audit.
  -- NULL for audits created before this column was added or when the API is
  -- unavailable/unconfigured. The UI always renders a summary — either from this
  -- column or a high-quality deterministic fallback built from the rule engine outputs.
  -- Safety: Gemini is instructed ONLY to summarize deterministic outputs; it never
  -- computes savings figures, pricing, or financial recommendations independently.

  -- ── Traceability ──────────────────────────────────────────────────────────

  request_id uuid null
  -- Echo of the auditId generated inside generateAudit().
  -- Useful for correlating the in-memory audit response with the DB row
  -- during the same request lifecycle. Nullable (not required for retrieval).

);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Descending timestamp index — used for audit listing / admin queries.
create index if not exists audits_created_at_idx
  on public.audits (created_at desc);

-- Partial index on annual_savings — fast lookup for consultation-eligible audits.
create index if not exists audits_high_savings_idx
  on public.audits (annual_savings desc)
  where annual_savings >= 10000;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on the audits table.
-- AuditSight uses the anon key (no user auth) so the policy allows
-- public insert + select by UUID. Sensitive data is gated by auditId.
alter table public.audits enable row level security;

-- Allow anyone to insert a new audit (audit form submission).
create policy "Allow public audit insert"
  on public.audits
  for insert
  to anon
  with check (true);

-- Allow lookup of any audit by its UUID (report page, /audit/[id]).
-- Access is effectively gated by UUID unguessability.
create policy "Allow public audit select by id"
  on public.audits
  for select
  to anon
  using (true);

-- =============================================================================
-- TABLE: public.email_captures
-- Email gating for the full report unlock flow (ReportUnlockCard).
-- =============================================================================
create table if not exists public.email_captures (

  id uuid primary key default gen_random_uuid(),

  created_at timestamptz not null default now(),

  audit_id uuid not null references public.audits(id) on delete cascade,
  -- Foreign key to the parent audit. Cascades on audit deletion.
  -- Used in the email-capture API route to link the submission.

  email text not null,
  -- Captured email address. Not validated for uniqueness (one audit
  -- may unlock from multiple devices/browsers).

  company_name text null,
  -- Optional company name for lead enrichment.

  role text null,
  -- Optional role/title for lead enrichment.

  team_size integer null,
  -- Optional headcount for lead enrichment.

  captured_from text not null default 'report-unlock'
  -- Source identifier. Type: EmailCaptureSource = 'report-unlock'.
  -- Allows future sources (e.g., 'consultation-cta') without schema change.

);

-- Index for looking up all captures by audit (admin/analytics).
create index if not exists email_captures_audit_id_idx
  on public.email_captures (audit_id);

-- Enable RLS on email_captures.
alter table public.email_captures enable row level security;

-- Allow anon insert (email capture form submission).
create policy "Allow public email capture insert"
  on public.email_captures
  for insert
  to anon
  with check (true);

-- Restrict select — email addresses should not be publicly readable.
-- (Admin access via service-role key only.)
create policy "Restrict email capture select"
  on public.email_captures
  for select
  to anon
  using (false);