"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Example Audit", href: "/#example-audit" },
  { label: "GitHub", href: "https://github.com/Hardik884/AuditSight", external: true },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-border/50 bg-background/85 shadow-sm shadow-black/5 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent backdrop-blur-sm"
        }`}
      >
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3.5">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight text-foreground"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-xs font-bold text-white shadow-md ring-1 ring-black/10 transition-transform duration-200 group-hover:scale-105 dark:from-slate-200 dark:to-white dark:text-slate-900">
              AS
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.01em]">
              AuditSight
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                className="relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent/60 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className="hidden items-center gap-1.5 bg-slate-900 px-4 text-white shadow-md transition-all duration-150 hover:bg-slate-700 hover:shadow-lg active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 sm:flex"
            >
              <Link href="/audit">
                Free Audit
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>

            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/70 text-muted-foreground transition hover:bg-accent md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.20, ease: "easeOut" }}
            className="fixed inset-x-0 top-[57px] z-40 border-b border-border/60 bg-background/95 px-6 py-4 shadow-xl shadow-black/10 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent/70 hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Button
                asChild
                size="default"
                className="mt-2 w-full bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              >
                <Link href="/audit" onClick={() => setMobileOpen(false)}>
                  Generate Free Audit
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
