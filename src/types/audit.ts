export type TeamSize = "1-25" | "26-100" | "101-500" | "500+";

export type ToolName =
  | "ChatGPT"
  | "Claude"
  | "Cursor"
  | "GitHub Copilot"
  | "Gemini"
  | "Perplexity";

export type ToolCategory =
  | "LLM"
  | "Developer"
  | "Search"
  | "Assistant"
  | "Productivity";

export type Challenge =
  | "Unclear ROI"
  | "Overlapping subscriptions"
  | "Spend volatility"
  | "Model quality drift";

export type AuditGoal =
  | "Reduce monthly spend"
  | "Improve usage governance"
  | "Consolidate vendors"
  | "Optimize model routing";

export type PrimaryUseCase =
  | "Engineering"
  | "Marketing"
  | "Research"
  | "Customer Support"
  | "Operations"
  | "Sales"
  | "Content Creation";

export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

export type ConfidenceLevel = "Low" | "Medium" | "High";

export type SeverityLevel = "Low" | "Medium" | "High";

export type DifficultyLevel = "Low" | "Medium" | "High";

export interface AuditRequest {
  teamSize: TeamSize;
  selectedTools: ToolName[];
  monthlySpend: number;
  biggestChallenge: Challenge;
  auditGoals: AuditGoal[];
  primaryUseCase: PrimaryUseCase;
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
}

export interface AuditSummary {
  headline: string;
  narrative: string;
}

export interface UsageInsights {
  topTools: ToolName[];
  seatUtilizationPercent: number;
  promptVolume: number;
  toolCategories: ToolCategory[];
}

export interface AuditResponse {
  requestId: string;
  generatedAt: string;
  metrics: AuditMetrics;
  recommendations: Recommendation[];
  auditSummary: AuditSummary;
  usageInsights: UsageInsights;
  optimizationOpportunities: string[];
  governanceInsights: string[];
}

export interface AuditResult extends AuditResponse {
  auditId: string;
}

export interface AuditRow {
  id?: string;
  created_at?: string;
  team_size: TeamSize;
  primary_use_case: PrimaryUseCase;
  tools: ToolName[];
  monthly_spend: number;
  challenges: Challenge;
  goals: AuditGoal[];
  estimated_savings: number;
  annual_savings: number;
  optimization_score: number;
  risk_level: RiskLevel;
  potential_savings_percent: number;
  recommendations: Recommendation[];
  governance_insights: string[];
  usage_insights: UsageInsights;
  audit_summary: AuditSummary;
  optimization_opportunities: string[];
  request_id?: string;
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
