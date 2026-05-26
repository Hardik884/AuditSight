import type { AuditResult } from "@/types/audit";
import { getSiteUrl } from "@/lib/metadata";
import { buildAuditEmailTemplate } from "@/lib/email/templates/audit-email";
import { createResendClient } from "@/lib/email/resend-client";

export type SendAuditEmailInput = {
  audit: AuditResult;
  recipientEmail: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
};

export type SendAuditEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const LOW_SAVINGS_THRESHOLD = 100;
const HIGH_SAVINGS_THRESHOLD = 500;

export const sendAuditEmail = async (
  input: SendAuditEmailInput
): Promise<SendAuditEmailResult> => {
  const resend = createResendClient();
  const fromEmail = process.env.FROM_EMAIL;

  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY is not configured." };
  }

  if (!fromEmail) {
    return { ok: false, error: "FROM_EMAIL is not configured." };
  }

  const reportUrl = `${getSiteUrl()}/audit/${input.audit.auditId}`;
  const executiveSummary =
    input.audit.aiExecutiveSummary ||
    input.audit.auditSummary?.narrative ||
    input.audit.auditSummary?.headline ||
    "Your AuditSight executive report is ready.";

  const estimatedSavings = input.audit.metrics.estimatedSavings ?? 0;
  const annualSavings = input.audit.metrics.annualSavings ?? 0;
  const optimizationScore = input.audit.metrics.optimizationScore ?? 0;
  const riskLevel = input.audit.metrics.riskLevel ?? "Low";

  const showConsultationCta = estimatedSavings > HIGH_SAVINGS_THRESHOLD;
  const lowSavings = estimatedSavings <= LOW_SAVINGS_THRESHOLD;

  const { subject, html, text } = buildAuditEmailTemplate({
    recipientEmail: input.recipientEmail,
    reportUrl,
    executiveSummary,
    auditHeadline: input.audit.auditSummary?.headline || "Audit complete",
    estimatedSavings,
    annualSavings,
    optimizationScore,
    riskLevel,
    highestSpendTool: input.audit.usageInsights?.highestSpendTool,
    showConsultationCta,
    lowSavings,
    companyName: input.companyName,
    role: input.role,
    teamSize: input.teamSize,
  });

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: input.recipientEmail,
      subject,
      html,
      text,
      headers: {
        "X-Entity-Ref-ID": input.audit.auditId,
      },
      tags: [
        { name: "product", value: "AuditSight" },
        { name: "type", value: "audit-report" },
      ],
      replyTo: fromEmail,
    });

    if (response.error) {
      return { ok: false, error: response.error.message };
    }

    return { ok: true, id: response.data?.id ?? "unknown" };
  } catch (error) {
    console.error("[AuditSight/email] Unexpected send error", error);
    return { ok: false, error: "Unexpected email send failure." };
  }
};
