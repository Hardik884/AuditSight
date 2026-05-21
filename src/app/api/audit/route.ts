import { NextResponse } from "next/server";
import { generateAudit } from "@/lib/audit-engine";
import type {
  AuditRequest,
  AuditResponse,
  AuditGoal,
  Challenge,
  ToolName,
  TeamSize,
} from "@/types/audit";

const teamSizes: TeamSize[] = ["1-25", "26-100", "101-500", "500+"];
const toolNames: ToolName[] = [
  "ChatGPT",
  "Claude",
  "Cursor",
  "GitHub Copilot",
  "Gemini",
  "Perplexity",
];
const challenges: Challenge[] = [
  "Unclear ROI",
  "Overlapping subscriptions",
  "Spend volatility",
  "Model quality drift",
];
const auditGoals: AuditGoal[] = [
  "Reduce monthly spend",
  "Improve usage governance",
  "Consolidate vendors",
  "Optimize model routing",
];

const isTool = (value: string): value is ToolName =>
  toolNames.includes(value as ToolName);
const isGoal = (value: string): value is AuditGoal =>
  auditGoals.includes(value as AuditGoal);

const validateRequest = (payload: Partial<AuditRequest>) => {
  const errors: string[] = [];

  if (!payload.teamSize || !teamSizes.includes(payload.teamSize)) {
    errors.push("Invalid or missing team size.");
  }

  if (!payload.selectedTools || payload.selectedTools.length === 0) {
    errors.push("At least one AI tool is required.");
  } else if (!payload.selectedTools.every((tool) => isTool(tool))) {
    errors.push("Unsupported AI tool detected.");
  }

  if (typeof payload.monthlySpend !== "number" || payload.monthlySpend <= 0) {
    errors.push("Monthly spend must be a positive number.");
  }

  if (payload.monthlySpend && payload.monthlySpend > 10000000) {
    errors.push("Monthly spend exceeds allowed range.");
  }

  if (!payload.biggestChallenge || !challenges.includes(payload.biggestChallenge)) {
    errors.push("Invalid or missing challenge selection.");
  }

  if (!payload.auditGoals || payload.auditGoals.length === 0) {
    errors.push("At least one audit goal is required.");
  } else if (!payload.auditGoals.every((goal) => isGoal(goal))) {
    errors.push("Unsupported audit goal detected.");
  }

  return errors;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<AuditRequest>;
    const errors = validateRequest(payload);

    if (errors.length > 0) {
      return NextResponse.json(
        { ok: false, errors },
        { status: 400 }
      );
    }

    const auditRequest = payload as AuditRequest;
    const auditResponse: AuditResponse = generateAudit(
      auditRequest,
      crypto.randomUUID()
    );

    return NextResponse.json(
      {
        ok: true,
        data: auditResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Audit API error", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
