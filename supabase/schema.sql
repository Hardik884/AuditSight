create extension if not exists "pgcrypto";

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),

  created_at timestamptz not null default now(),

  team_size integer not null,

  primary_use_case text not null,

  tools jsonb not null,

  total_monthly_spend numeric not null,

  total_seats integer not null,

  estimated_savings numeric not null,

  annual_savings numeric not null,

  optimization_score integer not null,

  risk_level text not null,

  potential_savings_percent integer not null,

  recommendations jsonb not null,

  governance_insights jsonb not null,

  usage_insights jsonb not null,

  audit_summary jsonb not null,

  tool_breakdown jsonb not null,

  optimization_opportunities jsonb not null,

  consultation_recommended boolean default false,

  request_id uuid null
);

create index if not exists audits_created_at_idx
on public.audits (created_at desc);

create table if not exists public.email_captures (
  id uuid primary key default gen_random_uuid(),

  created_at timestamptz default now(),

  audit_id uuid references public.audits(id) on delete cascade,

  email text not null,

  captured_from text
);