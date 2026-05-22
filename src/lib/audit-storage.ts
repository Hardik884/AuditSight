import type {
  AuditRequest,
  AuditResponse,
  AuditResult,
  AuditRow,
} from "@/types/audit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const AUDIT_TABLE = "audits";

const toRow = (request: AuditRequest, response: AuditResponse): AuditRow => ({
  team_size: request.teamSize,
  primary_use_case: request.primaryUseCase,
  tools: request.selectedTools,
  monthly_spend: request.monthlySpend,
  challenges: request.biggestChallenge,
  goals: request.auditGoals,
  estimated_savings: response.metrics.estimatedSavings,
  annual_savings: response.metrics.annualSavings,
  optimization_score: response.metrics.optimizationScore,
  risk_level: response.metrics.riskLevel,
  potential_savings_percent: response.metrics.potentialSavingsPercent,
  recommendations: response.recommendations,
  governance_insights: response.governanceInsights,
  usage_insights: response.usageInsights,
  audit_summary: response.auditSummary,
  optimization_opportunities: response.optimizationOpportunities,
  request_id: response.requestId,
});

const fromRow = (row: AuditRow & { id: string; created_at: string }): AuditResult => ({
  auditId: row.id,
  requestId: row.request_id ?? row.id,
  generatedAt: row.created_at,
  metrics: {
    estimatedSavings: row.estimated_savings,
    annualSavings: row.annual_savings,
    optimizationScore: row.optimization_score,
    riskLevel: row.risk_level,
    potentialSavingsPercent: row.potential_savings_percent,
  },
  recommendations: row.recommendations ?? [],
  auditSummary: row.audit_summary,
  usageInsights: row.usage_insights,
  optimizationOpportunities: row.optimization_opportunities ?? [],
  governanceInsights: row.governance_insights ?? [],
});

export const saveAudit = async (request: AuditRequest, response: AuditResponse) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(AUDIT_TABLE)
    .insert(toRow(request, response))
    .select("id, created_at")
    .single();

  if (error || !data) {
    if (error) {
      console.error("Supabase audit insert failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        error,
      });
    }
    throw new Error("Failed to persist audit.");
  }

  return {
    auditId: data.id,
    createdAt: data.created_at,
  };
};

export const getAuditById = async (auditId: string) => {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from(AUDIT_TABLE)
    .select("*")
    .eq("id", auditId)
    .single();

  if (error || !data) {
    return null;
  }

  return fromRow(data as AuditRow & { id: string; created_at: string });
};
