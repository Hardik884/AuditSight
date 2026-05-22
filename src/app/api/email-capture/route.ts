import { NextResponse } from "next/server";
import { saveEmailCapture } from "@/lib/audit-storage";
import { emailCaptureSchema } from "@/lib/validation/audit-schema";
import type { ApiResponse } from "@/types/audit";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
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
