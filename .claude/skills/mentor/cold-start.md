# Cold-start calibration (loaded by `/mentor` on first run)

`/mentor` loads this file **only** when no developer model exists yet (first
invocation) or on an explicit dev-requested **re-calibration**. It is kept out
of `SKILL.md` so the base skill stays lean. When you finish calibration, return
to the base skill (triage, or — task-free — stand by for work or a quiz).

This runs **task-free or task-grounded**. A task, when present, is an optional
grounding overlay for which probes to prioritize; it is never required.

> **The one firewall this whole procedure holds: self-report targets the probe;
> verified reasoning sets the scores.** Steps **a** and **b** are pure
> self-report — code-free, non-scoring — and write **only** the
> `developer-profile`. Step **c** is the *only* step that scores anything, and
> it scores from *demonstrated reasoning*, never from what the dev claimed. The
> firewall sits cleanly between **b** and **c**. Honesty is welcome; it is never
> load-bearing (an honest dev is still miscalibrated — novices over-rate,
> experts under-rate; a conservative evidence-based baseline is robust to both).

The `developer-profile` is owned by the **dev-model-store** MCP server
(`read_profile`, `update_profile`; once registered, `mcp__dev-model-store__read_profile`
and `mcp__dev-model-store__update_profile`). **`update_profile` never writes a
competency level** — it rejects any level/score field. Scores are written to the
developer *model* by the independent assessor, never here, never by the mentor.

---

## Step a — broad claim-gather (self-report, code-free)

Conversational and biographical. Read no repo code. The whole calibration
(steps a–c) follows skill-orientation's interview discipline: **one
substantive question per turn, wait for the answer** — each claim heard shapes
the next probe, and a bundled questionnaire collapses that contingency.

**Open with a short orientation, then one open question.** Tell the dev what
this is and what's worth including before they answer — a bare "tell me about
yourself" makes people guess at what you're after and tends to surface only
the highlights. Adapt the wording, but cover: *why* you're asking (so you can
pitch help at the right level), that *nothing here is a test or a score* and
the profile is their own private record, and that *candor about the rough
edges helps more than a polished résumé*. Something like:

> "Before we dig into any code, I'd like a quick picture of your background so
> I can pitch help at the right level — stay out of your way where you're
> strong, and slow down where something's new. This part is just a
> conversation; nothing you say here scores you, and what I jot down stays
> your private record. It helps me most if you're candid about the shaky bits,
> not just the highlights.
>
> So to start: **walk me through your background as an engineer.** The most
> useful things to hear are **how long** you've been at it overall; the
> **languages and frameworks** you've worked in, and for each roughly **how
> long, how recently, and how deeply** (shipped-and-owned vs. touched-once);
> the **domains** you've built in (ERP, fintech, manufacturing, …); the
> **roles** you've played; and an honest read of where you feel **strong**
> versus **shaky**."

That is **one** open invitation with suggested dimensions — not five separate
questions. Let them tell it their way, then drill into specifics one at a time
from there. As they talk, map the landscape:

- **years** of experience overall.
- **frameworks / languages** — for each, its **duration**, **recency** (current,
  2 years ago, …), and a one-line **depth** note.
- **domains** worked in (ERP, fintech, manufacturing, …).
- **roles** (IC, senior, lead, …).
- self-identified **strengths** and **gaps**.

As they talk, also note **analogy hooks** — prior tech that maps onto this
system's concepts ("you've used NestJS guards → we have request interceptors").
Hooks are *targeting aids* for later teaching, not credit.

Then `update_profile` with what you gathered (`years`, `frameworks`, `domains`,
`roles`, `strengths`, `gaps`, `analogy_hooks`). The profile is dev-owned, dated,
and **editable later**.

**Hard limits for step a:**
- **Never credit a level.** The profile carries no scores; `update_profile`
  rejects any attempt to write one.
- **Never credit the project axis.** "I know NestJS" must not become "knows our
  conventions" — knowing the framework ≠ knowing *our* system (the central
  cold-start trap). Framework experience is judgment-axis context and an analogy
  hook; it never touches the project axis.

## Step b — targeted claim-refinement (self-report, code-free)

Still pure self-report, still no repo code. Drill each claim from step a to
sharpen its **scope / depth / recency** — **solely so you can author better
step-c probes.** Example: "You said NestJS — did you *build* the guard/
interceptor layer, or *consume* one someone else set up?" "When did you last
write a migration by hand?"

- This step **never verifies** and **never reads the repo**. It only sharpens
  claims into **probe targets**.
- Write the sharpened claims back to the profile as `probe_targets` (status
  `unseen` until discharged). These are **lazily-verified** — discharged by the
  next relevant task or an on-demand quiz, never auto-credited.
- **Surface, here, any prior exposure to *this* project.** Whether step c
  includes a project section (c2) is decided entirely by what b surfaces. Record
  it (e.g. in `roles` / `gaps` / a probe target) so the decision is explicit.

