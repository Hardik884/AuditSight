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
});
