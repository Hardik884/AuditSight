"use client";

import { useMemo, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveEmailCapture } from "@/lib/api/email-capture-client";
import type { EmailCaptureSource } from "@/types/audit";
import { ArrowRight, Lock, CheckCircle2, Mail } from "lucide-react";

interface ReportUnlockCardProps {
  auditId: string;
  onUnlock: () => void;
}

type CaptureStatus = "idle" | "loading" | "success";
const captureSource: EmailCaptureSource = "report-unlock";

const UNLOCK_FEATURES = [
  "Full tool-by-tool breakdown",
  "Governance & compliance insights",
  "Prioritized savings recommendations",
  "Shareable executive PDF summary",
];

export function ReportUnlockCard({ auditId, onUnlock }: ReportUnlockCardProps) {
  const [email, setEmail] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [teamSize, setTeamSize] = useState<string>("");
  const [homepage, setHomepage] = useState<string>("");
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValidEmail = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") return;

    const formData = new FormData(event.currentTarget);
    const honeypotValue = String(formData.get("homepage") ?? "").trim();

    if (!isValidEmail) {
      setErrorMessage("Enter a valid work email to unlock the report.");
      return;
    }

    setErrorMessage(null);
    setStatus("loading");

    const trimmedCompany = companyName.trim();
    const trimmedRole = role.trim();
    const parsedTeamSize = Number.parseInt(teamSize.trim(), 10);
    const validTeamSize = Number.isFinite(parsedTeamSize) ? parsedTeamSize : undefined;

    const result = await saveEmailCapture({
      auditId,
      email,
      capturedFrom: captureSource,
      ...(trimmedCompany ? { companyName: trimmedCompany } : {}),
      ...(trimmedRole ? { role: trimmedRole } : {}),
      ...(validTeamSize ? { teamSize: validTeamSize } : {}),
      homepage: honeypotValue || homepage,
    });

    if (!result.ok) {
      setStatus("idle");
      setErrorMessage(result.error?.message || "Unable to unlock report.");
      return;
    }

    setStatus("success");
    setTimeout(() => {
      onUnlock();
    }, 700);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 p-7 text-white shadow-2xl shadow-black/30">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-emerald-500/8 blur-3xl" />

      {/* Premium badge */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/8 ring-1 ring-white/10">
          <Lock className="h-4 w-4 text-slate-300" />
        </div>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
          Full report unlock
        </span>
      </div>

      {/* Copy */}
      <div className="mt-5">
        <h3 className="text-xl font-bold tracking-tight text-white">
          Unlock your complete audit report
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Get the detailed breakdown your finance team needs to act.
        </p>
      </div>

      {/* Feature list */}
      <ul className="mt-5 space-y-2">
        {UNLOCK_FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Divider */}
      <div className="my-6 h-px bg-white/8" />

      {/* Form */}
      <AnimatePresence mode="wait">
        {status !== "success" ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="sr-only" aria-hidden="true">
              <label className="sr-only" htmlFor="unlock-homepage">
                Homepage
              </label>
              <input
                id="unlock-homepage"
                type="text"
                name="homepage"
                tabIndex={-1}
                autoComplete="off"
                value={homepage}
                onChange={(e) => setHomepage(e.target.value)}
              />
            </div>
            {/* Email input */}
            <div className="group relative rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-indigo-400/50 focus-within:bg-white/8 focus-within:ring-2 focus-within:ring-indigo-400/20">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-slate-500 group-focus-within:text-indigo-400" />
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Work email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="mt-1 w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
                    disabled={status !== "idle"}
                    autoComplete="email"
                  />
                </div>
              </div>
            </div>

            {/* Optional details */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-indigo-400/50 focus-within:bg-white/8 focus-within:ring-2 focus-within:ring-indigo-400/20">
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Company (optional)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company name"
                  className="mt-1 w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
                  disabled={status !== "idle"}
                  autoComplete="organization"
                />
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-indigo-400/50 focus-within:bg-white/8 focus-within:ring-2 focus-within:ring-indigo-400/20">
                <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Role (optional)
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Title or function"
                  className="mt-1 w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
                  disabled={status !== "idle"}
                  autoComplete="organization-title"
                />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-indigo-400/50 focus-within:bg-white/8 focus-within:ring-2 focus-within:ring-indigo-400/20">
              <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Team size (optional)
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                placeholder="Total headcount"
                className="mt-1 w-full bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
                disabled={status !== "idle"}
                inputMode="numeric"
              />
            </div>

            {/* Error */}
            <AnimatePresence>
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-rose-400"
                >
                  {errorMessage}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-slate-900 shadow-md shadow-black/20 transition-all hover:bg-slate-100 hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
            >
              {status === "loading" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-slate-900" />
                  Unlocking...
                </>
              ) : (
                <>
                  Unlock full report
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            {/* Trust line */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600">
              <Lock className="h-3 w-3" />
              No account required. We only use this to deliver your audit.
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-4 text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Report unlocked!</p>
              <p className="mt-1 text-sm text-slate-400">
                Preparing your full audit insights...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
