# services/api

One Python Lambda per route (DESIGN §8). Each directory exports `handler(event, context)`
for an API Gateway HTTP API (payload v2). Configuration comes from environment variables
set by Terraform — no secrets in code (ADR-006).

| Directory | Route | Auth | Env vars |
|---|---|---|---|
| `put_content/` | `PUT /content` | Cognito JWT | `SITE_BUCKET`, `CONTENT_KEY`, `CLOUDFRONT_DISTRIBUTION_ID`, `CONTENT_CACHE_CONTROL` |
| `post_contact/` | `POST /contact` | none | `SES_SENDER`, `SES_RECIPIENT`, `HONEYPOT_FIELD` (optional, default `company`) |
| `post_upload_url/` | `POST /upload-url` | Cognito JWT | `IMAGES_BUCKET`, `UPLOAD_PREFIX`, `PRESIGN_EXPIRY_SECONDS`, `MAX_UPLOAD_BYTES`, `ALLOWED_CONTENT_TYPES` |

## How the schema reaches `put_content`

`put_content` validates request bodies against `apps/web/src/lib/schema.json`, the schema
generated from the TypeScript `Content` type (ADR-009). The Terraform build step copies that
committed file into the function package next to `handler.py`; the handler compiles it with
`fastjsonschema` **once per cold start** (ADR-010). `fastjsonschema` (BSD-3, pure Python) is
the only third-party dependency — `pip install -r put_content/requirements.txt --target build/`.
`post_contact` and `post_upload_url` use boto3 from the Lambda runtime and vendor nothing.

## Running the schema test

`test_schema.py` proves the generated schema accepts the real content seed.

```sh
python3 -m venv .venv && . .venv/bin/activate
pip install fastjsonschema
python3 services/api/test_schema.py   # or: pytest services/api
```

pytest is optional — the file runs standalone. `fastjsonschema` is the only test dependency.
