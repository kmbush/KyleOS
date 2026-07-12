# KyleOS — Implementation Plan

Six phases. Each ends in a working, reviewable, mergeable state.

**Every phase ends with the Code Reviewer running `docs/REVIEW_GATE.md`.** That gate is not a formality — this repo is public and is itself a portfolio piece. Working code that is not *elegant* code does not pass. Do not start a phase until the previous one is green.

`reference/KyleOS.dc.html` is the visual and behavioral spec throughout. Open it in a browser and compare side-by-side at the end of every phase.

---

## Phase 0 — Foundation

**Goal:** an empty but correctly-configured project that builds, lints, tests, and leaks nothing.

- [ ] Monorepo scaffold: `apps/web`, `services/api`, `infra/`, `docs/`, `reference/`
- [ ] Copy the three uploaded files into `reference/`: `KyleOS.dc.html`, `image-slot.js`, `HANDOFF.md`
- [ ] `apps/web`: Vite 6 + React 19 + TypeScript, **strict mode on**
- [ ] Tailwind v4; `styles/theme.css` defines **both** palettes as CSS custom properties under `[data-theme="dark"]` / `[data-theme="light"]`, exposed via `@theme`. Values come straight from `reference/HANDOFF.md`.
- [ ] **Self-host the fonts.** Download Space Grotesk (400/500/600/700) and JetBrains Mono (400/500/600) as woff2, bundle them, declare `@font-face`. **No `fonts.googleapis.com` link.**
- [ ] Biome, Vitest, Playwright configured
- [ ] `index.html`: static `<meta>`/OpenGraph tags, JSON-LD `Person` schema, `<noscript>` fallback
- [ ] `lib/schema.ts` — the `Content` interface from DESIGN.md §7
- [ ] `content.example.json` — the prototype's `defaults()` object, verbatim. **Fictional. Never replaced with real content in the repo** (ADR-002).
- [ ] `config.example.json` — the runtime config shape (ADR-006)
- [ ] `lib/config.ts` — fetch `/config.json` at boot, before render. **No `VITE_*` env vars for infrastructure config.**
- [ ] `.gitignore`: `terraform.tfvars`, `*.tfstate*`, `.env*`, `config.json`, `content.json`
- [ ] **CI leak check** — the ADR-006 grep, wired as a required job. It must fail the build.

**Done when:** build, lint, typecheck, and tests all pass on an empty shell, and the leak check is green.
**Then:** → **Review Gate.**

---

## Phase 1 — Desktop shell

**Goal:** the desktop OS experience, pixel-faithful, rendering `content.example.json` from local state.

- [ ] `useTheme` — dark default, localStorage-persisted, sets `data-theme` on root
- [ ] `useWindowManager` — window list, z-counter, icon positions; open/focus/close/minimize/maximize/drag
- [ ] **Boot sequence** — 64px moss "K" tile with glow, `booting KyleOS` caption, 180×3px bar (`bootBar` 1.4s), dismiss at 1500ms, then auto-open Help **on desktop only**
- [ ] **Wallpaper** — two radial gradients + linear gradient, plus the 30px dot-grid overlay at 0.45 opacity
- [ ] **Menu bar** (36px, blurred) — `◆ KyleOS` / File / View / Go dropdowns; right cluster: `?`, `⌕`, GitHub, LinkedIn, wifi glyph, theme toggle, live clock (ticks every 15s)
- [ ] **Windows** — drag by title bar; traffic lights (berry=close, amber=minimize, moss=maximize). **Glyphs `× − +` are `transparent` and fade in only on the individually-hovered light** — not on title-bar hover. `winIn` on open. Focus raises z-index. Maximize/restore preserves prior geometry.
- [ ] **Desktop project icons** — 60px tiles, 5px accent top stripe, draggable, double-click to open. Default layout `x: 28 + i*112, y: 52`.
- [ ] **Dock** — five apps (About, Writing, Certs, Life, Contact); hover lifts `translateY(-7px)`; open-indicator dots; minimized windows as pills after a divider
- [ ] **Ambient widgets** — clock/date card, pulsing-dot status card, rotated amber sticky-note bio, giant "KB" watermark
- [ ] **Spotlight** — ⌘K / Ctrl+K / `⌕`. Fuzzy filter over sections + projects + Toggle theme + Help. ↑/↓ navigate, Enter opens, Esc closes, hover highlights. Hotkey label adapts to OS.
- [ ] `lib/accents.ts` — the `[moss, glacier, berry, amber]` mod-4 helper. **One implementation.**
- [ ] App content components: About, Work, Writing, Certs, Life, Contact, Help, Info

**Done when:** the desktop is indistinguishable from the prototype, side-by-side.
**Then:** → **Review Gate.**

