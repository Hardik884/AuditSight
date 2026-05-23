/**
 * AuditSight — Pricing Intelligence Registry
 *
 * All prices reflect published vendor pricing (USD/month).
 * Sources: cursor.com/pricing, github.com/features/copilot,
 * anthropic.com/claude, openai.com/chatgpt, codeium.com/windsurf
 *
 * This registry is the single source of truth for defensible
 * pricing logic across the audit engine.
 */

export interface PlanDetail {
  /** Published monthly price per seat (0 = free tier) */
  monthlyPricePerSeat: number;
  /** Minimum team size this plan is sensible for */
  minTeamSize: number;
  /** Maximum team size before the next tier becomes more appropriate */
  maxTeamSize: number;
  /** Human-readable target user profile */
  targetProfile: string;
  /** Primary use cases this plan covers well */
  useCases: readonly string[];
  /**
   * Seat count above which the enterprise tier's per-seat economics
   * typically become competitive (0 = not applicable)
   */
  enterpriseThreshold: number;
  /**
   * True if a direct API integration is a viable cheaper alternative
   * for automation-heavy or high-volume workloads
   */
  apiSuitable: boolean;
  /** Procurement / compliance notes visible in the audit report */
  notes: string;
}

export interface ToolRegistry {
  vendor: string;
  category: ToolCategory;
  plans: Readonly<Record<string, PlanDetail>>;
  /** Ordered plan names from lowest to highest tier */
  planOrder: readonly string[];
}

export type ToolCategory =
  | "Developer"
  | "LLM"
  | "Builder"
  | "API";

