# DEVLOG

## Day 1 — 2026-05-20
**Hours worked:** 5

**What I did:**  
Started the project setup and initialized the Next.js + TypeScript codebase. I spent most of the day configuring the frontend foundation, Tailwind, component structure, and getting the landing page into a presentable state. The initial version of the site was mostly static, but I wanted it to feel more like a real SaaS product than a student assignment, so I redesigned the hero section and overall visual hierarchy pretty early.

I also stabilized the development environment because I ran into a few dependency/version issues during setup, especially around React typings and App Router compatibility.

**What I learned:**  
I underestimated how much time App Router setup and frontend structure decisions would affect everything later. Getting the initial architecture right early saved a lot of refactoring pain afterward.

**Blockers / what I'm stuck on:**  
Spent more time than expected dealing with environment setup and UI structure. I also realized the first landing page version looked too generic and needed a stronger product identity.

**Plan for tomorrow:**  
Start building the actual audit onboarding flow and move beyond static marketing pages.

---

## Day 2 — 2026-05-21
**Hours worked:** 6

**What I did:**  
Built the first interactive audit onboarding flow and started implementing the backend audit engine. Initially the form only captured basic tool selections, but the recommendations felt shallow because they weren't tied to real plans or pricing structures yet.

I also started stabilizing the validation and backend logic because TypeScript drift between form state and API payloads became messy quickly. A good amount of time went into cleaning types and making the audit pipeline deterministic instead of AI-generated.

The marketing sections and “audit insights” UI were also expanded so the product felt more complete during demos.

**What I learned:**  
AI-generated recommendations sound impressive initially, but they become very hard to justify financially. I decided pretty early that the core audit calculations needed to stay rule-based and pricing-driven.

**Blockers / what I'm stuck on:**  
The onboarding flow was functional, but the audit results still lacked credibility because there wasn’t enough structured pricing intelligence behind them.

**Plan for tomorrow:**  
Refactor the audit flow architecture and integrate persistent storage with Supabase.

---

## Day 3 — 2026-05-22
**Hours worked:** 8

**What I did:**  
This was probably the first “real backend” day of the project. I refactored the application structure to separate the marketing site from the actual audit workflow because the routing and state management were getting difficult to maintain.

Integrated Supabase persistence for audit storage and started implementing gated audit reports with dynamic routes. I also added the lead capture flow and the conditional Credex CTA for high-savings audits.

A large amount of time went into debugging persistence issues and aligning API payloads with the database schema. Some of the earlier assumptions about the audit data model broke once reports became persistent instead of temporary client-side state.

**What I learned:**  
Schema evolution becomes painful very quickly once persistence is introduced. Small naming mismatches between frontend state, validation schemas, and database columns caused cascading issues.

**Blockers / what I'm stuck on:**  
The audit flow architecture became much more complicated after persistence and gated reports were added. I was also starting to see how fragile schema changes could become.

**Plan for tomorrow:**  
Move the onboarding flow to structured vendor plan modeling and improve the recommendation engine so the audit results feel financially defensible.

---

## Day 4 — 2026-05-23
**Hours worked:** 9

**What I did:**  
Major refactor day. I replaced the generic onboarding structure with a much more detailed vendor-plan-based intake flow. Instead of simply asking “which tools do you use?”, the app now modeled actual plans, seat counts, and spend per vendor.

I also implemented the structured pricing intelligence layer and rule-based recommendation engine. This was the point where the audit results finally started feeling believable instead of “AI-generated suggestions.”

The biggest challenge was syncing the frontend changes with Supabase. I hit several schema drift issues and constraint failures while migrating the persistence layer to the new audit structure. The backend started failing because older columns and assumptions no longer matched the new audit model.

**What I learned:**  
Database migrations are easy to underestimate during rapid iteration. Once persistence is live, changing data models becomes significantly riskier than changing frontend code.

**Blockers / what I'm stuck on:**  
Spent a lot of time debugging Supabase schema mismatches, null constraints, and migration failures. The app repeatedly broke because old database assumptions were still enforced after the refactor.

**Plan for tomorrow:**  
Improve the frontend presentation layer and integrate AI-generated executive summaries on top of the deterministic audit results.

---

## Day 5 — 2026-05-24
**Hours worked:** 7

**What I did:**  
Focused heavily on frontend polish and executive-facing UX. Added Framer Motion animations, improved typography with Inter, and redesigned several report sections so the product felt more premium and presentation-ready.

Integrated Gemini-generated executive summaries with graceful fallback handling. I intentionally kept Gemini limited to summarizing structured findings instead of generating recommendations directly.

I also finalized the Supabase persistence flow for audit reports and cleaned up several report rendering issues.

**What I learned:**  
Animations and visual hierarchy matter a lot more once the backend logic is stable. Earlier versions technically worked, but the reports didn’t “feel” trustworthy until the UI quality improved.

**Blockers / what I'm stuck on:**  
Gemini responses started failing unpredictably. Some responses were getting truncated because token budget settings were interfering with output generation, which made debugging frustrating.

**Plan for tomorrow:**  
Fix Gemini truncation issues, improve shareability with Open Graph previews, and harden the application for production-style deployment.

---

## Day 6 — 2026-05-25
**Hours worked:** 5

**What I did:**  
Tracked down and fixed the Gemini summary truncation issue. The problem ended up being related to the thinking budget consuming output tokens, so the summaries were getting cut off mid-sentence. After fixing that, the AI summaries became much more stable.

I also implemented dynamic Open Graph metadata and shareable social previews for audit reports. This required adding dynamic metadata generation and OG image routes inside the App Router architecture.

Spent some time testing how reports rendered when shared externally and making sure the previews looked polished.

**What I learned:**  
AI integrations fail in ways that are often difficult to diagnose because the issue isn’t always the prompt itself. In this case the problem was infrastructure/configuration related rather than prompt quality.

**Blockers / what I'm stuck on:**  
Balancing shareability with gated reports became tricky because the app needed public previews while still preserving the unlock flow.

**Plan for tomorrow:**  
Add production-style hardening features like transactional emails, abuse protection, testing, CI, and finish the documentation layer.

---

## Day 7 — 2026-05-26
**Hours worked:** 8

**What I did:**  
Today was mostly focused on turning the MVP into something that felt production-ready instead of just feature-complete.

Added transactional email delivery using Resend and implemented lightweight honeypot-based abuse protection. I also set up Vitest tests covering the audit engine and recommendation logic, followed by a GitHub Actions CI pipeline running lint, tests, and production builds automatically.

A surprising amount of time went into resolving ESLint warnings and cleaning up small frontend UX issues, especially around numeric inputs defaulting to leading-zero behavior.

I also worked on the submission/documentation side of the project today:
- README
- ARCHITECTURE.md
- DEVLOG.md
- TESTS.md
- other supporting markdown/project documentation files

Finally deployed the project to Vercel and tested the production flow end-to-end.

**What I learned:**  
The last 10% of a project takes disproportionately longer than expected. Most of the work at this stage wasn’t “building features” anymore — it was stabilization, polish, CI reliability, deployment verification, and making the repo presentable.

**Blockers / what I'm stuck on:**  
No major blockers anymore, mostly polishing and documentation cleanup before final submission.

**Plan for tomorrow:**  
Finalize remaining documentation, capture polished screenshots, and do one final production testing pass before submission.