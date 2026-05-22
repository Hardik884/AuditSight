import { NextResponse } from "next/server";
import { generateAudit } from "@/lib/audit-engine";
import { saveAudit } from "@/lib/audit-storage";
import { auditRequestSchema } from "@/lib/validation/audit-schema";
import type { ApiResponse, AuditResult } from "@/types/audit";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = auditRequestSchema.safeParse(payload);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message);
      const response: ApiResponse<AuditResult> = {
        ok: false,
        error: {
          message: "Invalid audit request.",
          details: errors,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const auditResponse = generateAudit(parsed.data, crypto.randomUUID());
    const { auditId, createdAt } = await saveAudit(parsed.data, auditResponse);
    const response: ApiResponse<AuditResult> = {
      ok: true,
      data: {
        ...auditResponse,
        auditId,
        generatedAt: createdAt,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Audit API error", error);
    const response: ApiResponse<AuditResult> = {
      ok: false,
      error: { message: "Internal server error." },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
