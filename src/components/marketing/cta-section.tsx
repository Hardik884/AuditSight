"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { fadeUp, staggerContainer, staggerChild, viewportOnce } from "@/lib/motion";

export function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="relative overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-10 text-slate-100 shadow-2xl shadow-black/30 md:p-14"
        >
          <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-4">
              <motion.div variants={staggerChild}>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-300">
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                  Investor-ready clarity
                </span>
              </motion.div>
              <motion.h2
                variants={fadeUp}
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Make AI spend a strategic advantage.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-base text-slate-400 sm:text-lg"
              >
                AuditSight delivers executive-grade audits, savings recommendations,
                and governance so you can scale AI with confidence.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-wrap gap-4 pt-2"
              >
                {["Free to generate", "No account required", "Instant results"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {item}
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              variants={staggerChild}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Button
                asChild
                size="lg"
                className="group inline-flex items-center gap-2 bg-white px-6 font-semibold text-slate-900 shadow-md transition-all hover:bg-slate-100 hover:shadow-lg active:scale-[0.98]"
              >
                <Link href="/audit">
                  Generate Free Audit
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/20 px-6 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/#example-audit">View Sample Report</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
