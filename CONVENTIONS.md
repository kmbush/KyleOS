# KyleOS — Conventions

## 0. The rule that outranks the others

**This repository is public. It is a portfolio piece. The code is part of the work being shown.**

Simple. Elegant. Minimal. Well-documented. Readable by a human on first pass with no walkthrough.

- Every line earns its place, or it is deleted.
- Cleverness is a defect. Write the obvious thing.
- No speculative abstraction. Build for the requirement in front of you, not the one you imagine.
- The smallest implementation that fully meets the need wins.
- If you cannot explain a piece of code in one sentence, it is too complicated.

**The Code Reviewer enforces this at every phase boundary via `docs/REVIEW_GATE.md`. Working is the floor, not the bar.**

---

## Stack — closed list

React 19 · TypeScript (strict) · Vite 6 · Tailwind v4 · Zustand · TanStack Query · Biome · Vitest · Playwright
Python Lambdas · API Gateway HTTP API · S3 · CloudFront · Cognito · SES · Terraform

**Adding a dependency requires an ADR.** Not a preference — an ADR, in `docs/DESIGN.md`, with what was rejected and why.

---

## Structure

```
apps/web/src/
  shell/
    desktop/    MenuBar · Dock · DesktopIcons · Window · Spotlight · AmbientWidgets · Watermark
    mobile/     StatusBar · Springboard · AppSheet
    Boot.tsx
  apps/         About · Work · Writing · Certs · Life · Contact · Help · Info · Editor
  auth/         LoginGate · CredsStep · TotpStep
  stores/       useTheme · useWindowManager · useAuth
  lib/          config.ts · accents.ts · cognito.ts · api.ts · schema.ts
  styles/       theme.css
services/api/   one directory per Lambda
infra/          Terraform
docs/           DESIGN.md · IMPLEMENTATION_PLAN.md · REVIEW_GATE.md · RUNBOOK.md
reference/      KyleOS.dc.html · image-slot.js · HANDOFF.md   (read-only spec — never imported)
```

---

## Nothing environment-specific in the repo

No account IDs, ARNs, bucket names, distribution IDs, Cognito pool or client IDs, API endpoints, domains, or personal email addresses. Anywhere. Ever.

| Layer | Where config comes from |
|---|---|
| Frontend | `/config.json`, fetched at boot. **Not `VITE_*` env vars.** |
| Terraform | `variables.tf` + gitignored `terraform.tfvars` |
| Terraform state | `-backend-config` from CI |
| GitHub Actions | repo variables and secrets |
| Lambda | environment variables set by Terraform |
| Content | S3. Never git. |

Committed: `config.example.json`, `terraform.tfvars.example`, `content.example.json`. Nothing else.

**A stranger must be able to fork this, set their own variables, and deploy.** If they can't, something is welded to Kyle's account and it is a bug.

CI runs the leak check on every push. It fails the build.

---

## Styling

- **Every color, spacing, and radius value comes from a CSS custom property.** Never hardcode a hex or an `oklch()` in a component.
- Themes are `[data-theme="dark"]` / `[data-theme="light"]` on the root. Both palettes in `styles/theme.css`.
- **Do not port the prototype's inline styles.** They were a constraint of the prototyping runtime, not a design choice. Lift them into Tailwind and CSS variables.
- Fonts are **self-hosted woff2**. No `fonts.googleapis.com`.
- Accent cycling (`moss → glacier → berry → amber`, index mod 4) lives in `lib/accents.ts`. **One implementation.** Never inline it.

---

## React

- Function components and hooks. No classes.
- **Zustand for shell state** (theme, windows, auth). **TanStack Query for server state** (content). Never store server data in Zustand.
- Components are presentational. Logic lives in stores and hooks.
- No router. `#admin` is read from `location.hash`.
- **`apps/*` components are shell-agnostic** — identical inside a desktop `Window` or a mobile `AppSheet`. **Never fork an app component per shell.**

## TypeScript

- `strict: true`. No `any`. No non-null assertion without a comment justifying it.
- `lib/schema.ts` is the single source of truth for the content shape. Frontend types and Lambda validation both derive from it. **Do not maintain two copies that will drift.**

## Backend

- Python. One Lambda per route, one directory each.
- **Validate `PUT /content` against the schema before writing.** A malformed write bricks the site.
- IAM is least-privilege. **No wildcard actions. No wildcard resources.** No exceptions without a written justification in the module.
- No secrets in code, in Terraform, or in state. Environment variables and SSM only.

## Comments and docs

- Every module opens with a one-line header saying **what it is for**. Not what it does — the code says that.
- Comments explain **why**, never **what**. A comment restating the code is a defect.
- Point at the ADR when a decision looks surprising: `// tokens stay in memory — ADR-003`
- If a function needs a paragraph to explain, the function is wrong. Fix the function.

## Testing

- Vitest for logic: stores, accents, schema validation, fuzzy search.
- Playwright for interaction: window drag, focus ordering, minimize/restore, Spotlight keys, theme toggle, boot, springboard.
- Test behavior, not implementation. Skip trivial tests.
- A test harder to read than the code it tests is a defect.

## Git

See `docs/GIT_STRATEGY.md` for the full flow.

- **One branch per phase**: `phase/N-slug`. Short-lived. PR into `main`, **squash merge** — one commit per phase.
- **Never commit to `main` directly.** Branch protection is on.
- **A PR merges only after the Review Gate passes.** The gate is the merge criterion.
- Conventional commits: `feat:` `fix:` `chore:` `docs:` `refactor:` `test:`
- **This repo goes public.** Flipping private → public exposes the entire history retroactively. Never commit a secret, an environment value, or real content — not even temporarily, not even "to clean up later."

---

## Anti-patterns — every one of these is a BLOCK

- ❌ **Transpiling `KyleOS.dc.html`** instead of re-implementing it. It is a *spec*, not source.
- ❌ **Deviating from the prototype's look or behavior** without Kyle's explicit sign-off.
- ❌ **Shipping `image-slot.js`.** Prototype dependency. Real uploads use presigned S3 URLs.
- ❌ **Linking to Google Fonts.**
- ❌ **Hardcoding a color** instead of using a CSS variable.
- ❌ **Any account ID, ARN, endpoint, bucket name, or domain in a tracked file.**
- ❌ **Committing real content.** It lives in S3.
- ❌ **JWT in `localStorage`.** Memory only.
- ❌ **Long-lived AWS access keys.** OIDC only.
- ❌ **A new dependency without an ADR.** No router, no CSS-in-JS, no component library, no Amplify.
- ❌ **`AboutMobile.tsx`** or any per-shell fork of an app component.
- ❌ **Cognito types leaking out of `lib/cognito.ts`.** That seam stays replaceable.
- ❌ **reCAPTCHA**, or any Google or Microsoft dependency.
- ❌ **Dead code, commented-out blocks, unused exports, speculative abstraction.**
