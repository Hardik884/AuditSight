import type {
  AuditGoal,
  AuditRequest,
  AuditResponse,
  Challenge,
  ConfidenceLevel,
  DifficultyLevel,
  Recommendation,
  RiskLevel,
  SeverityLevel,
  ToolCategory,
  ToolName,
} from "@/types/audit";

const toolCategoryMap: Record<ToolName, ToolCategory> = {
  ChatGPT: "LLM",
  Claude: "LLM",
  Gemini: "LLM",
  "GitHub Copilot": "Developer",
  Cursor: "Developer",
  Perplexity: "Search",
};

const challengeRecommendations: Record<Challenge, Recommendation[]> = {
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

const goalRecommendations: Record<AuditGoal, Recommendation> = {
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

const toolBasedRecommendations: Recommendation[] = [
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

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const formatRiskLevel = (score: number): RiskLevel => {
  if (score >= 9) return "Critical";
  if (score >= 6) return "High";
  if (score >= 3) return "Moderate";
  return "Low";
};

const estimateSavings = (request: AuditRequest) => {
  const sizeFactor =
    request.teamSize === "1-25"
      ? 0.12
      : request.teamSize === "26-100"
      ? 0.16
      : request.teamSize === "101-500"
      ? 0.2
      : 0.24;
  const toolFactor = 1 + request.selectedTools.length * 0.06;
  const base = request.monthlySpend * sizeFactor * toolFactor;
  return Math.max(base, 2500);
};

const computeRiskScore = (request: AuditRequest) => {
  let score = 0;
  if (request.monthlySpend > 100000) score += 3;
  else if (request.monthlySpend > 50000) score += 2;
  else if (request.monthlySpend > 20000) score += 1;

  if (request.teamSize === "500+") score += 3;
  else if (request.teamSize === "101-500") score += 2;
  else if (request.teamSize === "26-100") score += 1;

  if (request.selectedTools.length >= 5) score += 2;
  else if (request.selectedTools.length >= 3) score += 1;

  if (request.biggestChallenge === "Overlapping subscriptions") score += 2;
  if (request.biggestChallenge === "Spend volatility") score += 1;

  return score;
};

const computeOptimizationScore = (request: AuditRequest) => {
  const complexityPenalty =
    request.selectedTools.length * 4 +
    (request.biggestChallenge === "Spend volatility" ? 8 : 4) +
    (request.teamSize === "500+" ? 8 : 4);
  return clamp(92 - complexityPenalty, 48, 92);
};

const computeConfidence = (request: AuditRequest): ConfidenceLevel => {
  if (request.selectedTools.length >= 4 && request.monthlySpend > 60000) {
    return "High";
  }
  if (request.selectedTools.length >= 2) return "Medium";
  return "Low";
};

const adjustRecommendationImpact = (
  recommendation: Recommendation,
  multiplier: number
): Recommendation => ({
  ...recommendation,
  estimatedSavingsImpact: Math.round(recommendation.estimatedSavingsImpact * multiplier),
});

const pickDifficulty = (difficulty: DifficultyLevel, factor: number) => {
  if (factor > 1.2 && difficulty === "Low") return "Medium";
  if (factor > 1.4 && difficulty === "Medium") return "High";
  return difficulty;
};

export const generateAudit = (
  request: AuditRequest,
  requestId: string
): AuditResponse => {
  const riskScore = computeRiskScore(request);
  const riskLevel = formatRiskLevel(riskScore);
  const estimatedSavings = estimateSavings(request);
  const optimizationScore = computeOptimizationScore(request);
  const confidence = computeConfidence(request);
  const toolCategories = Array.from(
    new Set(request.selectedTools.map((tool) => toolCategoryMap[tool]))
  );

  const baseRecs = [
    ...challengeRecommendations[request.biggestChallenge],
    ...request.auditGoals.map((goal) => goalRecommendations[goal]),
  ];

  const toolRecs = toolCategories.includes("Developer")
    ? [toolBasedRecommendations[0]]
    : [];
  const llmRecs = toolCategories.includes("LLM")
    ? [toolBasedRecommendations[1]]
    : [];
  const searchRecs = toolCategories.includes("Search")
    ? [toolBasedRecommendations[2]]
    : [];

  const totalRecommendations = Math.min(6, 3 + request.selectedTools.length);
  const impactMultiplier = clamp(request.monthlySpend / 40000, 0.7, 1.6);

  const recommendations = [...baseRecs, ...toolRecs, ...llmRecs, ...searchRecs]
    .slice(0, totalRecommendations)
    .map((rec) => {
      const adjusted = adjustRecommendationImpact(rec, impactMultiplier);
      return {
        ...adjusted,
        confidence,
        difficulty: pickDifficulty(rec.difficulty, impactMultiplier),
      };
    });

  const potentialSavingsPercent = clamp(
    Math.round((estimatedSavings / request.monthlySpend) * 100),
    8,
    32
  );

  const usageInsights = {
    topTools: request.selectedTools.slice(0, 3),
    seatUtilizationPercent: clamp(100 - request.selectedTools.length * 8, 58, 92),
    promptVolume: clamp(Math.round(request.monthlySpend / 9), 1800, 26000),
    toolCategories,
  };

  const auditSummary = {
    headline: "Audit complete with actionable savings",
    narrative: `We identified ${recommendations.length} high-impact opportunities with ${potentialSavingsPercent}% potential savings. Governance coverage is ${riskLevel.toLowerCase()} risk.`,
  };

  const governanceInsights = [
    "Policy coverage on 62% of active teams",
    "Spend guardrails missing on 3 critical workflows",
    "Model approvals pending for 2 vendors",
  ].slice(0, request.selectedTools.length >= 4 ? 3 : 2);

  const optimizationOpportunities = [
    "Reduce vendor overlap",
    "Balance model tiers by workload",
    "Standardize prompt libraries",
    "Automate budget notifications",
  ].slice(0, request.selectedTools.length >= 3 ? 4 : 3);

  return {
    requestId,
    generatedAt: new Date().toISOString(),
    metrics: {
      estimatedSavings,
      optimizationScore,
      riskLevel,
      potentialSavingsPercent,
    },
    recommendations,
    auditSummary,
    usageInsights,
    optimizationOpportunities,
    governanceInsights,
  };
};
