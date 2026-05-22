import type { ApiResponse, EmailCaptureRequest } from "@/types/audit";

export const saveEmailCapture = async (
  payload: EmailCaptureRequest
): Promise<ApiResponse<{ saved: true }>> => {
  try {
    const response = await fetch("/api/email-capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as ApiResponse<{ saved: true }>;
    if (!response.ok) {
      return {
        ok: false,
        error: {
          message:
            result && !result.ok
              ? result.error?.message || "Request failed."
              : "Request failed.",
          details: result && !result.ok ? result.error?.details : undefined,
        },
      };
    }

    return result;
  } catch (error) {
    console.error("Email capture request failed", error);
    return {
      ok: false,
      error: { message: "Unable to save email. Please try again." },
    };
  }
};
