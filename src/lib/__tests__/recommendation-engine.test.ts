import { describe, expect, it } from "vitest";
import { buildRecommendations } from "@/lib/recommendation-engine";
import type { AuditRequest, ToolBreakdown } from "@/types/audit";

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
});
