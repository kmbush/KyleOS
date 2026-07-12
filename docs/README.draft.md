# KyleOS

My personal site, built as a small operating system.

Windowed desktop, dock, menu bar, Spotlight, a boot sequence. On a phone it isn't a collapsed webpage — it's a different OS: an iOS-style springboard with full-screen app sheets. Same content, same system, two shells.

Everything you see is editable at runtime through an authenticated admin panel. There is no deploy step to change a word.

**[live site]** · **[screenshot]**

---

## Why this exists

Yes, it's another portfolio-as-an-operating-system. There are many like it. This one is mine.

I'm a systems developer turned cloud architect. I've wanted to build something like this for a long time.

I designed it in Claude Design and built it with Claude Code. I made the architectural decisions; the model did most of the typing.

It's built the way I'd build anything I had to run.

I hope you enjoy it.

---

## Prior art

Portfolio-as-an-operating-system is a well-worn genre and I'm not the first. I didn't study anyone else's implementation — I designed this from scratch — so I can't credit specific projects honestly, and I'd rather say that than list names I didn't learn from. But the genre got here before I did.

A couple of things I wanted that I hadn't seen:

- **Mobile is a different operating system, not a collapsed page.** Desktop is a windowing environment; on a phone it's a springboard with full-screen sheets. The content components are identical — only the shell changes.
- **The content is real.** It lives in S3, is edited through an authenticated panel, and is versioned. Updating it doesn't require a deploy.

---

## Architecture

[diagram]

**Read path** — Browser → CloudFront → S3. No Lambda, no database, no cold start.
**Write path** — Cognito (SRP + TOTP) → JWT → API Gateway → Lambda → S3 → CDN invalidation.

| | |
|---|---|
| **Frontend** | React 19 · TypeScript · Vite 6 · Tailwind v4 · Zustand · TanStack Query |
| **Backend** | Python Lambdas · API Gateway HTTP API · SES |
| **Storage** | S3 (versioned) · CloudFront |
| **Auth** | Cognito · TOTP MFA required · self-signup disabled |
| **Infra** | Terraform · GitHub Actions · OIDC (no stored AWS keys) |

Full reasoning in [`docs/DESIGN.md`](docs/DESIGN.md). The decisions I'd most expect pushback on:

- **[ADR-001]** Vite SPA, not Next.js. There is nothing to server-render behind a boot screen.
- **[ADR-002]** Content is a single S3 object, not DynamoDB. One document, read constantly, written monthly.
- **[ADR-004]** I cannot be locked out of my own site. The editor is the front door; `aws s3 cp` is the fire escape.
- **[ADR-006]** Zero environment values in version control. This repo is not welded to my AWS account.

---

## Fork it

Nothing here is tied to me. Config is fetched at runtime from `config.json`, generated from Terraform outputs at deploy. My actual content lives in S3 and is not in this repo — what ships is `content.example.json`, which is fictional.

```bash
git clone <this repo>
cp infra/terraform.tfvars.example infra/terraform.tfvars   # your domain, your account
cd infra && terraform apply
```

Then log into `/#admin` and make it yours.

Full guide: [`docs/RUNBOOK.md`](docs/RUNBOOK.md).

---

## License

**Code: [MIT](LICENSE).** Take it, change it, ship it. No attribution required, though I'd love to see what you build.

**Fonts** are third-party and carry their own licenses, included in full:

| Font | License |
|---|---|
| [Space Grotesk](https://github.com/floriankarsten/space-grotesk) | SIL Open Font License 1.1 — [`fonts/space-grotesk/OFL.txt`](fonts/space-grotesk/OFL.txt) |
| [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) | SIL Open Font License 1.1 — [`fonts/jetbrains-mono/OFL.txt`](fonts/jetbrains-mono/OFL.txt) |

Both are self-hosted rather than loaded from a CDN. See [`NOTICE`](NOTICE) for all third-party attributions.

**My content** — bio, project write-ups, screenshots — is not in this repository and is not covered by the MIT license. Fork the OS, not my résumé.