export const PRICING_REGISTRY = {
  Cursor: {
    vendor: "Cursor",
    category: "Developer",
    planOrder: ["Hobby", "Pro", "Business"] as const,
    plans: {
      Hobby: {
        monthlyPricePerSeat: 0,
        minTeamSize: 1,
        maxTeamSize: 1,
        targetProfile: "Solo developer evaluating AI-assisted coding",
        useCases: ["Code completion", "Basic chat", "Tab autocomplete"],
        enterpriseThreshold: 0,
        apiSuitable: false,
        notes: "Free tier has limited fast requests. Not suitable for production team workflows.",
      },
      Pro: {
        monthlyPricePerSeat: 20,
        minTeamSize: 1,
        maxTeamSize: 10,
        targetProfile: "Individual developer or small team needing reliable AI code assistance",
        useCases: ["Code completion", "Codebase chat", "Composer", "Unlimited fast requests"],
        enterpriseThreshold: 0,
        apiSuitable: false,
        notes: "Best value for solo or small team usage. Business plan adds admin controls.",
      },
      Business: {
        monthlyPricePerSeat: 40,
        minTeamSize: 4,
        maxTeamSize: 500,
        targetProfile: "Engineering teams requiring centralized billing and privacy controls",
        useCases: ["All Pro features", "SSO", "Centralized billing", "Usage analytics", "Privacy mode"],
        enterpriseThreshold: 100,
        apiSuitable: false,
        notes: "Enterprise admin controls justify cost for teams ≥ 4. Small teams may overpay for unused governance features.",
      },
    },
  },

  "GitHub Copilot": {
    vendor: "GitHub",
    category: "Developer",
    planOrder: ["Individual", "Business", "Enterprise"] as const,
    plans: {
      Individual: {
        monthlyPricePerSeat: 10,
        minTeamSize: 1,
        maxTeamSize: 3,
        targetProfile: "Solo developer or very small team",
        useCases: ["Code completion", "Chat in IDE", "CLI assistance"],
        enterpriseThreshold: 0,
        apiSuitable: false,
        notes: "Most cost-effective for individuals. No org-level controls.",
      },
      Business: {
        monthlyPricePerSeat: 19,
        minTeamSize: 2,
        maxTeamSize: 299,
        targetProfile: "Engineering teams needing organization-level policy control",
        useCases: ["Code completion", "Chat", "Pull request summaries", "Policy management", "Audit logs"],
        enterpriseThreshold: 50,
        apiSuitable: false,
        notes: "Adds org-level seat management and security policies. Suitable for most mid-size teams.",
      },
      Enterprise: {
        monthlyPricePerSeat: 39,
        minTeamSize: 50,
        maxTeamSize: 50000,
        targetProfile: "Large engineering organizations with compliance and customization requirements",
        useCases: ["All Business features", "Custom models", "Fine-tuning", "Enterprise security", "Dedicated support"],
        enterpriseThreshold: 0,
        apiSuitable: false,
        notes: "Enterprise tier adds custom models and compliance features. Overkill for teams under 50 seats.",
      },
    },
  },

  Claude: {
    vendor: "Anthropic",
    category: "LLM",
    planOrder: ["Free", "Pro", "Max", "Team", "Enterprise"] as const,
    plans: {
      Free: {
        monthlyPricePerSeat: 0,
        minTeamSize: 1,
        maxTeamSize: 1,
        targetProfile: "Individual user with light usage needs",
        useCases: ["Casual Q&A", "Basic writing assistance"],
        enterpriseThreshold: 0,
        apiSuitable: false,
        notes: "Rate-limited. Not suitable for consistent professional workflows.",
      },
      Pro: {
        monthlyPricePerSeat: 20,
        minTeamSize: 1,
        maxTeamSize: 4,
        targetProfile: "Individual professional requiring reliable access to Claude",
        useCases: ["Extended context", "Priority access", "Research", "Writing", "Analysis"],
        enterpriseThreshold: 0,
        apiSuitable: true,
        notes: "Best for individuals. Teams of 5+ should evaluate Team plan economics.",
      },
      Max: {
        monthlyPricePerSeat: 100,
        minTeamSize: 1,
        maxTeamSize: 3,
        targetProfile: "Power user with very high-volume or computationally intensive use",
        useCases: ["Very high usage limits", "Priority access", "Extended context"],
        enterpriseThreshold: 0,
        apiSuitable: true,
        notes: "5× the usage of Pro. Justify only for demonstrably high-volume individual users. API may be cheaper for automation.",
      },
      Team: {
        monthlyPricePerSeat: 30,
        minTeamSize: 3,
        maxTeamSize: 149,
        targetProfile: "Small to mid-size teams needing shared billing and collaboration",
        useCases: ["Shared workspace", "Centralized billing", "Higher usage limits", "Admin console"],
        enterpriseThreshold: 50,
        apiSuitable: true,
        notes: "Minimum 5-seat commitment. Solo or 2-person teams are better served by individual Pro plans.",
      },
      Enterprise: {
        monthlyPricePerSeat: 0, // custom pricing
        minTeamSize: 50,
        maxTeamSize: 50000,
        targetProfile: "Large organizations with security, compliance, and audit requirements",
        useCases: ["SSO/SAML", "Expanded context windows", "Custom retention", "Priority support", "Audit logs"],
        enterpriseThreshold: 0,
        apiSuitable: false,
        notes: "Custom pricing. Requires direct Anthropic contract. Typically negotiated for 50+ seats.",
      },
    },
  },

  ChatGPT: {
    vendor: "OpenAI",
    category: "LLM",
    planOrder: ["Plus", "Team", "Enterprise"] as const,
    plans: {
      Plus: {
        monthlyPricePerSeat: 20,
        minTeamSize: 1,
        maxTeamSize: 4,
        targetProfile: "Individual professional needing GPT-4 access",
        useCases: ["GPT-4o access", "Image generation", "Data analysis", "Plugins/GPTs"],
        enterpriseThreshold: 0,
        apiSuitable: true,
        notes: "Most cost-effective for individuals. Team plan requires 2-seat minimum.",
      },
      Team: {
        monthlyPricePerSeat: 30,
        minTeamSize: 2,
        maxTeamSize: 149,
        targetProfile: "Small to mid-size teams needing shared workspace and admin controls",
        useCases: ["All Plus features", "Shared workspace", "Admin console", "Higher limits", "No training on data"],
        enterpriseThreshold: 50,
        apiSuitable: true,
        notes: "2-seat minimum. Per-seat cost exceeds Plus — only justified by shared workspace or data privacy requirements.",
      },
      Enterprise: {
        monthlyPricePerSeat: 0, // custom pricing
        minTeamSize: 50,
        maxTeamSize: 50000,
        targetProfile: "Enterprise organizations with compliance and dedicated capacity needs",
        useCases: ["Unlimited GPT-4", "SSO", "Advanced security", "Custom data retention", "Dedicated capacity"],
        enterpriseThreshold: 0,
        apiSuitable: false,
        notes: "Custom pricing. Suitable for organizations with strict data governance or dedicated capacity requirements.",
      },
    },
  },

  "Anthropic API": {
    vendor: "Anthropic",
    category: "API",
    planOrder: ["Pay-as-you-go"] as const,
    plans: {
      "Pay-as-you-go": {
        monthlyPricePerSeat: 0, // usage-based, not per-seat
        minTeamSize: 1,
        maxTeamSize: 50000,
        targetProfile: "Engineering teams integrating Claude into applications or automations",
        useCases: ["Application integration", "Automated pipelines", "Custom AI features", "High-volume processing"],
        enterpriseThreshold: 0,
        apiSuitable: true,
        notes: "Pay-per-token. Cost-effective for automation workloads. May exceed seat-based plans at very high conversational usage.",
      },
    },
  },

  "OpenAI API": {
    vendor: "OpenAI",
    category: "API",
    planOrder: ["Pay-as-you-go"] as const,
    plans: {
      "Pay-as-you-go": {
        monthlyPricePerSeat: 0, // usage-based, not per-seat
        minTeamSize: 1,
        maxTeamSize: 50000,
        targetProfile: "Engineering teams integrating GPT models into applications or automations",
        useCases: ["Application integration", "Automated pipelines", "Embeddings", "Fine-tuning", "Custom AI features"],
        enterpriseThreshold: 0,
        apiSuitable: true,
        notes: "Pay-per-token. Cost-effective for automation workloads at moderate volume. Monitor for token cost growth.",
      },
    },
  },

  Gemini: {
    vendor: "Google",
    category: "LLM",
    planOrder: ["Free", "Advanced", "API"] as const,
    plans: {
      Free: {
        monthlyPricePerSeat: 0,
        minTeamSize: 1,
        maxTeamSize: 1,
        targetProfile: "Individual with light AI assistant needs",
        useCases: ["Basic Q&A", "Simple writing tasks"],
        enterpriseThreshold: 0,
        apiSuitable: false,
        notes: "Rate-limited access to Gemini 1.5 Pro. Not suitable for professional workflows.",
      },
      Advanced: {
        monthlyPricePerSeat: 19.99,
        minTeamSize: 1,
        maxTeamSize: 10,
        targetProfile: "Individual or small team needing Gemini Ultra access and Google Workspace integration",
        useCases: ["Gemini Ultra access", "Google Workspace integration", "Extended context", "Research"],
        enterpriseThreshold: 0,
        apiSuitable: true,
        notes: "Bundles with Google One. Best value if already using Google Workspace. Overlaps with Claude/ChatGPT for general use.",
      },
      API: {
        monthlyPricePerSeat: 0, // usage-based
        minTeamSize: 1,
        maxTeamSize: 50000,
        targetProfile: "Engineering teams integrating Gemini into applications",
        useCases: ["Application integration", "Multimodal processing", "Long context", "Automated pipelines"],
        enterpriseThreshold: 0,
        apiSuitable: true,
        notes: "Pay-per-token via Google AI Studio or Vertex AI. Free tier available for development.",
      },
    },
  },

  Windsurf: {
    vendor: "Codeium",
    category: "Developer",
    planOrder: ["Free", "Pro", "Teams"] as const,
    plans: {
      Free: {
        monthlyPricePerSeat: 0,
        minTeamSize: 1,
        maxTeamSize: 1,
        targetProfile: "Solo developer evaluating AI-assisted coding",
        useCases: ["Code completion", "Basic chat", "Cascade (limited)"],
        enterpriseThreshold: 0,
        apiSuitable: false,
        notes: "Free tier with limited Cascade flows. Suitable for evaluation only.",
      },
      Pro: {
        monthlyPricePerSeat: 15,
        minTeamSize: 1,
        maxTeamSize: 10,
        targetProfile: "Individual developer needing a full-featured AI coding agent",
        useCases: ["Unlimited Cascade flows", "Code completion", "Multi-file editing", "Terminal commands"],
        enterpriseThreshold: 0,
        apiSuitable: false,
        notes: "Competitive with Cursor Pro at $5/seat cheaper. Overlaps with GitHub Copilot and Cursor.",
      },
      Teams: {
        monthlyPricePerSeat: 35,
        minTeamSize: 3,
        maxTeamSize: 500,
        targetProfile: "Engineering teams needing centralized AI coding assistance",
        useCases: ["All Pro features", "Team admin", "Usage analytics", "Priority access"],
        enterpriseThreshold: 50,
        apiSuitable: false,
        notes: "Higher per-seat cost than Cursor Business. Evaluate overlap with existing copilot tools before adding.",
      },
    },
  },
} as const;

