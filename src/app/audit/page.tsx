import { AuditIntakeSection } from "@/components/forms/audit-intake-section";
import { Navbar } from "@/components/navbar";

export default function AuditPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="border-b border-border/40 bg-slate-50/70 py-10 dark:bg-slate-950/40">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Audit workspace
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            AI spend audit
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Connect your stack, review the audit, and export recommendations your
            finance and engineering teams can act on immediately.
          </p>
        </div>
      </section>
      <AuditIntakeSection />
    </main>
  );
}