> **The firewall closes here.** Everything above is self-report and has scored
> nothing. Everything below scores only from reasoning the dev demonstrates.

## Step c — verification quiz (the only scoring step)

A reasoning-eliciting spot-check pitched off the refined claims. **Start at the
claimed altitude — never the floor** — and step *down* to find footing (don't
make a 10-year dev prove they know an `if` statement). Run as **two
code-separated sections** so *ordering* reinforces the is/ought firewall:
**c1 (judgment, code-free) → read the code → c2 (project, repo-grounded).**

### Seeding rule (applies to everything c writes)

Whatever c demonstrates seeds the developer model **conservatively**:

- **`provisional`** confidence — within-task evidence only.
- **`level ≤ competent`** — a cold-start answer can never seed `proficient` /
  `advanced` (those need `confirmed` + breadth-of-transfer evidence).
- tagged **`cold-start`** (record it on the model row's `Gap`/`Next` or refs so
  the provenance is visible).
- A cold-start answer is **not** a confirmation-eligible demonstration — it never
  `confirms` and it never clears staleness.
- **Underrate rather than overrate** when an answer is ambiguous.

The mentor *administers* the quiz; the **independent assessor verdicts and
writes the model** via `update_model` at wrap-up — the mentor does not call
`update_model`. (For a standalone calibration with no task to wrap up, you may
seed the model directly via `update_model` *only after* establishing reasoning,
still under the seeding rule above; prefer letting the assessor verdict when a
session has a diff to read.) Capture each probe exchange with `append_exchange`
exactly as in the base skill (a quiz exchange is still a scaffolding exchange:
its `move`, `self_tag`, `claim`, `provenance`).

### c1 — judgment axis, *code-free* (runs first, always)

Authored **from the dev's own a+b claims and `probe_targets`** — not from a
pre-baked bank. Pitch each probe at the claimed altitude and step down to find
footing. The probes' **answers are sourced from external references, never this
repo** (the is/ought firewall); write down what a sound answer contains
*before* you score it.

Two examples — these show the **shape**, the subject is incidental; do **not**
reach for these concepts, author yours off what the dev actually claimed:

> *(developing-band, judgment)* "You've got two functions that are 80%
> identical. Walk me through how you decide whether to extract the shared part
> or leave them separate." — *looking_for: reasons about coupling the shared
> abstraction introduces vs. the cost of divergence; resists reflexive DRY;
> names what would make the duplication worth keeping.*
>
> *(competent-band, correctness/safety)* "A request hands you a user id and a
> role string. Which do you trust, and how do you treat the rest?" —
> *looking_for: trusts neither from the client; authenticates identity and
> derives authorization server-side; validates/normalizes all input at the
> boundary.*

Each probe targets a distinct claimed competency; the band steps to the dev's
claimed altitude.

- **Read no repo code in c1.** Judgment is transferable, so the repo's code is a
  confound here and a code-as-ought anchor — zero benefit, real risk.
- Before scoring, `read_concepts` and **reuse** an existing concept key when its
  `gloss` honestly covers the same skill; `register_concept` (kebab-case, with a
  short `gloss`) a concept your probes target that is genuinely distinct or isn't
  already present — when it's a toss-up, coin rather than force-fit, since a
  wrongly-merged key silently inflates the model. The gloss is what lets the next dev's
  calibration and the assessor reuse the key instead of coining a near-duplicate
  — `update_model`'s auto-registration coins a bare key, so register
  deliberately here. The keys you coin here are judgment-axis. This is how the
  registry seeds: from the claims in front of you, pitched at this dev (a
  junior's starting vocabulary and a senior's differ), never from a fixed list.
- Score from the **reasoning the dev produces**, under the seeding rule.

### — read the code —

*Only now* read the repo to inform the project probes: conventions, the ADRs
(`docs/tools/adr/`), `docs/CONTEXT.md` and per-app `CONTEXT.md` files, and
representative code. This read is **descriptive only** — it selects and grounds
*what* to probe, **never** *what counts as correct*. The documented standard
(docs/ADRs/rules) is the answer key; **code that diverges is deficient, not the
answer.** You may delegate this read to a subagent to keep context clean, but
the **ordering — c1 before any code read — is the load-bearing defense**, not
the delegation.

### c2 — project axis, *repo-grounded* (runs only if b surfaced prior exposure)

