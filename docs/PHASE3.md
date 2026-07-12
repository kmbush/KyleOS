# KyleOS — Phase 3 Direction (backend + infrastructure)

Implementation-facing. Resolves the decisions DESIGN.md leaves open for Phase 3 and
sets the direction the Platform Engineer and Developer follow. Locked ADRs
(ADR-001..008) are not relitigated here. New ADRs raised by this phase:
**ADR-009** (shared schema mechanism) and **ADR-010** (`fastjsonschema`), both in
DESIGN.md §5.

**Kyle's fixed constraints for this phase:**
- All Terraform + Lambda is *written and reviewed* now; **Kyle runs `terraform apply`
  himself** with his own credentials. No agent has AWS access. Design for manual apply.
- App stack region **us-west-2** (a variable). ACM cert for CloudFront stays in
  **us-east-1** via a provider alias.
- The Route 53 hosted zone **already exists**. Terraform references it through a
  **data source** (zone name is a variable) — it does not create the zone.
- ADR-006 is absolute. No account IDs, ARNs, bucket names, domains, or emails in any
  tracked file. Every value is a variable; real values live only in gitignored
  `terraform.tfvars`. Committed: `terraform.tfvars.example` with placeholders.
  `scripts/leak-check.sh` stays green.

---

## 1. Shared schema — TS ↔ Python, one source, no drift (the big one)

**Decision:** `apps/web/src/lib/schema.ts` (the `Content` interface) stays the single,
human-authored source of truth. A build step **generates** `apps/web/src/lib/schema.json`
(JSON Schema, draft-07) from it. The generated file is committed. The `PUT /content`
Lambda validates request bodies against that same `schema.json`. One authored
definition; everything else derives from it or is checked against it. See **ADR-009**.

Why this direction and not the alternatives is argued in ADR-009. In short: the
repo's cleanest artifact — the 40-line `Content` interface — is authored by a human;
the verbose machine format (JSON Schema) is generated for the machine (Python) that
consumes it. Inverting that (author JSON Schema, generate TS) would demote the
flagship artifact to a DO-NOT-EDIT generated file, and hand-maintaining both copies
cannot *prove* no-drift, which DESIGN §8 and CONVENTIONS §TypeScript require enforced.

```mermaid
graph LR
    TS["schema.ts<br/>(authored SoT)"] -->|ts-json-schema-generator| JS["schema.json<br/>(generated, committed)"]
    TS -->|tsc: example typed as Content| EX["content.example.json"]
    JS -->|fastjsonschema at cold start| L["PUT /content Lambda<br/>(validate → 400 on bad body)"]
    JS -->|python test: validate(example)| EX
    TS -.->|vitest: regen in-memory, deep-equal| JS
```

**The four proofs that keep it in sync (all CI-enforced):**

1. `npm run schema:gen` regenerates `schema.json` from `schema.ts`
   (draft-07; `additionalProperties: false` on objects; `image` optional).
2. **Drift test** (`schema.test.ts`, Vitest, node env): regenerate in memory via the
   generator's programmatic API and **deep-equal the committed `schema.json`** (compare
   parsed JSON, not bytes — Biome may reformat the file freely). Edit `schema.ts`
   without regenerating → test fails.
3. **Compile-time:** `content.example.json` is imported as `Content` in `useContent`
   (already the case). `tsc` proves the seed matches the TS type.
4. **Python test** (`services/api`): `fastjsonschema.compile(schema.json)` validates
   `content.example.json` — proves the generated schema accepts the real seed shape and
   is neither over- nor under-strict.

**How the schema reaches the Python runtime:** the `put_content` build step copies the
committed `apps/web/src/lib/schema.json` into the function package. The handler loads
it and compiles the validator **once at module scope** (cold start), not per request.
No env var, no network fetch. The committed `schema.json` is the shared contract that
ties the two packages together.