// ─── Type Derivation ────────────────────────────────────────────────────────

export type ToolName = keyof typeof PRICING_REGISTRY;

export type ToolPlan = {
  [K in ToolName]: keyof (typeof PRICING_REGISTRY)[K]["plans"];
}[ToolName];

// Keep legacy PRICING_CATALOG alias so existing imports don't break
export const PRICING_CATALOG = Object.fromEntries(
  Object.entries(PRICING_REGISTRY).map(([tool, data]) => [
    tool,
    {
      vendor: data.vendor,
      category: data.category,
      plans: data.planOrder as readonly string[],
    },
  ])
) as unknown as Record<
  ToolName,
  { vendor: string; category: ToolCategory; plans: readonly string[] }
>;

export const TOOL_NAMES = Object.keys(PRICING_REGISTRY) as [ToolName, ...ToolName[]];

export const TOOL_PLANS = Array.from(
  new Set(
    TOOL_NAMES.flatMap((tool) =>
      Object.keys(PRICING_REGISTRY[tool].plans)
    )
  )
) as [ToolPlan, ...ToolPlan[]];

// ─── Helper Functions ───────────────────────────────────────────────────────

/** Returns the ordered plan names for a given tool */
export const getPlanOptions = (tool: ToolName): readonly string[] =>
  PRICING_REGISTRY[tool].planOrder;

