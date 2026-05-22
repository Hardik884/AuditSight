import { z } from "zod";
import {
  AUDIT_GOALS,
  AUDIT_LIMITS,
  CHALLENGES,
  PRIMARY_USE_CASES,
  TEAM_SIZES,
  TOOL_NAMES,
} from "@/constants/audit-config";

export const auditRequestSchema = z.object({
  teamSize: z.enum(TEAM_SIZES),
  selectedTools: z.array(z.enum(TOOL_NAMES)).min(1),
  monthlySpend: z
    .number()
    .positive()
    .min(AUDIT_LIMITS.minMonthlySpend)
    .max(AUDIT_LIMITS.maxMonthlySpend),
  biggestChallenge: z.enum(CHALLENGES),
  auditGoals: z.array(z.enum(AUDIT_GOALS)).min(1),
  primaryUseCase: z.enum(PRIMARY_USE_CASES),
});

export type AuditRequestInput = z.infer<typeof auditRequestSchema>;
