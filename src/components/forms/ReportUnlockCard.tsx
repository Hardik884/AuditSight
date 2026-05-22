"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveEmailCapture } from "@/lib/api/email-capture-client";
import type { EmailCaptureSource } from "@/types/audit";

interface ReportUnlockCardProps {
  auditId: string;
  onUnlock: () => void;
}

type CaptureStatus = "idle" | "loading" | "success";

const captureSource: EmailCaptureSource = "report-unlock";

export function ReportUnlockCard({ auditId, onUnlock }: ReportUnlockCardProps) {
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValidEmail = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") return;

    if (!isValidEmail) {
      setErrorMessage("Enter a valid work email to unlock the report.");
      return;
    }

    setErrorMessage(null);
    setStatus("loading");

    const result = await saveEmailCapture({
      auditId,
      email,
      capturedFrom: captureSource,
    });

    if (!result.ok) {
      setStatus("idle");
      setErrorMessage(result.error?.message || "Unable to unlock report.");
      return;
    }

    setStatus("success");
    setTimeout(() => {
      onUnlock();
    }, 500);
  };

  return (
    <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 text-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.65)]">
      <div className="flex flex-col gap-4">
        <Badge className="text-emerald-300">Premium unlock</Badge>
        <div>
          <p className="text-xl font-semibold">Unlock the full audit report</p>
          <p className="mt-2 text-sm text-slate-200/90">
            Get detailed optimization insights, governance recommendations, and a
            shareable audit your finance team can act on.
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <label className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-300">
              Work email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              className="mt-2 border-b border-white/20 text-white placeholder:text-slate-400 focus-visible:border-b-emerald-400"
              aria-invalid={Boolean(errorMessage)}
              disabled={status !== "idle"}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-white text-slate-900 hover:bg-slate-100"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Unlocking report..." : "Unlock full report"}
          </Button>
        </form>

        <div className="min-h-[1.5rem] text-xs text-slate-300">
          {errorMessage ? (
            <span className="text-rose-200">{errorMessage}</span>
          ) : status === "success" ? (
            <span className="text-emerald-300">
              Report unlocked. Preparing your insights...
            </span>
          ) : (
            <span>We only use this to deliver your audit. No spam.</span>
          )}
        </div>
      </div>
    </div>
  );
}
