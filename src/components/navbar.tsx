import Link from "next/link";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Example Audit", href: "/#example-audit" },
  { label: "GitHub", href: "https://github.com/Hardik884/AuditSight" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 shadow-sm">
            AS
          </span>
          <span className="text-base">AuditSight</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-foreground"
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="shadow-sm">
            <Link href="/audit">Generate Free Audit</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
