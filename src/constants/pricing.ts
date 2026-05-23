export const PRICING_CATALOG = {
  Cursor: {
    vendor: "Cursor",
    category: "Developer",
    plans: ["Hobby", "Pro", "Business", "Enterprise"],
  },
  "GitHub Copilot": {
    vendor: "GitHub",
    category: "Developer",
    plans: ["Individual", "Business", "Enterprise"],
  },
  Claude: {
    vendor: "Anthropic",
    category: "LLM",
    plans: ["Free", "Pro", "Max", "Team", "Enterprise", "API direct"],
  },
  ChatGPT: {
    vendor: "OpenAI",
    category: "LLM",
    plans: ["Plus", "Team", "Enterprise", "API direct"],
  },
  "Anthropic API direct": {
    vendor: "Anthropic",
    category: "LLM",
    plans: ["API direct"],
  },
  "OpenAI API direct": {
    vendor: "OpenAI",
    category: "LLM",
    plans: ["API direct"],
  },
  Gemini: {
    vendor: "Google",
    category: "LLM",
    plans: ["Pro", "Ultra", "API"],
  },
  v0: {
    vendor: "Vercel",
    category: "Builder",
    plans: ["Free", "Pro", "Team", "Enterprise"],
  },
} as const;

export type ToolName = keyof typeof PRICING_CATALOG;
export type ToolPlan = (typeof PRICING_CATALOG)[ToolName]["plans"][number];
export type ToolCategory = (typeof PRICING_CATALOG)[ToolName]["category"];

export const TOOL_NAMES = Object.keys(PRICING_CATALOG) as ToolName[];
export const TOOL_PLANS = Array.from(
  new Set(TOOL_NAMES.flatMap((tool) => PRICING_CATALOG[tool].plans))
) as ToolPlan[];

export const getPlanOptions = (tool: ToolName) => PRICING_CATALOG[tool].plans;

export const getToolCategory = (tool: ToolName) => PRICING_CATALOG[tool].category;