---

## Phase 2 — Mobile shell

**Goal:** the springboard experience at ≤820px.

- [ ] `matchMedia('(max-width: 820px)')` + resize listener drives shell selection
- [ ] **Status bar** (40px) — clock left; theme toggle, wifi, battery right
- [ ] **Springboard** — 4-col app grid of projects + Help; "KB" watermark sits **above** the app bar, not behind it
- [ ] **Bottom dock** — floating, rounded-30px, blurred, five fixed apps
- [ ] **App sheets** — full-screen; `‹` back chevron returns to springboard; one app at a time
- [ ] Help does **not** auto-open on boot on mobile
- [ ] Contact app shows GitHub + LinkedIn buttons beneath the form — **mobile only**

**Critical:** `apps/*` components are reused **unchanged**. If you are forking an app component for mobile, stop. The shell differs; the content does not.

**Done when:** the springboard matches the prototype and every app renders correctly in a sheet.
**Then:** → **Review Gate.**

---

## Phase 3 — Backend and infrastructure

**Goal:** real AWS infrastructure, real content API, zero hardcoded values. No auth yet.

*Kyle must answer DESIGN.md §13 before starting this phase.*

- [ ] Terraform: S3 (site, **versioned**), S3 (images), CloudFront + OAC, ACM in **us-east-1**, Route 53
- [ ] **Every value is a variable.** `variables.tf` + `terraform.tfvars.example`. No account IDs, no ARNs, no domains in tracked files.
- [ ] Remote state via `-backend-config` from CI. Never committed.
- [ ] CloudFront SPA fallback: 403/404 → `/index.html`, status 200
- [ ] `content.json` seeded in the site bucket from `content.example.json`, `Cache-Control: max-age=60`
- [ ] **Terraform outputs → `config.json`**, generated and uploaded at deploy (ADR-006)
- [ ] Terraform: Cognito User Pool — **self-signup disabled, MFA required, TOTP only, no SMS**
- [ ] Terraform: API Gateway HTTP API + JWT authorizer bound to the pool
- [ ] Lambda `PUT /content` (auth) — **validate against the schema before writing**, write S3, invalidate `/content.json`
- [ ] Lambda `POST /contact` (public) — honeypot, per-IP rate limit, SES
- [ ] Lambda `POST /upload-url` (auth) — presigned S3 PUT URL
- [ ] SES: verify sender + recipient
- [ ] IAM: least privilege per function. **No wildcards.**
- [ ] Frontend: swap local seed for `useContent()` → CloudFront `content.json`

**Done when:** the live site renders content fetched from S3, `terraform destroy && terraform apply` reproduces the whole stack from scratch, and the leak check is still green.
**Then:** → **Review Gate.**

---

## Phase 4 — Auth and the content editor

**Goal:** Kyle logs in with TOTP and edits every word on the site. No deploy required, ever again.

- [ ] `lib/cognito.ts` — SRP + Cognito's native `SOFTWARE_TOKEN_MFA` challenge via `amazon-cognito-identity-js`. **We do not implement TOTP** (ADR-003). **No Cognito types leak out of this module** — it is a replaceable seam.
- [ ] `useAuth` store — session, in-memory JWT, login step
- [ ] `#admin` gate — read `location.hash` on load and on `hashchange`
- [ ] **Login UI, matching the prototype exactly:** email + password → six auto-advancing single-char TOTP inputs → verify
- [ ] Delete the prototype's "any credentials proceed" disclaimer copy
- [ ] Tokens **in memory only.** Reload = re-auth. That is intended (ADR-003).
- [ ] **Content Editor app** — left-nav (Profile, About, Work, Writing, Certs, Life, Contact), forms for every field, add/remove on every list. **This is the primary way Kyle edits his site, forever. It is a first-class deliverable and must be as polished as the rest of the OS — not a bolted-on admin form.** Every single field in the content model is editable here. If Kyle ever has to open a terminal to change a word, this phase failed.
- [ ] Save → `useSaveContent()` → `PUT /content` with the JWT. Optimistic; roll back and surface the error on failure.
- [ ] **Replace `image-slot.js`** (ADR-008): pick file → `POST /upload-url` → presigned PUT to S3 → store the key in `content.projects[i].image`. Recreate the drop interaction; do not port the component.
- [ ] Wire the contact form to `POST /contact`. Delete the "not wired to a backend" confirmation copy.
- [ ] Create the single Cognito user by hand; register TOTP in an authenticator app
- [ ] **`docs/RUNBOOK.md`** — the break-glass procedure (ADR-004) and the MFA-reset procedure
- [ ] **Test break-glass by hand.** Edit `content.json` from the terminal, invalidate, confirm the site updates. An untested break-glass is not a break-glass.

