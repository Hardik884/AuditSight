import { describe, expect, it, vi } from "vitest";
import type { AuditResponse } from "@/types/audit";
import { generateAiExecutiveSummary } from "@/lib/ai-summary";

vi.mock("@/lib/gemini", () => ({
  callGemini: vi.fn().mockResolvedValue(null),
}));

const auditFixture: AuditResponse = {
  auditId: "audit-1",
  generatedAt: new Date().toISOString(),
  metrics: {
    estimatedSavings: 0,
    annualSavings: 0,
    optimizationScore: 84,
    riskLevel: "Low",
    potentialSavingsPercent: 0,
    totalMonthlySpend: 120,
    totalSeats: 3,
  },
  recommendations: [],
  auditSummary: {
    headline: "Current AI spend configuration appears cost-efficient",
    narrative: "No material optimization opportunities were identified.",
  },
  usageInsights: {
    topTools: ["Cursor"],
    seatUtilizationPercent: 100,
    highestSpendTool: "Cursor",
    toolCategories: ["Developer"],
  },
  toolBreakdown: [
    {
      tool: "Cursor",
      plan: "Pro",
      monthlySpend: 120,
      seatCount: 3,
      recommendedAction: "Keep current plan",
      projectedSavings: 0,
      rationale: "Spend is aligned with plan pricing.",
      confidence: "High",
      ruleId: "COST_EFFICIENT",
    },
  ],
  optimizationOpportunities: [],
  governanceInsights: [],
};

describe("generateAiExecutiveSummary", () => {
  it("falls back to the deterministic summary when Gemini returns null", async () => {
    const summary = await generateAiExecutiveSummary(auditFixture, "Coding");

    expect(summary.toLowerCase()).toContain("cost-efficient");
  });
});
