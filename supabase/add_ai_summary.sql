-- =============================================================================
-- AuditSight — Additive Migration: Add AI Executive Summary Column
-- =============================================================================
--
-- Run this against your Supabase project to add the ai_executive_summary column.
-- Safe to run multiple times (IF NOT EXISTS / column add is idempotent).
--
-- This migration is purely additive — no existing data is altered or dropped.
-- Existing audits will have NULL for ai_executive_summary (expected behavior).
--
-- After running this migration:
--   - New audits will include the Gemini-generated executive summary
--   - Old audits will show the deterministic fallback summary in the UI
-- =============================================================================

ALTER TABLE public.audits
  ADD COLUMN IF NOT EXISTS ai_executive_summary TEXT;

-- No NOT NULL constraint: older audits legitimately have no AI summary.
-- The UI handles null gracefully via the fallback display path.

COMMENT ON COLUMN public.audits.ai_executive_summary IS
  'AI-generated personalized executive summary from Google Gemini 2.5 Flash. '
  'NULL when the API was unavailable, timed out, or not yet configured. '
  'The UI always renders a summary — either from this column or a high-quality '
  'deterministic fallback built from the audit engine outputs.';
