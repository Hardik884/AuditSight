-- =============================================================================
-- AuditSight — Supabase Migration (ALTER TABLE version)
-- Safe upgrade from the original schema to the pricing intelligence architecture
-- =============================================================================
--
-- Purpose: Upgrade an existing Supabase database without destroying data.
--          Apply this script once against a live database that was created
--          with the original schema.sql (pre-pricing-intelligence refactor).
--
-- Safety principles:
--   • All ADD COLUMN statements use IF NOT EXISTS (idempotent — safe to re-run)
--   • No DROP COLUMN — legacy columns are preserved to protect existing rows
--   • No TRUNCATE or DELETE
--   • Default values backfill existing rows where a NOT NULL constraint is added
--   • Indexes use IF NOT EXISTS (idempotent)
--   • Policies use DO $$ ... $$ blocks to avoid duplicate-policy errors
--
-- Execution order:
--   1. Extensions
--   2. audits table: add missing columns
--   3. audits table: update constraints on existing columns
--   4. New indexes
--   5. RLS enable + policies
--   6. email_captures table: tighten constraints
--   7. Verification queries (commented out — run manually to confirm)
-- =============================================================================

begin;

-- =============================================================================
-- STEP 0: Ensure required extension
-- =============================================================================

create extension if not exists "pgcrypto";

-- =============================================================================
-- STEP 1: Add missing columns to public.audits
-- =============================================================================
-- The original schema was missing several columns that the refactored
-- audit engine now writes. Each is added with a safe default.

-- consultation_recommended
-- The original schema had this column but as: boolean default false (nullable).
-- The refactor requires it as NOT NULL. We add it idempotently, then tighten.
alter table public.audits
  add column if not exists consultation_recommended boolean not null default false;
-- Maps to: annual_savings >= CONSULTATION_THRESHOLD (10000) in audit-engine.ts
-- Read by: AuditResultDetails.tsx showConsultationCta check

-- request_id
-- Was in original schema as: uuid null. Already present — no change needed.
-- Included here for documentation completeness.
-- Maps to: AuditRow.request_id (echo of the in-memory auditId)
alter table public.audits
  add column if not exists request_id uuid null;

-- NOTE: The following columns were present in the original schema and
-- require no structural change. They are documented here to confirm alignment:
--
--   id                        uuid pk   ✓ unchanged
--   created_at                timestamptz ✓ unchanged
--   team_size                 integer   ✓ unchanged
--   primary_use_case          text      ✓ unchanged
--   tools                     jsonb     ✓ structure now includes ToolName enum values
--   total_monthly_spend       numeric   ✓ unchanged
--   total_seats               integer   ✓ unchanged
--   estimated_savings         numeric   ✓ unchanged
--   annual_savings            numeric   ✓ unchanged
--   optimization_score        integer   ✓ unchanged
--   risk_level                text      ✓ now constrained to enum values (see step 3)
--   potential_savings_percent integer   ✓ unchanged
--   recommendations           jsonb     ✓ shape extended with severity + difficulty fields
--   governance_insights       jsonb     ✓ unchanged (was jsonb)
--   usage_insights            jsonb     ✓ unchanged (was jsonb)
--   audit_summary             jsonb     ✓ unchanged (was jsonb)
--   tool_breakdown            jsonb     ✓ shape extended: confidence + ruleId fields added
--   optimization_opportunities jsonb   ✓ unchanged (was jsonb)

-- =============================================================================
-- STEP 2: Tighten existing column constraints
-- =============================================================================

-- consultation_recommended: ensure NOT NULL with default (idempotent update)
-- If the column already existed as nullable, this sets a safe default for
-- any existing NULL rows before applying NOT NULL.
update public.audits
  set consultation_recommended = false
  where consultation_recommended is null;

alter table public.audits
  alter column consultation_recommended set not null,
  alter column consultation_recommended set default false;

-- =============================================================================
-- STEP 3: Add a CHECK constraint for risk_level enum values
-- =============================================================================
-- Guards against invalid values being inserted from future code changes.
-- Named constraint — safe to skip if it already exists (caught by DO block).

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'audits_risk_level_check'
      and conrelid = 'public.audits'::regclass
  ) then
    alter table public.audits
      add constraint audits_risk_level_check
      check (risk_level in ('Low', 'Moderate', 'High', 'Critical'));
  end if;
end;
$$;

-- Add a CHECK constraint for primary_use_case enum values
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'audits_primary_use_case_check'
      and conrelid = 'public.audits'::regclass
  ) then
    alter table public.audits
      add constraint audits_primary_use_case_check
      check (primary_use_case in ('Coding', 'Writing', 'Data', 'Research', 'Mixed'));
  end if;
end;
$$;

-- =============================================================================
-- STEP 4: Indexes
-- =============================================================================

