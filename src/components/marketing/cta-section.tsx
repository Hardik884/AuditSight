import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-12">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="rounded-3xl border border-slate-900/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 text-slate-100 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.8)] dark:border-white/5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                Investor-ready clarity
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Make AI spend a strategic advantage.
              </h2>
              <p className="text-sm text-slate-300 sm:text-base">
                AuditSight delivers executive-grade audits, savings
                recommendations, and governance so you can scale AI with
                confidence.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                <Link href="/audit">Generate Free Audit</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Link href="/#example-audit">View Sample Report</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
