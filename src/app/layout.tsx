import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AuditSight — AI Spend Optimization",
  description:
    "Stop overspending on AI. AuditSight delivers executive-grade audits, defensible savings recommendations, and governance insights for modern AI-powered teams.",
  keywords: ["AI spend", "LLM cost optimization", "AI audit", "AI governance"],
  openGraph: {
    title: "AuditSight — AI Spend Optimization",
    description:
      "Identify wasted AI spend, optimize seat utilization, and govern your AI stack with executive-grade clarity.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full scroll-smooth antialiased",
        inter.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
