import { HeroSection } from "@/components/hero-section";
import { AuditInsightsSection } from "@/components/marketing/audit-insights-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { FeatureSection } from "@/components/marketing/feature-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { AuditIntakeSection } from "@/components/forms/audit-intake-section";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <AuditInsightsSection />
      <HowItWorksSection />
      <AuditIntakeSection />
      <CtaSection />
    </main>
  );
}