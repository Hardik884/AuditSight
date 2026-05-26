# METRICS.md — What to Measure and Why

A quick note on framing before the metrics: this product is used infrequently by design. Someone audits their AI stack once, maybe quarterly. It's not a daily-use tool, and trying to measure it like one would produce meaningless signals. The metrics below are built around that constraint.

---

## North Star Metric

**Reports shared externally** — the count of audit report URLs that are opened by someone other than the person who generated the report.

Why this and not "audits completed"? Because completion is a vanity number if nobody acts on the output. The product's core bet is that a credible, shareable report becomes a reference artifact inside the buyer's organization — shared to Slack, forwarded to finance, sent to a co-founder. If that's not happening, the product isn't doing what it's supposed to do regardless of how many audits are run.

This metric is also a reasonable proxy for organic distribution. Every shared report is potential word-of-mouth with a concrete artifact attached.

Tracking this requires: storing a flag for each report when the public URL is fetched with a referrer or session that doesn't match the original audit session. Approximate, but directionally accurate.

---

## Three Input Metrics

**1. Audit completion rate**
Percentage of users who start the intake form and reach a completed report. Target: 55–70%. Below 40% means something in the form is losing people — probably too many steps, confusing fields, or friction around seat/spend entry. This is the first place to look if the north star is flat.

**2. Email unlock rate (report gate conversion)**
Percentage of completed audits where the user enters an email to unlock the full report. Target: 40–60%. This is the lead capture moment. If this is low, either the gated content isn't visibly valuable enough before the gate, or the form field itself is creating friction. Worth A/B testing the timing of when the gate appears.

**3. Consultation CTA click rate (among eligible reports)**
Only audits with estimated annual savings above $10,000 show the consultation CTA. Among those, what percentage of unlocked-report viewers click it? Target: 10–20%. Lower than 10% suggests either the recommendation doesn't feel credible, or the CTA copy isn't landing. Higher than 25% would be surprising — keep an eye on whether those actually convert to booked calls.

---

## Instrumentation Priorities

Right now the instrumentation is lightweight — Supabase stores audit records but there's no event tracking layer. If I were continuing to develop this, the order of priorities would be:

1. **Report sharing detection** — can't measure the north star without it. Needs a way to distinguish "same person returning to their report" from "someone new opening a shared link."

2. **Step-level funnel tracking** — knowing where people drop off in the intake form is more useful than knowing overall completion rate. Even a simple server-side log on form step progression would surface a lot.

3. **Consultation CTA exposure vs click** — currently can't tell if low consultation bookings are a visibility problem or a credibility problem. Need to know how many people see the CTA before drawing conclusions.

4. **Email delivery success rate** — Resend sends the transactional email after unlock, but right now I have no way to know if people are actually opening it or if it's going to spam. Worth tracking at some point.

---

## Pivot Thresholds

These are rough lines where I'd reconsider the direction:

- **Audit completion rate below 35% after 50+ attempts:** the form is too hard. Simplify or rethink the intake model.
- **Email unlock rate below 25% after 100+ completions:** the gate is in the wrong place, or the report isn't delivering enough visible value before the gate.
- **Zero consultation CTA clicks after 30+ eligible reports:** the consultation model is wrong — either the value prop for a call isn't clear, the price is implied too high, or the buyer isn't actually the person running audits.
- **North star (external shares) below 5% of completed audits after two months:** the report isn't compelling enough to share. Suggests either the visual quality, the specificity of findings, or the report structure needs significant rework.

The thing I'd want to avoid is treating DAU or page views as a signal of anything meaningful here. This is a low-frequency, high-intent product. Thin but engaged usage is the right shape for early traction. A lot of audits from people who never share the report and never book a call is actually worse than fewer audits from people who do both.
