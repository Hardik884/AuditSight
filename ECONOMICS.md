# ECONOMICS.md — Unit Economics and Revenue Thinking

This is rough math. I'm not trying to back into a number — I'm trying to stress-test whether this is worth continuing past MVP.

---

## What a "Converted" Lead Is Worth

The main monetization path I can see: AuditSight generates a report. If the estimated savings is above $10,000/year (which isn't hard to reach — 20 engineers on Copilot Business + 20 Cursor Pro is already $11,400/year), a CTA appears to book a consultation. I'm calling that a consultation-recommended audit.

Assume a consulting engagement around "AI spend review and tooling rationalization" is priced somewhere between $2,000 and $6,000 depending on team size. Call it $3,500 average. That's the conversion value if the consult closes.

Alternatively, if this becomes a subscription product (a stretch from where it is now): a tool that audits quarterly for $79–$149/month per team. Over 12 months that's $1,000–$1,800 LTV. Probably needs a much larger pipeline to hit meaningful revenue at that price point.

For the math below, I'm using the consultation model since that's what the current product is built for.

---

## Funnel Assumptions

These are honest guesses, not projected with any precision.

```
Visits to audit start:        25–35% (tool is specific enough that people who land are interested)
Audit start to completion:    60–70% (multi-step form, some drop-off)
Completion to report share:   15–25% (the shareable URL is a big unknown)
Report → email unlock:        40–55% (gated report is the value moment)
Email unlock → consultation CTA shown:  ~30% (only audits with >$10k annual savings)
Consultation CTA → booking:   8–15% (this is the hardest conversion, people hesitate here)
```

So roughly: for every 1,000 visitors, 250–350 start an audit, 150–250 complete it, 60–130 unlock the report, ~30–40 see the consultation CTA, and 2–6 book. That's a rough blended conversion of 0.2–0.6% visitor-to-consultation.

At a $3,500 close value, that's $700–$2,100 revenue per 1,000 visitors.

---

## CAC by Channel

**Organic / community (Reddit, HN, Twitter):** Near zero direct cost, but time-intensive. If I value my time at $50/hr and spend 5 hours a week on distribution, that's ~$200/week. At 40 audits/week from this, the "CAC" is maybe $5 per audit start. But consult-booked-CAC is more like $200–400 depending on close rate.

**Paid (Google search, intent-based):** Search terms like "Cursor pricing for teams" or "GitHub Copilot cost per seat" probably run $1–3 CPC given low competition. At a 3% landing-to-audit-start rate and the funnel above, acquisition cost per consultation lead is somewhere in the $150–400 range. Haven't tested this. Could be worse.

**Word of mouth / share loop:** If the report URL gets shared internally and someone else books a consult — that's zero CAC. The shareable report mechanic is designed specifically to enable this, and I think it's underrated. People share "look what we found" more than people share "look at this tool I use."

---

## Rough Path to $1M ARR in 18 Months

Let me be honest: I don't think this is a "grow to $1M ARR" product in 18 months through subscriptions. It's more plausible as a consulting pipeline generator.

**Scenario A — Consulting-first**
- 18 months, 150 consultations booked
- 50% close rate → 75 engagements
- $3,500 average → $262,500 total revenue
- That's real money for a solo operator or small team. Not $1M.

**Scenario B — Subscription model (requires more product development)**
- Build the quarterly monitoring feature, add team accounts, price at $149/month
- Need ~560 paying teams sustained over 18 months
- To get 560 paying teams: probably need 3,000–5,000 total audits completed, assuming 10–15% convert to paid
- Requires real marketing budget or viral mechanics that don't exist yet

**Honest take:** $250–400k in 18 months is more realistic if I execute well on consultations. Getting to $1M requires either pricing higher, adding a recurring subscription product, or finding a B2B sales motion I haven't figured out yet. The $1M number is achievable — just not on the current product surface alone.

---

## The Bet I'm Actually Making

The bet is that AI tooling budgets are getting large enough that teams will pay someone to audit them, and that a tool generating a credible, shareable, deterministic report is a better lead-gen mechanism than a sales deck. If that's true, the economics work reasonably well even at small scale.

If the bet is wrong — if people don't actually act on AI spend reviews, or procurement is centralized in ways that make this irrelevant — the product probably doesn't have a growth path that makes sense to invest in further.
