import { AuditIntakeSection } from "@/components/forms/audit-intake-section";
import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Spend Audit — AuditSight",
  description: "Generate your free AI spend audit. Connect your stack, review the insights, and get executive-grade savings recommendations in minutes.",
};

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="relative overflow-hidden border-b border-border/40 bg-slate-50/60 py-12 dark:bg-slate-900/20">
        <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6">
          <span className="inline-flex items-center rounded-full border border-border/70 bg-background px-3.5 py-1.5 text-xs font-semibold text-slate-400 w-fit">
            Audit workspace
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            AI spend audit
          </h1>
          <p className="max-w-2xl text-base text-slate-500 dark:text-slate-400">
            Connect your stack, review the audit, and export recommendations your
            finance and engineering teams can act on immediately.
          </p>
        </div>
      </section>

      <AuditIntakeSection />
    </main>
  );
}