- **If step b surfaced no prior exposure to this project → skip c2 entirely.**
  The project axis stays **empty** (a zero here is *unseen*, not a gap — it fills
  from the dev's first scaffolded tasks). The genuinely-new dev's calibration is
  c1-only.
- **If b surfaced prior project exposure → run c2.** Probe this system's
  conventions / vocabulary / invariants **against the documented standard**.
  Score the project axis `provisional`, under the seeding rule. Same firewall:
  framework experience never credits the project axis — only demonstrated
  knowledge of *our* conventions does.

### Calibration notes

Record the **claimed-vs-demonstrated delta** in the profile's
`calibration_notes` via `update_profile` (e.g. "claimed advanced on testing;
demonstrated competent" — Dunning-Kruger / inflater / under-confidence signal).
This is profile data (targeting), not a score.

---

## Dev-controlled quiz length (the filtering invariant)

This governs **each section** (c1 and, when it runs, c2). Because c2's probes
exist only after the code-read, the preview/trim happens **per section** — a
genuinely-new dev (c1 only) gets **one** budget moment.

1. **You author as many candidate probes as you judge warranted — no generation
   cap — and lean generous: start with more, not fewer.** Every claim left
   unprobed stays `unseen` in the model, so under-probing silently under-credits;
   the dev can always trim. But each probe must earn its place by covering a
   **distinct** claim or facet — a second probe on an already-covered claim is
   padding, a probe on an untouched claim is coverage. Generous for coverage,
   never padded for length.
2. **State the count** to the dev: "I have N probes that would cover your claims;
   we can do all N, trim to fewer, or add more."
3. **The dev's only lever is the count.** They may say "trim to 20" or "give me
   more." They do **not** choose *which* questions and do **not** set difficulty.
4. **You always choose which probes are kept** — selecting to maximize
   diagnostic coverage across the claims — and **you own difficulty.**
5. **Trimming reduces evidence → more conservative results.** Claims a trimmed
   quiz never probes are left **`unseen`** in the model — **never credited as
   passed.** Tell the dev this is the cost of trimming, in plain language.
   Expanding adds evidence. **Neither lever can inflate a level** — that is what
   keeps self-report non-load-bearing even while the dev steers.

---

## Dev-requested quiz, anytime (same machinery) — D12 / D13 / UAT-12

A dev can request a quiz at **any** time, not just at cold-start. It reuses the
**same machinery** as cold-start step c: the same probe authoring (off claims
and profile probe targets), the same
**dev-controlled length lever** (the filtering invariant above — you state the
candidate count, the dev trims/expands the *count only*, you always pick *which*
probes and own difficulty, trimmed-away claims stay `unseen`), and the same
capture (`append_exchange` per probe exchange, with `move` / `self_tag` /
`claim` / `provenance`). A self-requested quiz is itself **valuable retrieval
practice** (doctrine rule 6), independent of what it moves on the model.

### What its evidence may move — and what it may not

A dev-requested quiz is a **within-task / out-of-task retrieval** event, *not* a
real-task recurrence. So its reasoning evidence:

- **moves a `provisional` read only** — it can sharpen the provisional Level
  estimate (up *or* down — it cuts both ways: a weak answer pulls the read down
  just as a strong one supports it), within the cold-start seeding rule.
- **never `confirms`** — it is not a confirmation-eligible demonstration; only
  recurrence on an **independent, later real task** promotes `provisional →
  confirmed` (D10). Quiz answers are not distinct task refs.
- **never exceeds the `competent` cap** — the Goodhart guard. Optimizing
  quiz-able "owned" counts would measure *apparent*, not durable, learning; the
  cap is what makes a self-requested quiz safe to take freely.
- **does not clear staleness** — a long-`provisional` concept stays a stale /
  re-test candidate after a quiz; **only recurrence on a real task** discharges
  it. (Staleness is surfaced only at mentor triage, never here.)

These are not yours to police by hand — they are `update_model`'s hard
write-invariants (`provisional ⇒ level ≤ competent`; `confirmed ⇒ ≥2 distinct
task refs`). The quiz produces evidence; the floor is enforced downstream.

### Mentor-administered, assessor-verdicted (the global invariant)

Like every quiz in this system, a dev-requested quiz is **mentor-administered
and assessor-verdicted**. You author and run the probes and `append_exchange`
each one — that is the evidence-log material. You do **not** `update_model` on a
dev-requested quiz: spawn the **independent assessor** (per
`.claude/skills/mentor/assessor.md`) over the resulting evidence-log material so
it issues the verdict and writes the provisional-only move, exactly as at
task wrap-up. (The narrow exception in step c — seeding the model directly on a
*standalone first-run calibration* with no diff to read — does **not** extend to
the anytime quiz: a model already exists, so let the assessor verdict.) This
keeps the firewall intact — the mentor never grades, including on a quiz it ran.

### Flagged concepts are pitched first — never imposed (D13)

When you pitch a dev-requested quiz, **prioritize concepts the assessor flagged
`owned-vs-assisted unresolved`** on the model's `Next` field (read them via
`read_model`). Flagging-and-deferring is how the non-interactive assessor
discharges an unresolved owned-vs-assisted concept (D13); pitching those first
means a flag is **not hostage to real-task recurrence alone** — the dev's next
quiz can resolve it.

But the dev initiates: you may **surface that flagged concepts exist** and that
a quiz would help, in plain language — you **never impose** a quiz. All quizzes
are dev-initiated. The dev decides whether and when; you administer when asked;
the assessor still issues the verdict on the evidence-log material.
