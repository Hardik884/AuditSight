import type { ToolName, ToolPlan } from "@/constants/pricing";
import { PRICING_CATALOG } from "@/constants/pricing";

export const LLM_TOOLS: ToolName[] = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Anthropic API direct",
  "OpenAI API direct",
];

export const HIGH_TIER_PLANS: Partial<Record<ToolName, ToolPlan[]>> = {
  Cursor: ["Business", "Enterprise"],
  "GitHub Copilot": ["Business", "Enterprise"],
  Claude: ["Max", "Team", "Enterprise"],
  ChatGPT: ["Team", "Enterprise"],
  Gemini: ["Ultra"],
  v0: ["Team", "Enterprise"],
};

export const getDowngradePlan = (tool: ToolName, currentPlan: ToolPlan) => {
  const plans = PRICING_CATALOG[tool].plans;
  const currentIndex = plans.indexOf(currentPlan);
  if (currentIndex <= 0) return null;
  return plans[currentIndex - 1];
};

export const GOVERNANCE_INSIGHT_TEMPLATES = [
  "Seat allocation policies missing on 2 vendor stacks",
  "Spend visibility is fragmented across multiple plans",
  "No centralized owner for model tier upgrades",
];

export const OPTIMIZATION_OPPORTUNITY_TEMPLATES = [
  "Consolidate overlapping LLM subscriptions",
  "Align seat counts to active usage",
  "Standardize enterprise plans for critical workflows",
  "Audit API spend against seat-based plans",
];
