import { formatCurrency, truncateText } from "@/lib/metadata";

export type AuditEmailTemplateInput = {
  recipientEmail: string;
  reportUrl: string;
  executiveSummary: string;
  auditHeadline: string;
  estimatedSavings: number;
  annualSavings: number;
  optimizationScore: number;
  riskLevel: string;
  highestSpendTool?: string | null;
  showConsultationCta: boolean;
  lowSavings: boolean;
  companyName?: string;
  role?: string;
  teamSize?: number;
};

export type AuditEmailTemplate = {
  subject: string;
  previewText: string;
  html: string;
  text: string;
};

const safe = (value?: string | null) => (value ? value : "");

export const buildAuditEmailTemplate = (
  input: AuditEmailTemplateInput
): AuditEmailTemplate => {
  const monthlySavings = formatCurrency(input.estimatedSavings);
  const annualSavings = formatCurrency(input.annualSavings);
  const summary = truncateText(input.executiveSummary, 480);
  const previewText = input.lowSavings
    ? "Your AuditSight report is ready. Your AI stack already looks optimized."
    : `Your AuditSight report is ready. Projected savings: ${monthlySavings}/mo.`;
  const subject = "Your AuditSight report is ready";

  const recipientLine = [input.companyName, input.role]
    .filter(Boolean)
    .join(" · ");

  const highSavingsNote = input.showConsultationCta
    ? "High savings detected. A Credex consultation can unlock additional optimization opportunities."
    : "";

  const lowSavingsNote = input.lowSavings
    ? "Your current AI stack already appears relatively optimized based on the data provided."
    : "";

  const teamSizeLine = input.teamSize ? `Team size: ${input.teamSize}` : "";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;background:#f6f7fb;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:92%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8ebf2;">
            <tr>
              <td style="padding:28px 32px 16px 32px;background:linear-gradient(135deg,#0f172a,#111827);color:#ffffff;">
                <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#94a3b8;">AuditSight</div>
                <h1 style="margin:12px 0 4px 0;font-size:22px;font-weight:700;">Audit confirmation</h1>
                <p style="margin:0;color:#cbd5f5;font-size:14px;">Your executive audit report is ready to review.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px 32px;">
                <p style="margin:0 0 12px 0;font-size:14px;color:#0f172a;">
                  ${input.auditHeadline}
                </p>
                ${recipientLine || teamSizeLine ? `<p style="margin:0 0 16px 0;font-size:12px;color:#64748b;">${safe(recipientLine)}${recipientLine && teamSizeLine ? " | " : ""}${safe(teamSizeLine)}</p>` : ""}
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:16px 0 0 0;">
                  <tr>
                    <td style="padding:12px;border:1px solid #e8ebf2;border-radius:12px;background:#f8fafc;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Projected savings</td>
                          <td style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Optimization score</td>
                          <td style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Risk level</td>
                        </tr>
                        <tr>
                          <td style="font-size:18px;font-weight:700;color:#0f172a;padding-top:6px;">${monthlySavings}/mo</td>
                          <td style="font-size:18px;font-weight:700;color:#0f172a;padding-top:6px;">${input.optimizationScore}/100</td>
                          <td style="font-size:18px;font-weight:700;color:#0f172a;padding-top:6px;">${input.riskLevel}</td>
                        </tr>
                        <tr>
                          <td colspan="3" style="font-size:12px;color:#94a3b8;padding-top:6px;">Annualized impact: ${annualSavings}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:16px;padding:16px;border-radius:12px;border:1px solid #e8ebf2;background:#ffffff;">
                  <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;">Executive summary</div>
                  <p style="margin:10px 0 0 0;font-size:14px;line-height:1.5;color:#0f172a;">${summary}</p>
                </div>
                ${lowSavingsNote ? `<p style="margin:16px 0 0 0;font-size:13px;color:#475569;">${lowSavingsNote}</p>` : ""}
                ${highSavingsNote ? `<div style="margin:18px 0 0 0;padding:14px;border-radius:12px;background:#ecfdf3;border:1px solid #bbf7d0;">
                  <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#047857;font-weight:700;">Credex consultation</div>
                  <p style="margin:8px 0 0 0;font-size:13px;color:#065f46;">${highSavingsNote}</p>
                  <a href="https://credex.rocks" style="display:inline-block;margin-top:12px;padding:10px 16px;border-radius:999px;background:#047857;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;">Book a Credex review</a>
                </div>` : ""}
                <div style="margin-top:20px;">
                  <a href="${input.reportUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">View full report</a>
                </div>
                <p style="margin:16px 0 0 0;font-size:12px;color:#94a3b8;">Shareable report link: <a href="${input.reportUrl}" style="color:#2563eb;text-decoration:none;">${input.reportUrl}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 28px 32px;font-size:11px;color:#94a3b8;">
                AuditSight delivers deterministic, finance-grade AI spend audits. If you have any questions, reply to this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "AuditSight report ready",
    input.auditHeadline,
    recipientLine ? `Profile: ${recipientLine}` : "",
    teamSizeLine ? teamSizeLine : "",
    `Projected savings: ${monthlySavings}/mo (${annualSavings}/yr)`,
    `Optimization score: ${input.optimizationScore}/100`,
    `Risk level: ${input.riskLevel}`,
    "",
    "Executive summary:",
    summary,
    "",
    lowSavingsNote,
    highSavingsNote,
    "",
    `View full report: ${input.reportUrl}`,
    "",
    "AuditSight"
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    previewText,
    html,
    text,
  };
};
