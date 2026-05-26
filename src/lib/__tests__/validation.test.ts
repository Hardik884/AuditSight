import { describe, expect, it } from "vitest";
import { auditRequestSchema } from "@/lib/validation/audit-schema";

describe("auditRequestSchema", () => {
  it("rejects payloads with no tool entries", () => {
    const result = auditRequestSchema.safeParse({
      primaryUseCase: "Coding",
      teamSize: 10,
      tools: [],
    });

    expect(result.success).toBe(false);
  });
});
