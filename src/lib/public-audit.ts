import type { AuditResult } from "@/types/audit";
import { formatCurrency, normalizeText, truncateText } from "@/lib/metadata";

export const buildPublicAuditSummary = (audit: AuditResult) => {
  const annualSavings = audit.metrics.annualSavings;
  const headline = `Potential AI Savings: ${formatCurrency(annualSavings)}/year`;
  const insight =
    audit.aiExecutiveSummary ||
    audit.auditSummary.narrative ||
    audit.auditSummary.headline;
  const description = truncateText(normalizeText(insight), 180);

  return {
    headline,
    description,
    annualSavings,
    optimizationScore: audit.metrics.optimizationScore,
    riskLevel: audit.metrics.riskLevel,
    executiveInsight: description,
  };
};
