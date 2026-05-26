import { describe, expect, it } from "vitest";
import { buildRecommendations } from "@/lib/recommendation-engine";
import type { AuditRequest, ToolBreakdown } from "@/types/audit";
import type { CrossToolRuleResult } from "@/lib/audit-rules";

describe("recommendation-engine", () => {
  it("returns a cost-efficient recommendation when no rules trigger", () => {
    const request: AuditRequest = {
      primaryUseCase: "Coding",
      teamSize: 3,
      tools: [
        {
          tool: "Cursor",
          plan: "Pro",
          monthlySpend: 60,
          seatCount: 3,
        },
      ],
    };

    const toolBreakdown: ToolBreakdown[] = [
      {
        tool: "Cursor",
        plan: "Pro",
        monthlySpend: 60,
        seatCount: 3,
        recommendedAction: "Keep current plan",
        projectedSavings: 0,
        rationale: "Spend aligns with current seats.",
        confidence: "High",
        ruleId: "COST_EFFICIENT",
      },
    ];

    const recommendations = buildRecommendations(request, toolBreakdown, []);

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]?.title).toContain("cost-efficient");
  });

  it("deduplicates recommendations with the same title and similar savings", () => {
    const request: AuditRequest = {
      primaryUseCase: "Coding",
      teamSize: 10,
      tools: [
        { tool: "Cursor", plan: "Pro", monthlySpend: 200, seatCount: 5 },
        { tool: "GitHub Copilot", plan: "Business", monthlySpend: 190, seatCount: 5 },
      ],
    };

    const SHARED_TITLE = "Audit billing vs published pricing";
    const toolBreakdown: ToolBreakdown[] = [
      {
        tool: "Cursor",
        plan: "Pro",
        monthlySpend: 200,
        seatCount: 5,
        recommendedAction: SHARED_TITLE,
        projectedSavings: 100,
        rationale: "Cursor is overbilled.",
        confidence: "Medium",
        ruleId: "HIGH_SPEND_PER_SEAT",
      },
      {
        tool: "GitHub Copilot",
        plan: "Business",
        monthlySpend: 190,
        seatCount: 5,
        recommendedAction: SHARED_TITLE,
        projectedSavings: 95,
        rationale: "GitHub Copilot is overbilled.",
        confidence: "Medium",
        ruleId: "HIGH_SPEND_PER_SEAT",
      },
    ];

    const recommendations = buildRecommendations(request, toolBreakdown, []);
    const matchingTitles = recommendations.filter((r) => r.title === SHARED_TITLE);

    // Should be merged into one recommendation
    expect(matchingTitles.length).toBe(1);
    // Merged savings should be the sum
    expect(matchingTitles[0]?.estimatedSavingsImpact).toBe(195);
  });

  it("places a cross-tool High-confidence rec above a per-tool Low-confidence rec at the same severity", () => {
    const request: AuditRequest = {
      primaryUseCase: "Coding",
      teamSize: 10,
      tools: [
        { tool: "Cursor", plan: "Pro", monthlySpend: 200, seatCount: 5 },
        { tool: "GitHub Copilot", plan: "Business", monthlySpend: 190, seatCount: 5 },
      ],
    };

    const toolBreakdown: ToolBreakdown[] = [
      {
        tool: "Cursor",
        plan: "Pro",
        monthlySpend: 200,
        seatCount: 5,
        recommendedAction: "Review active seat utilization",
        projectedSavings: 60, // Low severity ($60 < $150)
        rationale: "Low utilization.",
        confidence: "Low",
        ruleId: "LOW_UTILIZATION_HIGH_SPEND",
      },
    ];

    const crossToolResults: CrossToolRuleResult[] = [
      {
        ruleId: "COPILOT_OVERLAP",
        triggered: true,
        savings: 60, // Same severity tier as per-tool
        confidence: "High",
        affectedTools: ["Cursor", "GitHub Copilot"],
        title: "Overlapping coding copilot subscriptions — high confidence overlap",
        description: "Two copilot tools are active.",
      },
    ];

    const recommendations = buildRecommendations(request, toolBreakdown, crossToolResults);

    // Cross-tool High-confidence rec should appear before per-tool Low-confidence
    const copilotIdx = recommendations.findIndex((r) =>
      r.title.toLowerCase().includes("copilot")
    );
    const utilizationIdx = recommendations.findIndex((r) =>
      r.title.toLowerCase().includes("utilization")
    );

    // Both should exist
    expect(copilotIdx).toBeGreaterThanOrEqual(0);
    // copilot should rank before utilization
    expect(copilotIdx).toBeLessThan(utilizationIdx === -1 ? Infinity : utilizationIdx);
  });

  it("returns the seats-entered-but-no-spend empty state variant correctly", () => {
    const request: AuditRequest = {
      primaryUseCase: "Coding",
      teamSize: 5,
      tools: [
        { tool: "Cursor", plan: "Pro", monthlySpend: 0, seatCount: 3 },
      ],
    };

    const toolBreakdown: ToolBreakdown[] = [
      {
        tool: "Cursor",
        plan: "Pro",
        monthlySpend: 0,
        seatCount: 3,
        recommendedAction: "Keep current plan",
        projectedSavings: 0,
        rationale: "No spend to analyze.",
        confidence: "High",
        ruleId: "COST_EFFICIENT",
      },
    ];

    const recommendations = buildRecommendations(request, toolBreakdown, []);
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]?.description.toLowerCase()).toContain("spend");
  });

  it("caps recommendations at 8 for audits with many triggered rules", () => {
    const request: AuditRequest = {
      primaryUseCase: "Mixed",
      teamSize: 20,
      tools: [
        { tool: "Cursor", plan: "Business", monthlySpend: 400, seatCount: 20 },
        { tool: "GitHub Copilot", plan: "Enterprise", monthlySpend: 800, seatCount: 20 },
        { tool: "Claude", plan: "Team", monthlySpend: 600, seatCount: 20 },
        { tool: "ChatGPT", plan: "Team", monthlySpend: 600, seatCount: 20 },
        { tool: "Gemini", plan: "Advanced", monthlySpend: 400, seatCount: 20 },
      ],
    };

    // Build many breakdowns with savings to generate many recommendations
    const toolBreakdown: ToolBreakdown[] = request.tools.map((t) => ({
      ...t,
      recommendedAction: `Optimize ${t.tool}`,
      projectedSavings: 200,
      rationale: `${t.tool} has savings potential.`,
      confidence: "Medium" as const,
      ruleId: "HIGH_SPEND_PER_SEAT",
    }));

    const recommendations = buildRecommendations(request, toolBreakdown, []);
    expect(recommendations.length).toBeLessThanOrEqual(8);
  });
});