**New dependencies (both ADR'd):**
- `ts-json-schema-generator` — frontend **devDependency**, build/test only, never in the
  bundle. **MIT.** (ADR-009)
- `fastjsonschema` — Python, `put_content` Lambda only, vendored into the zip.
  **BSD-3-Clause**, pure Python, no native wheels. (ADR-010)

TanStack Query is already on the §9 approved list, so §6 wiring needs **no ADR**.

---

## 2. Terraform structure

**Right-sized: a flat root composition, plus one small module for the thing that
repeats.** A stack this size does not want a module tree — indirection would hurt the
forkability that is the point. The only genuine repetition is the three near-identical
Lambda routes, so that gets a module; every singleton (S3, CloudFront, Cognito, …)
stays flat.

```
infra/
  versions.tf        # terraform + required_providers version pins
  providers.tf       # aws (default = var.region) + aws.us_east_1 alias for ACM
  backend.tf         # backend "s3" {} — partial; filled by -backend-config from CI
  variables.tf       # every input. No defaults for account-specific values.
  terraform.tfvars.example
  main.tf            # locals + data sources (existing Route 53 zone, caller identity)
  dns.tf             # ACM cert (aws.us_east_1) + DNS validation + apex/www records
  s3.tf              # site bucket (VERSIONED) + images bucket + OAC bucket policies
  cloudfront.tf      # distribution, OAC, cache behaviors, SPA fallback, content seed
  cognito.tf         # user pool + client — self-signup off, MFA required, TOTP only
  api.tf             # HTTP API + JWT authorizer + $default stage
  lambda.tf          # 3 × module "…" { source = "./modules/lambda-fn" }
  ses.tf             # verified sender + recipient identities
  outputs.tf         # includes `runtime_config` (§4)
  modules/lambda-fn/ # function + log group + integration + route + least-priv role
```

- **Providers:** default provider region `var.region` (us-west-2). Aliased
  `aws.us_east_1` (region = `"us-east-1"`, a literal — CloudFront requires ACM there).
  The us-east-1 provider creates **only** the ACM cert and its validation. CloudFront
  references the us-east-1 cert ARN. Pass `providers = { aws = aws.us_east_1 }`
  explicitly to the cert resources.
- **State backend:** `backend "s3" {}` partial block. `bucket`, `key`, `region` come
  from `-backend-config` in CI (already wired in `deploy.yml`) — never committed.
  Recommend native S3 state locking (`use_lockfile = true`, a non-secret static setting
  that may live in `backend.tf`) rather than a DynamoDB lock table — single admin, near-zero
  contention, one fewer resource. This needs Terraform ≥ 1.10; the workflow pins 1.9.0,
  so **flag a TF version bump to the Platform Engineer** (or fall back to a lock table).
- **Variables:** all environment values are variables (domain/zone name, notification
  emails, region, etc.). `terraform.tfvars.example` ships placeholders only. `.gitignore`
  already covers `terraform.tfvars` and `*.tfstate*`.

---

## 3. Lambda approach

**Python, one function per route, one directory each** (CONVENTIONS §Backend):

```
services/api/
  put_content/     handler.py  requirements.txt  (fastjsonschema)
  post_contact/    handler.py
  post_upload_url/ handler.py
```

- **Runtime:** Python 3.13 (or 3.12), **arm64** (cheaper; safe because our only
  third-party dep is pure Python). Platform Engineer pins the exact version.
- **Dependencies / packaging:** only `put_content` needs a third-party lib
  (`fastjsonschema`). `post_contact` and `post_upload_url` use **boto3, already present
  in the Lambda runtime** — nothing to package. So:
  - `put_content`: build step `pip install --target build/ fastjsonschema`, copy
    `handler.py` + the committed `schema.json` into `build/`, then Terraform
    `archive_file` zips `build/`. **No Lambda layer, no container** — one tiny pure-Python
    dep does not justify either.
  - The other two: `archive_file` over the single `handler.py`.
- **Schema to runtime:** covered in §1 — committed `schema.json` copied into the
  `put_content` package, compiled once at cold start.
- **Env vars, set by Terraform (no secrets, ADR-006):**
  - `put_content`: `SITE_BUCKET`, `CONTENT_KEY` (=`content.json`),
    `CLOUDFRONT_DISTRIBUTION_ID`, `CONTENT_CACHE_CONTROL` (=`max-age=60`).
  - `post_upload_url`: `IMAGES_BUCKET`, `UPLOAD_PREFIX`, `PRESIGN_EXPIRY_SECONDS`,
    `MAX_UPLOAD_BYTES`, `ALLOWED_CONTENT_TYPES`.
  - `post_contact`: `SES_SENDER`, `SES_RECIPIENT` (emails — variables, never committed),
    plus any throttle params (§7).
  - No secrets anywhere; the JWT authorizer is enforced by API Gateway, not in code.

---

## 4. config.json generation

`deploy.yml` already does `terraform output -json runtime_config > dist/config.json`.
`terraform output -json <name>` prints the raw value, so the output object **is** the
file. Define the output to match `AppConfig` / `config.example.json` exactly (camelCase
keys):

```hcl
output "runtime_config" {
  value = {
    region            = var.region
    apiBaseUrl        = aws_apigatewayv2_api.this.api_endpoint  # $default stage, no path
    cognitoUserPoolId = aws_cognito_user_pool.this.id
    cognitoClientId   = aws_cognito_user_pool_client.this.id
  }
}
```

- `apiBaseUrl` is the HTTP API endpoint for the `$default` stage
  (`https://{id}.execute-api.{region}.amazonaws.com`), no stage path. The frontend hits
  `${apiBaseUrl}/content`, `/contact`, `/upload-url`.
- Keys must be **exactly** `region`, `apiBaseUrl`, `cognitoUserPoolId`, `cognitoClientId`
  — they land verbatim in the app's `AppConfig` (`lib/config.ts`).
- config.json is generated by CI and uploaded with `no-cache`; it is **not** seeded by
  Terraform. On a fresh manual `apply`, run an initial asset+config sync by hand (note
  this in the RUNBOOK) — Phase 5 automates it.

---

## 5. Read path + content lifecycle

DESIGN §6/§11 is confirmed. Points DESIGN under-specifies, called out for the builder:

- **Custom domain is optional.** `domain_name` defaults to `""`. **Empty = deploy
  CloudFront-URL-only:** no ACM certificate, no Route 53 lookup, no DNS records, and the
  distribution uses the default `*.cloudfront.net` certificate with no aliases. This is
  the correct forkable default (not every forker owns a domain) and is how Kyle's new
  stack coexists with the old live site until the Phase 6 DNS cutover — applying with a
  domain would fail (two distributions can't claim the same CNAME) and would hijack the
  live apex. Set `domain_name` to the apex (which must already be a Route 53 hosted zone)
  to attach the cert + apex/www alias records. The `aws.us_east_1` provider alias is
  simply unused while empty. The `site_url` output reports whichever URL is reachable.
- **CloudFront + OAC → private S3 site bucket.** Confirmed. Buckets are private,
  OAC-only, public access blocked; bucket policy grants the distribution via OAC.
- **SPA fallback:** custom error responses for **both 403 and 404** → `/index.html`,
  response code **200**. (S3+OAC returns 403 for a missing key when `ListBucket` is
  denied; map both.)
- **Caching — use ONE default behavior that honors origin `Cache-Control`.** Every
  object is uploaded with an explicit `Cache-Control` (hashed assets `immutable`;
  `index.html`, `config.json` `no-cache`; `content.json` `max-age=60`). A cache policy
  with min-TTL 0 that respects origin headers lets a single behavior serve all of them
  correctly — no per-path behavior needed. Do **not** use a managed policy that ignores
  origin headers.
- **S3 versioning ON (site bucket) = content history** (ADR-002). Confirmed. Optionally
  add a lifecycle rule expiring noncurrent versions of *hashed assets* to control
  clutter; keep content.json history.
- **content.json seed — the sharp edge:** Terraform seeds `content.json` from
  `content.example.json` (`Cache-Control: max-age=60`) **with
  `lifecycle { ignore_changes = all }`**. Without this, every `terraform apply` would
  overwrite Kyle's admin-edited content back to the fictional example. Terraform seeds
  it **once at create and never touches it again**; the editor (and break-glass) own it
  thereafter. The deploy workflow already excludes content.json from `s3 sync` — this
  closes the Terraform side of the same rule.
- **`PUT /content` invalidation:** after a successful S3 write the Lambda issues a
  targeted `CreateInvalidation` for `/content.json` so edits appear within seconds
  (needs `cloudfront:CreateInvalidation` on the distribution — §7).

---

## 6. Frontend wiring

Swap the bundled-example seam in `lib/useContent.ts` for a TanStack Query fetch of
`/content.json` (served by CloudFront, **same origin** — not the API). react-query is
already approved (§9); install it, add a single `QueryClientProvider` at the root. No ADR.

**New `lib/api.ts`** (the API seam; keeps fetch details out of components):

```ts
// GET the content document from CloudFront (same origin). No auth.
export async function getContent(): Promise<Content>;
```

The write path (`putContent` + `useSaveContent`) is **deferred to Phase 4**, where it
lands together with the editor and the JWT from `useAuth` that gives it a real caller.
Defining it in Phase 3 would be an unused export with a placeholder token — speculative
code the review gate blocks (CONVENTIONS §0). Phase 3's frontend change is the read path.

**Contract for the hooks:**
- `useContent(): Content` — `useQuery({ queryKey: ['content'], queryFn: getContent })`.
  **App components keep consuming a plain `Content`** (the §10 hard rule: `apps/*` render
  words, not loading states). Guarantee this by **prefetching content during boot**
  (`queryClient.ensureQueryData({ queryKey: ['content'], queryFn: getContent })`) after
  `/config.json` loads and before the shell renders — mirroring the existing config-load
  gate. The hook then returns the cached `data`; the query cache is the single source of
  truth for every rendered word. A content-fetch failure at boot shows an error state,
  not the OS.
- `useSaveContent()` — **Phase 4** (needs auth):
  `useMutation({ mutationFn: c => putContent(c, jwt), onMutate: optimistic
  setQueryData(['content']), onError: rollback })`. Optimistic with rollback per §9.
  It ships with the editor that calls it, not before.

The only frontend change in Phase 3 is the read path (`getContent` + `useContent`). Do
not build the editor, the write path, or auth here — that is Phase 4.

---

## 7. IAM — least privilege, no wildcards

One role per function. Exact actions on exact resource ARNs; **no `*` action, no `*`
resource** (CONVENTIONS §Backend). Each role also gets logs on **its own log group
ARN** only (`logs:CreateLogStream`, `logs:PutLogEvents`; log group created in Terraform).

- **`put_content`:**
  - `s3:PutObject` on `${site_bucket_arn}/content.json` **(single object ARN, not
    `/*`)**. Full-document replace, so no `GetObject` needed.
  - `cloudfront:CreateInvalidation` on the specific distribution ARN.
- **`post_upload_url`:**
  - `s3:PutObject` on `${images_bucket_arn}/${upload_prefix}/*` (prefix-scoped). The
    presigned URL inherits the role's permission, so scope it tightly to the uploads
    prefix. No `GetObject`.
  - Size/type enforcement: a presigned **PUT** cannot cap object size. DESIGN §/ADR-008
    say "presigned PUT," so default to it, namespace keys under `${upload_prefix}`, and
    enforce `Content-Type`. If a hard size cap is wanted, use **presigned POST** with a
    `content-length-range` condition — flagged as a hardening option, not mandated.
- **`post_contact`:**
  - `ses:SendEmail` on the **verified sender identity ARN** (resource-scoped), ideally
    with an `ses:FromAddress` condition = the sender. No wildcard.
- **JWT authorizer:** no IAM. API Gateway validates the token natively against the pool
  (issuer = the user-pool URL, audience = the app client ID). `put_content` and
  `post_upload_url` routes require it; `post_contact` is public.
- **Deploy / OIDC role:** a Phase 5 concern per the plan — not built here.

**Open item — contact-form rate limiting (per-IP).** DESIGN §8 says "honeypot +
per-IP rate limit." The honeypot is the real spam defense. True *per-IP* limiting needs
state or WAF, and both have tradeoffs against the sub-$2/month target:
- (a) API Gateway route/stage throttling — free, but coarse (global, not per-IP).
- (b) DynamoDB TTL token-bucket keyed by IP — effectively free at this volume, per-IP,
  a small amount of code. A narrow, justified use, distinct from the ADR-002 content
  decision.
- (c) AWS WAF rate-based rule — real per-IP, but ~$5+/month base, which **breaks the
  budget**.

**Recommendation for Phase 3:** ship **honeypot + route-level throttle (a)**; keep (b)
in reserve if abuse actually appears. This respects the cost target without pretending
the coarse throttle is per-IP. **Flag for Kyle** if he wants stronger per-IP guarantees
at launch.

---

## Open items for Kyle

1. **Contact rate-limiting** (§7): confirm honeypot + coarse throttle is acceptable for
   launch, or authorize the DynamoDB token-bucket for true per-IP.
2. **Terraform state locking** (§2): approve bumping `TF_VERSION` to ≥ 1.10 to use native
   S3 lockfile locking (no DynamoDB lock table). Otherwise the Platform Engineer adds a
   lock table.

Everything else in §13 needed for Phase 3 is resolved (see DESIGN.md §13): region
us-west-2, existing Route 53 zone by variable, owner applies manually.

---

## Direction handoff

- **Platform Engineer:** §2 (Terraform structure), §3 packaging, §4 output shape, §5
  infra behaviors, §7 IAM. Owns the *how*.
- **Developer:** §1 schema generator + drift test + Python validation test, §3 handlers,
  §6 frontend wiring. Owns execution.
- **Both:** the leak check stays green; nothing environment-specific is committed.
