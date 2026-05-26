import { describe, expect, it } from "vitest";
import { generateAudit } from "@/lib/audit-engine";
import type { AuditRequest } from "@/types/audit";

const baseRequest: AuditRequest = {
  primaryUseCase: "Coding",
  teamSize: 5,
  tools: [
    {
      tool: "Cursor",
      plan: "Pro",
      monthlySpend: 100,
      seatCount: 5,
    },
  ],
};

describe("generateAudit", () => {
  it("returns a cost-efficient summary when savings are below the threshold", () => {
    const result = generateAudit(baseRequest, "audit-test-id");

    expect(result.metrics.estimatedSavings).toBe(0);
    expect(result.auditSummary.headline.toLowerCase()).toContain("cost-efficient");
  });

  it("returns zero risk and base optimization score when there is no spend or seat data", () => {
    const zeroRequest: AuditRequest = {
      primaryUseCase: "Coding",
      teamSize: 10,
      tools: [{ tool: "Cursor", plan: "Pro", monthlySpend: 0, seatCount: 0 }],
    };
    const result = generateAudit(zeroRequest, "audit-zero-id");

    expect(result.metrics.estimatedSavings).toBe(0);
    // Zero spend → no risk signal
    expect(result.metrics.riskLevel).toBe("Low");
    // Zero spend + zero seats → base score (no penalty for missing data)
    expect(result.metrics.optimizationScore).toBeGreaterThanOrEqual(88);
  });

  it("detects copilot overlap when two coding copilot tools are active", () => {
    const overlapRequest: AuditRequest = {
      primaryUseCase: "Coding",
      teamSize: 10,
      tools: [
        { tool: "Cursor", plan: "Pro", monthlySpend: 200, seatCount: 10 },
        { tool: "GitHub Copilot", plan: "Business", monthlySpend: 190, seatCount: 10 },
      ],
    };
    const result = generateAudit(overlapRequest, "audit-overlap-id");

    expect(result.metrics.estimatedSavings).toBeGreaterThan(0);
    const overlapRec = result.recommendations.find((r) =>
      r.title.toLowerCase().includes("copilot")
    );
    expect(overlapRec).toBeDefined();
    expect(overlapRec?.confidence).toBe("High");
    // Overlap recommendation should appear first or near first
    expect(result.recommendations.indexOf(overlapRec!)).toBeLessThan(3);
  });

  it("fires ENTERPRISE_TINY_TEAM for a Business plan with very few seats on a small team", () => {
    const enterpriseRequest: AuditRequest = {
      primaryUseCase: "Coding",
      teamSize: 10,
      // 3 seats: savings = $20/seat (Business→Pro) × 3 = $60, above the $50/mo SAVINGS_FLOOR
      tools: [
        { tool: "Cursor", plan: "Business", monthlySpend: 120, seatCount: 3 },
      ],
    };
    const result = generateAudit(enterpriseRequest, "audit-enterprise-id");

    const rec = result.recommendations.find((r) =>
      r.title.toLowerCase().includes("downgrade") || r.title.toLowerCase().includes("pro")
    );
    expect(rec).toBeDefined();
    expect(result.metrics.estimatedSavings).toBeGreaterThan(0);
  });

  it("returns a narrative that mentions the correct cause phrase for copilot overlap", () => {
    const overlapRequest: AuditRequest = {
      primaryUseCase: "Coding",
      teamSize: 20,
      // Secondary copilot spend = $380; 50% = $190 → above the $100 EXECUTIVE_SAVINGS_FLOOR
      tools: [
        { tool: "Cursor", plan: "Pro", monthlySpend: 400, seatCount: 20 },
        { tool: "GitHub Copilot", plan: "Business", monthlySpend: 380, seatCount: 20 },
      ],
    };
    const result = generateAudit(overlapRequest, "audit-narrative-id");

    expect(result.auditSummary.narrative.toLowerCase()).toContain("overlap");
  });
});
