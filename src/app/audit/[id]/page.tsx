import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AuditReportPanel } from "@/components/forms/AuditReportPanel";
import { getAuditById } from "@/lib/audit-storage";
import type { Metadata } from "next";

interface AuditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AuditPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Audit Report — AuditSight`,
    description: `View your AI spend audit results and optimization recommendations. Audit ID: ${id.slice(0, 8)}`,
  };
}

export default async function AuditResultPage({ params }: AuditPageProps) {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) {
    notFound();
  }

  const generatedDate = new Date(audit.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Page header */}
      <section className="relative overflow-hidden border-b border-border/40 bg-slate-50/60 py-12 dark:bg-slate-900/20">
        <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6">
          <span className="inline-flex items-center rounded-full border border-border/70 bg-background px-3.5 py-1.5 text-xs font-semibold text-slate-400 w-fit">
            Audit report
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            Your audit results
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400">
            Generated on {generatedDate} · AI spend analysis by AuditSight
          </p>
        </div>
      </section>

      {/* Report body */}
      <section className="py-12 md:py-16">
        <div className="mx-auto w-full max-w-7xl px-6">
          <AuditReportPanel audit={audit} />
        </div>
      </section>
    </main>
  );
}
