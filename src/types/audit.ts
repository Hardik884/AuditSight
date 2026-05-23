import type { ToolCategory, ToolName, ToolPlan } from "@/constants/pricing";
export type { ToolCategory, ToolName, ToolPlan } from "@/constants/pricing";

export type PrimaryUseCase = "Coding" | "Writing" | "Data" | "Research" | "Mixed";

export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

export type ConfidenceLevel = "Low" | "Medium" | "High";

export type SeverityLevel = "Low" | "Medium" | "High";

export type DifficultyLevel = "Low" | "Medium" | "High";

export type EmailCaptureSource = "report-unlock";

export interface ToolSelection {
  tool: ToolName;
  plan: ToolPlan;
  monthlySpend: number;
  seatCount: number;
}

export interface AuditRequest {
  primaryUseCase: PrimaryUseCase;
  teamSize: number;
  tools: ToolSelection[];
}

export interface ToolBreakdown {
  tool: ToolName;
  plan: ToolPlan;
  monthlySpend: number;
  seatCount: number;
  recommendedAction: string;
  projectedSavings: number;
  rationale: string;
}

export interface Recommendation {
  title: string;
  description: string;
  confidence: ConfidenceLevel;
  estimatedSavingsImpact: number;
  severity: SeverityLevel;
  difficulty: DifficultyLevel;
}

export interface AuditMetrics {
  estimatedSavings: number;
  annualSavings: number;
  optimizationScore: number;
  riskLevel: RiskLevel;
  potentialSavingsPercent: number;
  totalMonthlySpend: number;
  totalSeats: number;
}

export interface AuditSummary {
  headline: string;
  narrative: string;
}

export interface UsageInsights {
  topTools: ToolName[];
  seatUtilizationPercent: number;
  highestSpendTool: ToolName | null;
  toolCategories: ToolCategory[];
}

export interface AuditResponse {
  auditId: string;
  generatedAt: string;
  metrics: AuditMetrics;
  recommendations: Recommendation[];
  auditSummary: AuditSummary;
  usageInsights: UsageInsights;
  toolBreakdown: ToolBreakdown[];
  optimizationOpportunities: string[];
  governanceInsights: string[];
}

export interface AuditResult extends AuditResponse {}

export interface AuditRow {
  id?: string;
  created_at?: string;
  team_size: number;
  primary_use_case: PrimaryUseCase;
  tools: ToolSelection[];
  total_monthly_spend: number;
  total_seats: number;
  estimated_savings: number;
  annual_savings: number;
  optimization_score: number;
  risk_level: RiskLevel;
  potential_savings_percent: number;
  recommendations: Recommendation[];
  governance_insights: string[];
  usage_insights: UsageInsights;
  audit_summary: AuditSummary;
  tool_breakdown: ToolBreakdown[];
  optimization_opportunities: string[];
  request_id?: string;
}

export interface EmailCaptureRequest {
  auditId: string;
  email: string;
  capturedFrom: EmailCaptureSource;
}

export interface EmailCaptureRow {
  audit_id: string;
  email: string;
  captured_from: EmailCaptureSource;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: {
    message: string;
    details?: string[];
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
