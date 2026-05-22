"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuditResult } from "@/types/audit";
import { AuditResultDetails } from "@/components/forms/AuditResultDetails";
import { ReportUnlockCard } from "@/components/forms/ReportUnlockCard";

interface AuditReportPanelProps {
  audit: AuditResult;
}

type UnlockState = "locked" | "unlocked";

export function AuditReportPanel({ audit }: AuditReportPanelProps) {
  const [unlockState, setUnlockState] = useState<UnlockState>("locked");

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

  useEffect(() => {
    const storageKey = `audit-unlock:${audit.auditId}`;
    const stored = sessionStorage.getItem(storageKey);
    if (stored === "unlocked") {
      setUnlockState("unlocked");
    }
  }, [audit.auditId]);

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
      />
      {!isUnlocked ? (
        <ReportUnlockCard auditId={audit.auditId} onUnlock={handleUnlock} />
      ) : null}
    </div>
  );
}
