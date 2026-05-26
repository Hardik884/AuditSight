# REFLECTION

## 1. The hardest bug I hit this week, and how I debugged it

The hardest issue I hit during the project was the Supabase schema drift problem after I refactored the onboarding flow from generic tool selection into structured vendor plans with spend, seats, and plan modeling. Initially the app worked fine when everything was temporary frontend state, but once persistence was added the backend started failing repeatedly with constraint and schema errors.

The main issue was that older assumptions about the database schema no longer matched the new audit structure. I kept getting errors like missing columns (`tool_breakdown`), null constraint failures on fields that were no longer used (`monthly_spend`, `goals`, `challenges`), and validation mismatches between Zod schemas, TypeScript types, and the actual Postgres tables.

At first I assumed the issue was just the API payload shape, so I spent time debugging the request body and route handlers. When that didn’t solve it, I started checking the generated SQL migrations and manually comparing them against the live Supabase schema. Eventually I realized the migration partially succeeded while older constraints still existed, which meant the backend was operating against a “half old, half new” schema state.

What finally worked was slowing down and tracing the full data path end-to-end:
frontend form → validation schema → API route → persistence layer → database constraints.

I manually cleaned up outdated constraints, updated the migration logic, and synchronized the persistence layer with the new audit model. That debugging cycle taught me that persistence changes are much riskier than frontend refactors because small schema mismatches cascade through the entire application.

---

## 2. A decision I reversed mid-week, and what made me reverse it

One of the biggest decisions I reversed was how much responsibility the LLM should have in the audit process.

In the earlier version of the project, I experimented with letting the AI generate recommendations directly from the user’s inputs. Initially it felt impressive because the outputs sounded smart and polished, but after testing more scenarios I realized the recommendations were inconsistent and difficult to justify financially. Two similar inputs could produce noticeably different outputs, and sometimes the AI would recommend changes without a defensible pricing reason behind them.

That became a problem because the product is fundamentally about spend optimization. If a finance person or engineering manager looked at the report, I wanted the recommendations to feel explainable rather than “AI intuition.”

Midway through development I completely reversed that direction and rebuilt the audit engine around deterministic logic instead. The pricing calculations, savings opportunities, and recommendation system became fully rule-based and tied to structured vendor pricing data. Gemini was then reduced to a much narrower role: generating executive summaries on top of already-computed findings.

That decision made the architecture more complicated in some ways because I had to build a proper pricing intelligence layer and recommendation engine manually, but it made the product feel significantly more trustworthy. In hindsight, keeping AI out of the core financial calculations was probably the most important architectural decision in the entire project.

---

## 3. What I would build in week 2 if I had it

If I had another full week, I would focus less on adding flashy features and more on turning AuditSight into a more operationally realistic SaaS product.

The first thing I would build is asynchronous audit generation using background jobs and queues. Right now the audit generation flow is still request-response based, which works for MVP scale, but if the product handled real traffic the AI summary generation and persistence layer would eventually become bottlenecks. I would likely move audit computation into worker processes and add progress tracking for report generation.

I would also improve the pricing intelligence system significantly. Currently pricing data is configuration-driven and manually maintained, which was the right choice for the MVP, but long-term I would want versioned pricing snapshots and a cleaner way to track vendor pricing changes over time.

Another thing I would improve is analytics and observability. During debugging I relied heavily on console logs and manual tracing. If the app were scaled further, I would want structured logging, request tracing, and better monitoring around failures like Gemini fallbacks, report unlock flows, and email delivery issues.

On the frontend side, I would spend more time on responsive behavior and benchmark-style insights. One feature I wanted but didn’t fully reach was showing users how their AI spend compared against similar team sizes or use cases.

Finally, I would probably add a lightweight authentication system instead of relying entirely on session-based report unlock persistence. The current flow works well for an MVP, but longer-term account-level audit history would make the product much more useful.

---

## 4. How I used AI tools

AI tools were heavily involved in the project, but mostly as accelerators rather than decision-makers.

I primarily used Claude Sonnet, Codex, and ChatGPT during development. Sonnet was most useful for large-scale refactors and understanding the codebase structure, especially when the onboarding flow and persistence layer became more complex. Codex worked well for repetitive engineering tasks like setting up tests, CI workflows, or cleaning lint issues quickly. ChatGPT was the most helpful for architectural reasoning, debugging direction, product decisions, and refining documentation.

I did not trust AI tools with the actual financial recommendation logic. That was a very intentional boundary. The core audit engine, pricing calculations, savings estimates, and recommendation rules were all implemented deterministically because I didn’t want unpredictable outputs inside the most important part of the product.

One specific time the AI was wrong was during the Gemini summary issue. Initially the AI tools kept insisting the problem was prompt engineering and suggested rewriting prompts repeatedly. But the actual issue turned out to be infrastructure/configuration related: the `thinkingBudget` setting was consuming the output token budget and truncating the responses mid-sentence. The summaries weren’t “bad” — they were literally getting cut off before completion. That debugging session reminded me that AI-generated debugging advice can sound confident while still pointing in the wrong direction.

Overall I found AI extremely useful for speed and iteration, but only when I treated it as an assistant rather than an authority.

---

## 5. Self-rating

### Discipline — 8/10
I stayed consistent throughout the week and pushed code across multiple days instead of cramming everything at the end, but I also underestimated how much time documentation and stabilization would take near the finish line.

### Code Quality — 7.5/10
I’m happy with the architecture and deterministic audit pipeline, especially after the major refactors, but there are still areas where I would clean up abstractions and improve separation of concerns if I had more time.

### Design Sense — 8/10
The frontend improved significantly after the redesign pass with Framer Motion, typography changes, and better visual hierarchy. Early versions looked too generic, but the final product feels much more polished and executive-facing.

### Problem Solving — 9/10
The strongest part of the week was probably debugging and iteration. Several issues (schema drift, Gemini truncation, App Router persistence quirks, CI failures) required stepping back, forming hypotheses, and tracing systems carefully instead of randomly patching symptoms.

### Entrepreneurial Thinking — 8.5/10
I tried to approach the project less like a college assignment and more like an actual SaaS product. Decisions around gated reports, shareable URLs, executive summaries, transactional emails, and frontend polish were all influenced by thinking about how a real user or buyer would experience the product.