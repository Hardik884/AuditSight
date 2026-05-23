import { z } from "zod";
import {
  PRIMARY_USE_CASES,
  TEAM_SIZE_LIMITS,
  AUDIT_LIMITS,
} from "@/constants/audit-config";
import { TOOL_NAMES, TOOL_PLANS } from "@/constants/pricing";

const toolSelectionSchema = z.object({
  tool: z.enum(TOOL_NAMES),
  plan: z.enum(TOOL_PLANS),
  monthlySpend: z
    .number()
    .min(AUDIT_LIMITS.minMonthlySpend)
    .max(AUDIT_LIMITS.maxMonthlySpend),
  seatCount: z.number().min(0).max(10_000),
});

export const auditRequestSchema = z.object({
  teamSize: z.number().min(TEAM_SIZE_LIMITS.min).max(TEAM_SIZE_LIMITS.max),
  primaryUseCase: z.enum(PRIMARY_USE_CASES),
  tools: z.array(toolSelectionSchema).min(1),
});

export const emailCaptureSchema = z.object({
  auditId: z.string().min(1),
  email: z.string().email(),
  capturedFrom: z.literal("report-unlock"),
});

export type AuditRequestInput = z.infer<typeof auditRequestSchema>;
export type EmailCaptureInput = z.infer<typeof emailCaptureSchema>;