/** Returns the category for a given tool */
export const getToolCategory = (tool: ToolName): ToolCategory =>
  PRICING_REGISTRY[tool].category;

/**
 * Returns the PlanDetail for a specific tool + plan combination.
 * Returns null if the plan is not found (e.g. custom/enterprise pricing).
 */
export const getPlanDetail = (
  tool: ToolName,
  plan: string
): PlanDetail | null => {
  const plans = PRICING_REGISTRY[tool].plans as unknown as Record<string, PlanDetail>;
  return plans[plan] ?? null;
};

/**
 * Returns the next lower plan in the ordered tier list.
 * Returns null if already at the lowest tier.
 */
export const getDowngradePlanName = (
  tool: ToolName,
  currentPlan: string
): string | null => {
  const order = [...PRICING_REGISTRY[tool].planOrder] as string[];
  const idx = order.indexOf(currentPlan);
  if (idx <= 0) return null;
  return order[idx - 1];
};

/**
 * Computes the per-seat monthly savings from downgrading to a lower plan.
 * Returns 0 if either plan detail is unavailable or savings would be negative.
 */
export const computeDowngradeSavingsPerSeat = (
  tool: ToolName,
  currentPlan: string,
  targetPlan: string
): number => {
  const current = getPlanDetail(tool, currentPlan);
  const target = getPlanDetail(tool, targetPlan);
  if (!current || !target) return 0;
  return Math.max(0, current.monthlyPricePerSeat - target.monthlyPricePerSeat);
};
