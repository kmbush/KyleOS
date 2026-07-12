# KyleOS

Kyle Bush's personal portfolio, built as a small operating system: a windowed
desktop on the wide screen, an iOS-style springboard on a phone, and an
authenticated content editor behind both. The code is public because the repo is
itself a portfolio piece.

This project is under active construction, one phase at a time. The launch
README — screenshots, architecture diagram, and a fork-and-deploy guide — is
drafted in [`docs/README.draft.md`](docs/README.draft.md) and ships at Phase 6.

## Where things are

| Path | What it is |
|---|---|
| [`docs/DESIGN.md`](docs/DESIGN.md) | Architecture, decisions, content model, API contract. Source of truth. |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Six phases, worked in order. |
| [`CONVENTIONS.md`](CONVENTIONS.md) | Standards and the anti-patterns list. |
| [`reference/`](reference/) | The authoritative design spec (read-only, never imported). |
| `apps/web/` | The Vite + React SPA. |
| `services/api/` | Python Lambdas, one per route. |
| `infra/` | Terraform. |

## Develop

```bash
cd apps/web
npm install
npm run dev
```

## License

Code is [MIT](LICENSE). Fonts are self-hosted and carry their own licenses; see
[`docs/LICENSING.md`](docs/LICENSING.md). Kyle's real content lives in S3, not in
this repo — fork the OS, not the résumé.