**Done when:** Kyle authenticates with password + TOTP, changes any field, and sees it live. An unauthenticated `PUT /content` returns 401. The break-glass path has been executed successfully at least once.
**Then:** → **Review Gate.**

---

## Phase 5 — CI/CD

**Goal:** push to `main` deploys. No manual steps, no stored credentials.

- [ ] GitHub OIDC provider + deploy role, in Terraform. **No long-lived access keys.**
- [ ] PR workflow: leak check → lint → typecheck → unit → build → e2e → `terraform plan`
- [ ] `main` workflow: the above, then `terraform apply` → generate `config.json` from outputs → build → `s3 sync` → CloudFront invalidation
- [ ] Playwright in CI: boot, window drag, focus ordering, minimize/restore, Spotlight keys, theme toggle, springboard
- [ ] Deployment section added to `docs/RUNBOOK.md`

**Done when:** a merge to `main` ships to production with zero human intervention.
**Then:** → **Review Gate.**

---

## Phase 6 — Launch

- [ ] **Real content, entered through the admin editor — not committed** (ADR-002). Everything in `content.example.json` is fictional: `Senior Solutions Architect @ AWS`, `Seattle, WA`, five invented projects, `kyle@example.com`, bare `https://github.com/` links.
- [ ] Upload real project screenshots via the editor
### README — this repo is a portfolio piece, and the README is its front door

- [ ] Screenshot, architecture diagram, ADR summary, and a fork-and-deploy guide a stranger can actually follow
- [ ] **"Why this exists"** — Kyle is a systems developer turned cloud architect. He designed this in Claude Design and built it with Claude Code, and the README **says so plainly**. **Tone: short, flat, factual. Four sentences, not four paragraphs. No self-deprecation, no boasting, no signposting to other files.** State what was done and stop. The repo speaks for itself.
- [ ] **Prior art** — portfolio-as-an-OS is a well-worn genre and the README says he isn't the first. No specific project was studied, so **do not fabricate a credits list**; give an honest blanket acknowledgment plus a clear statement of what this one does differently (mobile as a separate OS shell, a real editable-content backend, the infrastructure as the point).
- [ ] **Fork it** — clone, set `terraform.tfvars`, `terraform apply`. Nothing here is tied to Kyle's account.

### Licensing — see `docs/LICENSING.md`

- [ ] `LICENSE` — **MIT**, correct year and name
- [ ] `NOTICE` — **generated from the real dependency tree** (`npx license-checker --production`), not hand-written
- [ ] **`fonts/space-grotesk/OFL.txt`** — full SIL OFL 1.1 text. **Required.** Self-hosting means distributing, which triggers attribution.
- [ ] **`fonts/jetbrains-mono/LICENSE`** — full Apache 2.0 text. **Required.**
- [ ] No copyleft (GPL/AGPL/LGPL) anywhere in the production dependency tree — **BLOCK** if found
- [ ] `package.json` declares `"license": "MIT"`
- [ ] README states the license and notes that **Kyle's content is not covered by it** — fork the OS, not the résumé

### Final

- [ ] Lighthouse: performance, a11y, best practices
- [ ] Keyboard a11y audit — every dock app, menu item, and Spotlight row reachable and operable
- [ ] Verify OG/Twitter unfurl on LinkedIn and X
- [ ] Confirm S3 versioning is on and a content rollback actually works
- [ ] Cost check against the sub-$2/month target
- [ ] **Final leak check on the full tree before going public.** Including git history.

### Cutover and retirement — see `docs/GIT_STRATEGY.md`

- [ ] New stack runs on its **own CloudFront distribution**. The old site keeps serving the domain, untouched, the whole time.
- [ ] Kyle uses the new site at its own URL for a few days — edits content, checks it on his phone.
- [ ] Lower the apex DNS TTL to 60s a day before the switch.
- [ ] **Cutover = swap the Route 53 alias records.** Rollback = swap them back. Seconds, no rebuild.
- [ ] **Flip the repo to public** after this gate passes.
- [ ] **Two weeks later:** archive (do not delete) the old repo; destroy the old infrastructure; remove dead DNS records; **confirm the old stack stopped billing.**

**Then:** → **Review Gate.** This one is the strictest. The repo goes public after it.

---

## Escalation

- **Architectural drift** — a new dependency, a new pattern, crossing a boundary DESIGN.md defines → **Architect**.
- **A decision DESIGN.md does not cover** → **Kyle**. Do not improvise on architecture.
- **A §13 open question blocking work** → **Kyle**.

Stay inside the phase. Do not build Phase 4 auth while Phase 1 windows are unfinished.
