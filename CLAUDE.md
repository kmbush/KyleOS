# KyleOS

Kyle's personal portfolio, reimagined as a tiny operating system. Full rewrite of the existing site.

**This repository is public and is itself a portfolio piece.** Engineers evaluating Kyle will read this code. Write it accordingly.

---

## Read these first, in order

1. **`docs/DESIGN.md`** — architecture, decisions and their reasoning, content model, API contract. Source of truth.
2. **`docs/IMPLEMENTATION_PLAN.md`** — six phases. Work them in order.
3. **`CONVENTIONS.md`** — standards, and the anti-patterns list.
4. **`docs/REVIEW_GATE.md`** — what the Code Reviewer checks at the end of every phase.
5. **`docs/GIT_STRATEGY.md`** — branching, PR flow, cutover, and how the old site is retired.
6. **`reference/`** — the design spec. See below. **This is not optional reading.**

---

## The design spec — read these files, do not guess

Kyle designed KyleOS in Claude Design. The output is in `reference/`, and it is the **authoritative spec** for how the site looks and behaves:

| File | What it is |
|---|---|
| **`reference/KyleOS.dc.html`** | **The spec.** A complete, working, high-fidelity prototype. |
| `reference/image-slot.js` | The prototype's drag-and-drop image slot. Reference only — **not shipped** (ADR-008). |
| `reference/HANDOFF.md` | The designer's own notes: exact tokens, chrome, screens, behaviors. |

**Read all three before writing a single component.** Open `KyleOS.dc.html` in a browser and *use* it — drag a window, hit ⌘K, toggle the theme, resize to mobile. Everything in it is deliberate.

**Re-implement it. Do not transpile it.** The prototype runs on a bespoke runtime (`<x-dc>`, `sc-for`, `sc-if`, `class Component extends DCLogic`) that does not exist here. Its inline styles are a constraint of that runtime, not a design decision — lift them into CSS variables and Tailwind.

**The finished site must look and interact *exactly* as the prototype does.** Colors, type, spacing, radii, shadows, animation curves, easing, timings, copy, hover states, keyboard behavior. All of it is final. Any deviation is a BLOCK unless Kyle approved it explicitly.

Compare side-by-side against the prototype at the end of every phase. That comparison is part of the review gate.

---

## The bar: elegance is a requirement, not a preference

**Working is the floor. The code itself is the deliverable.**

- Simple. Elegant. Minimal. Well-documented. Readable by a human on first pass with no walkthrough.
- Every line earns its place, or it is deleted.
- Cleverness is a defect. Write the obvious thing.
- No speculative abstraction, no dead code, no framework-of-the-week.
- If you can't explain a piece of code in one sentence, it's too complicated.

**The Code Reviewer runs `docs/REVIEW_GATE.md` at every phase boundary and blocks on craft failures, not just bugs.** Code that works but is bloated, clever, or unreadable **does not pass the phase.**

---

## Locked decisions — do not relitigate

- **Vite SPA, not Next.js** (ADR-001).
- **Content is a single JSON object in S3, never committed to git** (ADR-002). Yes, this deviates from the usual DynamoDB default. It is deliberate.
- **Cognito's built-in TOTP MFA, with our own login UI** (ADR-003). We do not implement 2FA — Cognito does. We render the boxes.
- **The content editor is how Kyle edits his site — always** (Phase 4). Log in at `#admin`, edit any field in a form, save, live. No deploy, no git, no terminal. It is a first-class deliverable, not an admin afterthought.
- **The owner can never be locked out** (ADR-004). Because content is a plain S3 object, `aws s3 cp` exists as an emergency path if the editor or Cognito ever breaks. **Emergency only — never the workflow.**
- **`#admin` is not the security boundary — the API is** (ADR-005).
- **Zero environment-specific values in the repo** (ADR-006). This must be forkable.

Think one of these is wrong? Say so, with specific reasoning, and escalate. **Do not quietly build something else.**

---

## Non-negotiables

- **Nothing environment-specific in version control.** No account IDs, ARNs, bucket names, pool IDs, endpoints, domains, or personal emails. Frontend config comes from `/config.json` at runtime, generated from Terraform outputs. CI greps for leaks and fails the build.
- **No real content in the repo.** `content.example.json` is fictional. Kyle's actual bio and projects live in S3 and are entered through the admin editor.
- **Self-host the fonts.** No Google Fonts link.
- **Validate content server-side before writing.** A bad `PUT` bricks the site.
- **Least-privilege IAM. No wildcards.**
- **No long-lived AWS keys.** GitHub Actions uses OIDC.
- **JWT in memory, never `localStorage`.**
- **The dependency list is closed.** A new dep requires an ADR.

---

## Working style

- Stay inside the current phase. Finish it, pass the gate, then move on.
- **One branch per phase** (`phase/N-slug`), PR into `main`, **squash merge**. Never push to `main` directly. The Review Gate is the merge criterion. See `docs/GIT_STRATEGY.md`.
- **The repo is private now and goes public at Phase 6.** Flipping to public exposes the *entire* history retroactively — so never commit an environment value, not even temporarily. "I'll clean it up later" is how repos leak.
- Small, reviewable units of work.
- Tests alongside code, not after.
- Architectural drift → escalate to the **Architect**. A decision the docs don't cover → escalate to **Kyle**. Never improvise on architecture.

---

## Open questions blocking Phase 3

Domain name and AWS account/region are unanswered — see DESIGN.md §13. They do not block Phases 0–2. **Ask Kyle before starting Phase 3.**