-- Original index (preserved, idempotent)
create index if not exists audits_created_at_idx
  on public.audits (created_at desc);

-- New: partial index for consultation-eligible audits (annual_savings >= 10000)
-- Supports fast admin queries and future analytics on high-value leads.
create index if not exists audits_high_savings_idx
  on public.audits (annual_savings desc)
  where annual_savings >= 10000;

-- New: index on email_captures.audit_id for FK lookup performance
create index if not exists email_captures_audit_id_idx
  on public.email_captures (audit_id);

-- =============================================================================
-- STEP 5: Row Level Security
-- =============================================================================

-- Enable RLS on audits (safe if already enabled)
alter table public.audits enable row level security;

-- Enable RLS on email_captures (safe if already enabled)
alter table public.email_captures enable row level security;

-- Audits: insert policy
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'audits'
      and policyname = 'Allow public audit insert'
  ) then
    create policy "Allow public audit insert"
      on public.audits
      for insert
      to anon
      with check (true);
  end if;
end;
$$;

-- Audits: select policy
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'audits'
      and policyname = 'Allow public audit select by id'
  ) then
    create policy "Allow public audit select by id"
      on public.audits
      for select
      to anon
      using (true);
  end if;
end;
$$;

-- Email captures: insert policy
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'email_captures'
      and policyname = 'Allow public email capture insert'
  ) then
    create policy "Allow public email capture insert"
      on public.email_captures
      for insert
      to anon
      with check (true);
  end if;
end;
$$;

-- Email captures: restrict select (emails not publicly readable)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'email_captures'
      and policyname = 'Restrict email capture select'
  ) then
    create policy "Restrict email capture select"
      on public.email_captures
      for select
      to anon
      using (false);
  end if;
end;
$$;

-- =============================================================================
-- STEP 6: email_captures table — tighten captured_from constraint
-- =============================================================================
-- The original schema had captured_from as nullable text.
-- The refactor types it as EmailCaptureSource = 'report-unlock' (non-null).

-- Add optional enrichment fields for lead capture.
alter table public.email_captures
  add column if not exists company_name text null,
  add column if not exists role text null,
  add column if not exists team_size integer null;

update public.email_captures
  set captured_from = 'report-unlock'
  where captured_from is null;

alter table public.email_captures
  alter column captured_from set not null,
  alter column captured_from set default 'report-unlock';

-- Add CHECK constraint for captured_from to guard future source values
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'email_captures_captured_from_check'
      and conrelid = 'public.email_captures'::regclass
  ) then
    alter table public.email_captures
      add constraint email_captures_captured_from_check
      check (captured_from in ('report-unlock'));
    -- Add new valid sources here as EmailCaptureSource expands.
  end if;
end;
$$;

-- =============================================================================
-- STEP 7: Backfill consultation_recommended for existing rows
-- =============================================================================
-- Any audit rows inserted before this column existed will have the default
-- (false). Optionally backfill based on annual_savings threshold:

update public.audits
  set consultation_recommended = true
  where annual_savings >= 10000
    and consultation_recommended = false;

commit;

-- =============================================================================
-- VERIFICATION QUERIES (run manually after migration to confirm alignment)
-- =============================================================================
--
-- 1. Column inventory check:
--
--    select column_name, data_type, is_nullable, column_default
--    from information_schema.columns
--    where table_schema = 'public'
--      and table_name = 'audits'
--    order by ordinal_position;
--
-- 2. Constraint check:
--
--    select conname, contype, pg_get_constraintdef(oid)
--    from pg_constraint
--    where conrelid = 'public.audits'::regclass;
--
-- 3. RLS policy check:
--
--    select tablename, policyname, roles, cmd, qual
--    from pg_policies
--    where tablename in ('audits', 'email_captures')
--    order by tablename, policyname;
--
-- 4. Index check:
--
--    select indexname, indexdef
--    from pg_indexes
--    where tablename in ('audits', 'email_captures')
--    order by tablename, indexname;
--
-- 5. Spot-check a sample row structure:
--
--    select id, team_size, primary_use_case, total_monthly_spend,
--           estimated_savings, annual_savings, optimization_score,
--           risk_level, consultation_recommended,
--           jsonb_typeof(tools) as tools_type,
--           jsonb_typeof(tool_breakdown) as breakdown_type,
--           jsonb_typeof(recommendations) as recs_type
--    from public.audits
--    order by created_at desc
--    limit 5;
--
-- 6. Confirm tool_breakdown shape includes new fields:
--
--    select id,
--           tool_breakdown -> 0 ->> 'tool' as first_tool,
--           tool_breakdown -> 0 ->> 'ruleId' as rule_id,
--           tool_breakdown -> 0 ->> 'confidence' as confidence
--    from public.audits
--    order by created_at desc
--    limit 5;
--
-- =============================================================================
