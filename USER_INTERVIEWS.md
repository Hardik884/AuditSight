# USER_INTERVIEWS.md — User Research Notes

Three conversations I had while building and testing this. Notes taken during or immediately after. These are summaries, not transcripts.

---

## Interview 1 — RS, Engineering Lead, Series A SaaS (~40 engineers)

**Context:** Friend-of-a-friend intro. RS manages a frontend-heavy team that recently adopted both Cursor and GitHub Copilot after pressure from engineers who wanted better tooling. He agreed to a 30-minute call.

**What he said (approximate):**

> "Honestly I approved the Copilot licenses because my manager asked if we were using AI tools. That was the actual reason."

> "I don't really know who's actively using Cursor vs who installed it and forgot about it. We don't have usage tracking. Finance just sees the line item."

> "When you say 'savings estimate' — is that based on us actually canceling stuff? Because that's not a decision I make alone."

He was skeptical of any savings number. When I showed him the report format and mentioned that overlap between Cursor and Copilot was flagged as "high confidence," he got a little defensive and said the team uses them differently — Cursor for agent workflows, Copilot for completions. He's probably right that it's nuanced, but couldn't articulate what the cost justification actually was.

**Most surprising thing:** He said the real bottleneck isn't money, it's that any change to tooling requires getting engineering buy-in, and engineers hate having tools taken away even if they're not using them. "The emotional cost of telling someone their tool is going away is not worth $30 a month." That changed how I think about framing recommendations — the output should be about governance and awareness, not implying the user should cancel things immediately.

**What changed in the product:** Added more hedged language to the executive summary. Changed the copilot overlap recommendation description to note "consolidating to a single platform" rather than "cancel the secondary tool." Small but it matters.

---

## Interview 2 — MB, Indie Hacker / Solo SaaS Operator

**Context:** Found her in the Indie Hackers community. She runs a small B2B tool (probably $5–15k MRR based on what she mentioned), works alone with occasional contractors. I DM'd her after she posted about her monthly expenses.

**What she said:**

> "I use Claude for basically everything. ChatGPT is still logged in on my phone but I haven't paid for it in a couple months. I think."

> "I'd use something like this but honestly my stack is like... three tools? The audit would take ten seconds and tell me nothing useful."

> "Wait, you're saying it checks if I'm on the right plan tier? That's actually the thing I don't know. I just picked what sounded reasonable when I signed up."

She wasn't a great fit for the product as I'd been imagining it — the product is stronger for teams, not solos. But her comment about plan tier selection was interesting. She had no idea if Claude Pro was the right tier for her usage level vs Max or Team. That's a gap the product covers but I hadn't been surfacing explicitly in the UI.

**Most surprising thing:** She said she'd probably share the report link to a "founder Slack" she's in if it showed something concrete. She wasn't personally the buyer but saw herself as an amplifier. Didn't expect that — solo operators with communities are actually decent distribution nodes.

**What changed in the product:** Made the "single tool" empty state message more specific and less dismissive when someone audits a small stack with no issues. Also refined the empty state copy — the old version felt like it was telling the user they wasted their time.

---

## Interview 3 — JT, CTO, Early-Stage B2B Company (~12 people)

**Context:** Saw a tweet from him complaining about Anthropic billing being confusing. Replied, asked if he'd test something. He said sure but "I only have like 15 minutes."

**What he said:**

> "We have Anthropic API, OpenAI API, Cursor, and someone on the team is on Claude Pro personally. I think. We don't really have a policy."

> "The API spend is what kills me. I don't have a way to know what's going to hit at the end of the month. A dashboard isn't going to solve that."

> "I'm not worried about $300 a month. I'm worried about what happens when we scale and this is $3,000 a month without anyone noticing."

He wasn't that engaged with the per-tool analysis portion of the report. The seat analysis meant nothing to a 12-person team where everyone has the same access. What did resonate was the governance section — especially "API spend is accruing without defined budget guardrails." He read that line twice.

He pushed back on the consultation CTA. "I don't want to book a call. Can I just... get the report emailed and share it with my team?" That was good feedback. The value isn't in talking to me — it's in him being able to share the report internally and have it start a conversation.

**Most surprising thing:** He said he's had three "AI spending conversations" with his co-founder in the last month, and all three ended inconclusively because nobody had a shared view of what they were actually paying. The tool isn't solving a new problem — it's giving a reference artifact that lets those conversations happen.

**What changed in the product:** Doubled down on the shareable URL mechanic. Made sure the Open Graph preview looks credible enough to forward in a Slack message. The report itself is the product. The consultation CTA is secondary.
