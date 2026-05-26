"use client";

import { useMemo, useState } from "react";
import type { AuditResult } from "@/types/audit";
import { AuditResultDetails } from "@/components/forms/AuditResultDetails";
import { ReportUnlockCard } from "@/components/forms/ReportUnlockCard";

interface AuditReportPanelProps {
  audit: AuditResult;
}

type UnlockState = "locked" | "unlocked";

export function AuditReportPanel({ audit }: AuditReportPanelProps) {
  const [unlockState, setUnlockState] = useState<UnlockState>(() => {
    if (typeof window === "undefined") return "locked";
    const stored = sessionStorage.getItem(`audit-unlock:${audit.auditId}`);
    return stored === "unlocked" ? "unlocked" : "locked";
  });

  const formatCurrency = useMemo(
    () =>
      (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(value),
    []
  );

  const isUnlocked = unlockState === "unlocked";

  const handleUnlock = () => {
    const storageKey = `audit-unlock:${audit.auditId}`;
    sessionStorage.setItem(storageKey, "unlocked");
    setUnlockState("unlocked");
  };

  return (
    <div className="flex flex-col gap-6">
      <AuditResultDetails
        status="complete"
        auditResponse={audit}
        formatCurrency={formatCurrency}
        showFullReport={isUnlocked}
        aiExecutiveSummary={audit.aiExecutiveSummary}
      />
      {!isUnlocked ? (
        <ReportUnlockCard auditId={audit.auditId} onUnlock={handleUnlock} />
      ) : null}
    </div>
  );
}
