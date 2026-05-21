import { NextResponse } from "next/server";
import { generateAudit } from "@/lib/audit-engine";
import { auditRequestSchema } from "@/lib/validation/audit-schema";
import type { ApiResponse, AuditResponse } from "@/types/audit";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = auditRequestSchema.safeParse(payload);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message);
      const response: ApiResponse<AuditResponse> = {
        ok: false,
        error: {
          message: "Invalid audit request.",
          details: errors,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    const auditResponse = generateAudit(parsed.data, crypto.randomUUID());
    const response: ApiResponse<AuditResponse> = {
      ok: true,
      data: auditResponse,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Audit API error", error);
    const response: ApiResponse<AuditResponse> = {
      ok: false,
      error: { message: "Internal server error." },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
