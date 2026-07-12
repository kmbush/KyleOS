# KyleOS — Review Gate

**The Code Reviewer runs this at the end of every phase. A phase is not done until it passes.**

This repo is public and is a portfolio piece. The code is part of the work being shown. Working is the floor, not the bar.

Report findings as **BLOCK** / **WARNING** / **SUGGESTION**. Craft failures below are **BLOCK**, not suggestions — that is the whole point of this gate.

---

## 1. Elegance — the primary gate

For every file touched in this phase:

- [ ] **Could this be simpler?** If yes, it is not done. Fewer files, fewer functions, fewer lines, fewer concepts.
- [ ] **Does every line earn its place?** Delete anything that does not.
- [ ] **Is it readable on first pass, with no walkthrough?** A competent engineer who has never seen this repo should follow it top to bottom.
- [ ] **Is it clever?** Cleverness is a defect here. Rewrite it as the obvious thing.
- [ ] **Is anything speculative?** No abstraction for a second use case that does not exist. No config for a scenario nobody asked for. No hooks for a future that may not come.
- [ ] **Is anything duplicated?** Especially accent cycling, schema shape, and theme tokens — each has exactly one definition.
- [ ] **Do names say what things are?** No `data`, `handleThing`, `utils.ts`, `helper`, `manager` (except the window manager, which is literally one).
- [ ] **Is there dead code?** Commented-out blocks, unused exports, unreachable branches, unused deps in `package.json`. Delete.

## 2. Documentation

- [ ] Every module has a one-line header saying what it is for. Not what it does — the code says that.
- [ ] Comments explain **why**, never **what**. A comment restating the code is a defect.
- [ ] Non-obvious decisions carry a short comment pointing at the relevant ADR.
- [ ] Public functions have types that make a docstring unnecessary. If they don't, fix the types.
- [ ] `README.md` is accurate. Someone can clone and deploy from it alone.

## 3. Fidelity to the design

- [ ] Open `reference/KyleOS.dc.html` in a browser. Open the build. **Compare side-by-side.**
- [ ] Colors, type, spacing, radii, shadows: identical.
- [ ] Animation curves and timings: identical (`winIn` .25–.28s, `menuIn` .16s, `bootBar` 1.4s, boot dismiss 1500ms, `pulse` 2.4s).
- [ ] Interactions: identical. Drag, focus ordering, minimize/restore geometry, Spotlight keyboard nav, hover states.
- [ ] Traffic-light glyphs (`× − +`) are transparent and fade in **only on the individually hovered light** — not on title-bar hover.
- [ ] Copy is identical, including the sticky note and Help legend.
- [ ] **Any deviation from the prototype is a BLOCK unless Kyle approved it explicitly.**

## 4. Open-source hygiene (ADR-006)

- [ ] The grep test passes:
  ```bash
  grep -rniE 'AKIA|[0-9]{12}|arn:aws|execute-api|amazonaws\.com|us-[a-z]+-[0-9]' \
    --exclude-dir={node_modules,.git,dist,reference} --exclude='*.example.*' .
  ```
- [ ] No account IDs, ARNs, bucket names, distribution IDs, pool IDs, endpoints, domains, or personal email addresses in tracked files.
- [ ] No real content committed. `content.example.json` is fictional (ADR-002).
- [ ] `.gitignore` covers `terraform.tfvars`, `*.tfstate*`, `.env*`, `config.json`, `content.json`.
- [ ] **Could a stranger fork this, set their own variables, and deploy?** If not, something is welded to Kyle's account.

## 5. Security

- [ ] No secrets, keys, or credentials anywhere.
- [ ] `PUT /content` validates against the schema **before** writing. A malformed write bricks the site.
- [ ] JWT is in memory. Not in `localStorage`, not in a cookie, not in a global.
- [ ] IAM is least-privilege. **No wildcard actions. No wildcard resources.** No exceptions without a written justification in the module.
- [ ] S3 buckets are private, OAC-only. Not public.
- [ ] Encryption at rest and in transit.
- [ ] No long-lived AWS keys. OIDC only.
- [ ] Input validation on every public endpoint.
- [ ] Nothing sensitive in logs.

## 6. Architecture

- [ ] Matches `docs/DESIGN.md`. Structural divergence → **escalate to the Architect**, do not decide it yourself.
- [ ] No new dependency outside the closed list in DESIGN.md §9. A new dep without an ADR is a BLOCK.
- [ ] No `apps/*` component forked per shell. `AboutMobile.tsx` existing is a BLOCK.
- [ ] Server state in TanStack Query, shell state in Zustand. No content in Zustand.
- [ ] No Cognito types leak out of `lib/cognito.ts` (ADR-003 keeps that seam replaceable).
- [ ] No router installed.

## 7. Tests

- [ ] Tests exist for logic that can break: stores, accent cycling, schema validation, fuzzy search.
- [ ] Playwright covers the interactions: drag, focus order, minimize/restore, Spotlight keys, theme toggle, boot, springboard.
- [ ] Tests test behavior, not implementation.
- [ ] No trivial tests. Do not test that React renders.
- [ ] A test harder to read than the code it tests is a defect. Simplify it.

---

## 8. Licensing (Phase 6, but check any phase that adds a dependency)

- [ ] Every new production dependency is permissively licensed (MIT / Apache 2.0 / BSD).
- [ ] **Any copyleft dependency (GPL / AGPL / LGPL) is a BLOCK.** Incompatible with shipping MIT.
- [ ] Fonts are self-hosted **and their full license texts ship alongside them** — SIL OFL 1.1 for both Space Grotesk and JetBrains Mono. Self-hosting means distributing, which triggers attribution. This is the most commonly missed item in the repo.
- [ ] `NOTICE` is generated from the real dependency tree, not hand-written.

See `docs/LICENSING.md`.

---

## Sign-off

A phase passes only when every box above is checked. If the code works but section 1 fails, **the phase does not pass.** Say so plainly, list what needs to change, and hand it back.
