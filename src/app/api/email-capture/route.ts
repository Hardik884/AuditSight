import { NextResponse } from "next/server";
import { getAuditById, saveEmailCapture } from "@/lib/audit-storage";
import { emailCaptureSchema } from "@/lib/validation/audit-schema";
import { sendAuditEmail } from "@/lib/email/send-audit-email";
import { isHoneypotTripped, logHoneypotTrip } from "@/lib/security/honeypot";
import type { ApiResponse } from "@/types/audit";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (isHoneypotTripped(payload?.homepage)) {
      logHoneypotTrip("/api/email-capture");
      const response: ApiResponse<{ saved: true }> = {
        ok: true,
        data: { saved: true },
      };
      return NextResponse.json(response, { status: 200 });
    }

    const parsed = emailCaptureSchema.safeParse(payload);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message);
      const response: ApiResponse<{ saved: true }> = {
        ok: false,
        error: {
          message: "Invalid email capture request.",
          details: errors,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }

    await saveEmailCapture(parsed.data);

    // Fire-and-forget transactional email send. Never block the unlock flow.
    void (async () => {
      try {
        const audit = await getAuditById(parsed.data.auditId);
        if (!audit) {
          console.warn("[AuditSight/email] Audit not found for email capture", {
            auditId: parsed.data.auditId,
          });
          return;
        }

        const result = await sendAuditEmail({
          audit,
          recipientEmail: parsed.data.email,
          companyName: parsed.data.companyName,
          role: parsed.data.role,
          teamSize: parsed.data.teamSize,
        });

        if (!result.ok) {
          console.warn("[AuditSight/email] Send failed", {
            auditId: parsed.data.auditId,
            message: result.error,
          });
        }
      } catch (error) {
        console.error("[AuditSight/email] Unexpected send error", error);
      }
    })();

    const response: ApiResponse<{ saved: true }> = {
      ok: true,
      data: { saved: true },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Email capture API error", error);
    const response: ApiResponse<{ saved: true }> = {
      ok: false,
      error: { message: "Internal server error." },
    };
    return NextResponse.json(response, { status: 500 });
  }
}
