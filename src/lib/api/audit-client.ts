import type { ApiResponse, AuditRequest, AuditResponse } from "@/types/audit";

export const requestAudit = async (
  payload: AuditRequest
): Promise<ApiResponse<AuditResponse>> => {
  try {
    const response = await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as ApiResponse<AuditResponse>;
    if (!response.ok) {
      return {
        ok: false,
        error: {
          message: result && !result.ok ? result.error?.message || "Request failed." : "Request failed.",
          details: result && !result.ok ? result.error?.details : undefined,
        },
      };
    }

    return result;
  } catch (error) {
    console.error("Audit request failed", error);
    return {
      ok: false,
      error: { message: "Unable to generate audit. Please try again." },
    };
  }
};
