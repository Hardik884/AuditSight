import { NextResponse } from "next/server";
import { generateAudit } from "@/lib/audit-engine";
import { saveAudit } from "@/lib/audit-storage";
import { auditRequestSchema } from "@/lib/validation/audit-schema";
import { generateAiExecutiveSummary } from "@/lib/ai-summary";
import type { ApiResponse, AuditRequest, AuditResult } from "@/types/audit";

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

    const auditData = parsed.data as unknown as AuditRequest;

    // ── Step 1: Run the deterministic audit engine ────────────────────────────
    // All financial logic lives here — Gemini never touches these calculations.
    const auditResponse = generateAudit(auditData, crypto.randomUUID());

    // ── Step 2: Generate AI executive summary ─────────────────────────────────
    // Runs in parallel with save where possible, but we await it here so it
    // persists with the audit. Failure is fully isolated — the audit always saves.
    const aiExecutiveSummary = await generateAiExecutiveSummary(
      auditResponse,
      auditData.primaryUseCase
    );

    // Attach summary to the response object before persisting
    const auditResponseWithSummary: AuditResult = {
      ...auditResponse,
      aiExecutiveSummary,
    };

    // ── Step 3: Persist to Supabase (includes AI summary) ────────────────────
    const { auditId, createdAt } = await saveAudit(auditData, auditResponseWithSummary);

    const response: ApiResponse<AuditResult> = {
      ok: true,
      data: {
        ...auditResponseWithSummary,
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
