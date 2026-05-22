import type {
  AuditGoal,
  Challenge,
  PrimaryUseCase,
  Recommendation,
  ToolCategory,
  ToolName,
} from "@/types/audit";

export const TOOL_CATEGORY_MAP: Record<ToolName, ToolCategory> = {
  ChatGPT: "LLM",
  Claude: "LLM",
  Gemini: "LLM",
  "GitHub Copilot": "Developer",
  Cursor: "Developer",
  Perplexity: "Search",
};

export const CHALLENGE_RECOMMENDATIONS: Record<Challenge, Recommendation[]> = {
  "Unclear ROI": [
    {
      title: "Map AI usage to revenue workflows",
      description: "Associate AI usage with product KPIs and revenue outcomes.",
      confidence: "High",
      estimatedSavingsImpact: 4200,
      severity: "Medium",
      difficulty: "Medium",
    },
    {
      title: "Benchmark cost per output",
      description: "Quantify cost per summary, ticket, or code change.",
      confidence: "Medium",
      estimatedSavingsImpact: 2400,
      severity: "Low",
      difficulty: "Low",
    },
  ],
  "Overlapping subscriptions": [
    {
      title: "Consolidate duplicate seats",
      description: "Merge overlapping copilots across adjacent teams.",
      confidence: "High",
      estimatedSavingsImpact: 6400,
      severity: "High",
      difficulty: "Medium",
    },
    {
      title: "Retire idle licenses",
      description: "Deactivate seats with less than 10% weekly usage.",
      confidence: "High",
      estimatedSavingsImpact: 3100,
      severity: "Medium",
      difficulty: "Low",
    },
  ],
  "Spend volatility": [
    {
      title: "Add spend guardrails",
      description: "Introduce thresholds and alerts for bursty prompt traffic.",
      confidence: "Medium",
      estimatedSavingsImpact: 5200,
      severity: "High",
      difficulty: "Low",
    },
    {
      title: "Reserve baseline capacity",
      description: "Lock in predictable workload spend for core use cases.",
      confidence: "Medium",
      estimatedSavingsImpact: 3300,
      severity: "Medium",
      difficulty: "Medium",
    },
  ],
  "Model quality drift": [
    {
      title: "Introduce evaluation gates",
      description: "Add regression testing for critical AI workflows.",
      confidence: "High",
      estimatedSavingsImpact: 2900,
      severity: "Medium",
      difficulty: "Medium",
    },
    {
      title: "Align routing with quality tiers",
      description: "Only route premium models to high-impact workflows.",
      confidence: "Medium",
      estimatedSavingsImpact: 2600,
      severity: "Low",
      difficulty: "Low",
    },
  ],
};

export const GOAL_RECOMMENDATIONS: Record<AuditGoal, Recommendation> = {
  "Reduce monthly spend": {
    title: "Aggressive savings plan",
    description: "Target top three cost drivers with immediate reductions.",
    confidence: "High",
    estimatedSavingsImpact: 7800,
    severity: "High",
    difficulty: "Medium",
  },
  "Improve usage governance": {
    title: "Governance coverage boost",
    description: "Add approvals and policy checks for regulated workflows.",
    confidence: "Medium",
    estimatedSavingsImpact: 2500,
    severity: "Medium",
    difficulty: "High",
  },
  "Consolidate vendors": {
    title: "Vendor rationalization",
    description: "Reduce overlapping tooling by standardizing on core vendors.",
    confidence: "High",
    estimatedSavingsImpact: 5900,
    severity: "High",
    difficulty: "Medium",
  },
  "Optimize model routing": {
    title: "Routing optimization",
    description: "Shift workloads to the most cost-effective model tiers.",
    confidence: "Medium",
    estimatedSavingsImpact: 4200,
    severity: "Medium",
    difficulty: "Low",
  },
};

export const TOOL_BASED_RECOMMENDATIONS: Recommendation[] = [
  {
    title: "Seat utilization audit",
    description: "Analyze developer tool usage and reclaim idle seats.",
    confidence: "High",
    estimatedSavingsImpact: 3600,
    severity: "Medium",
    difficulty: "Low",
  },
  {
    title: "Prompt routing policy",
    description: "Route low-risk prompts to lower cost model tiers.",
    confidence: "Medium",
    estimatedSavingsImpact: 4100,
    severity: "Medium",
    difficulty: "Low",
  },
  {
    title: "Search tooling consolidation",
    description: "Reduce redundant research subscriptions across teams.",
    confidence: "Medium",
    estimatedSavingsImpact: 2200,
    severity: "Low",
    difficulty: "Low",
  },
];

export const USE_CASE_RECOMMENDATIONS: Record<PrimaryUseCase, Recommendation> = {
  Engineering: {
    title: "Developer workflow optimization",
    description: "Consolidate copilots and enforce IDE seat utilization checks.",
    confidence: "High",
    estimatedSavingsImpact: 4800,
    severity: "Medium",
    difficulty: "Low",
  },
  Marketing: {
    title: "Content workflow consolidation",
    description: "Standardize campaign generation and reuse approved templates.",
    confidence: "Medium",
    estimatedSavingsImpact: 3200,
    severity: "Low",
    difficulty: "Low",
  },
  Research: {
    title: "Research tooling rationalization",
    description: "Route exploratory queries to cost-efficient search models.",
    confidence: "High",
    estimatedSavingsImpact: 3600,
    severity: "Medium",
    difficulty: "Low",
  },
  "Customer Support": {
    title: "Support deflection tuning",
    description: "Reduce agent handoffs by refining AI response quality gates.",
    confidence: "Medium",
    estimatedSavingsImpact: 2900,
    severity: "Medium",
    difficulty: "Medium",
  },
  Operations: {
    title: "Process automation alignment",
    description: "Automate repetitive workflows with policy-backed copilots.",
    confidence: "Medium",
    estimatedSavingsImpact: 3100,
    severity: "Low",
    difficulty: "Medium",
  },
  Sales: {
    title: "Revenue workflow efficiency",
    description: "Optimize outreach and CRM enrichment with shared prompts.",
    confidence: "Medium",
    estimatedSavingsImpact: 2700,
    severity: "Low",
    difficulty: "Low",
  },
  "Content Creation": {
    title: "Creative pipeline standardization",
    description: "Centralize brand-safe prompts and consolidate tool spend.",
    confidence: "Medium",
    estimatedSavingsImpact: 3000,
    severity: "Low",
    difficulty: "Low",
  },
};

export const GOVERNANCE_INSIGHT_TEMPLATES = [
  "Policy coverage on 62% of active teams",
  "Spend guardrails missing on 3 critical workflows",
  "Model approvals pending for 2 vendors",
];

export const OPTIMIZATION_OPPORTUNITY_TEMPLATES = [
  "Reduce vendor overlap",
  "Balance model tiers by workload",
  "Standardize prompt libraries",
  "Automate budget notifications",
];
