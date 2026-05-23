import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AuditReportPanel } from "@/components/forms/AuditReportPanel";
import { getAuditById } from "@/lib/audit-storage";

interface AuditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AuditResultPage({ params }: AuditPageProps) {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="border-b border-border/40 bg-slate-50/70 py-10 dark:bg-slate-950/40">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Audit report
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Audit results
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Generated on {new Date(audit.generatedAt).toLocaleDateString()}.
          </p>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6">
          <AuditReportPanel audit={audit} />
        </div>
      </section>
    </main>
  );
}
