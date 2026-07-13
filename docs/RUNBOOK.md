# KyleOS — Runbook

Operational procedures for running KyleOS. Every snippet uses **your** values —
nothing environment-specific is committed (ADR-006). Pull the identifiers from
Terraform and export them first:

```bash
cd infra
terraform output          # site_bucket, cloudfront_id, site_url, runtime_config

SITE_BUCKET=$(terraform output -raw site_bucket)
DIST_ID=$(terraform output -raw cloudfront_id)
POOL_ID=$(terraform output -json runtime_config | jq -r .cognitoUserPoolId)
OWNER=you@example.com     # the single owner's login email
```

---

## Deploy the site (manual)

Until CI takes over (Phase 5), ship a new build by hand. `config.json` is
generated from Terraform outputs — never committed (ADR-006); `content.json` is
never synced — it is owned by the editor (ADR-002).

**Before any `terraform apply`, run `bash scripts/package-lambdas.sh`** — it builds the
`put_content` Lambda package that Terraform zips (the build dir is gitignored).

```bash
cd apps/web && npm run build
terraform -chdir=../infra output -json runtime_config > dist/config.json
aws s3 sync dist "s3://$SITE_BUCKET" \
  --exclude index.html --exclude config.json --exclude content.json \
  --cache-control "public,max-age=31536000,immutable"
aws s3 cp dist/index.html  "s3://$SITE_BUCKET/index.html"  --cache-control no-cache
aws s3 cp dist/config.json "s3://$SITE_BUCKET/config.json" --cache-control no-cache
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
```

---

## Break-glass: edit content from the terminal (ADR-004)

The editor at `/#admin` is how you change your site, always. **This is the fire
escape** for when the editor, Cognito, or a deploy is broken — owner access to
content never depends on the app, because content is a plain S3 object. Emergency
only; never the workflow. Tested before launch and it works.

```bash
aws s3 cp "s3://$SITE_BUCKET/content.json" content.json
$EDITOR content.json                       # change any field; keep it valid JSON
aws s3 cp content.json "s3://$SITE_BUCKET/content.json" --cache-control "max-age=60"
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/content.json"
```

The edit is live within seconds. The write API validates against the schema
(`schema.json`); this path does **not**, so keep the JSON valid — a malformed
document breaks the read path (the site) until you fix it the same way.

---

## Roll back content (S3 versioning)

Every save — editor or break-glass — creates a new S3 version. To roll back:

```bash
aws s3api list-object-versions --bucket "$SITE_BUCKET" --prefix content.json \
  --query 'Versions[].{Id:VersionId,When:LastModified}' --output table
aws s3api get-object --bucket "$SITE_BUCKET" --key content.json \
  --version-id <VERSION_ID> content.json
aws s3 cp content.json "s3://$SITE_BUCKET/content.json" --cache-control "max-age=60"
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/content.json"
```

---

## First-time owner setup

Self-signup is disabled — create the single owner by hand, then enroll TOTP in
the app (the AWS console cannot enroll a user's authenticator):

```bash
aws cognito-idp admin-create-user --user-pool-id "$POOL_ID" \
  --username "$OWNER" \
  --user-attributes Name=email,Value="$OWNER" Name=email_verified,Value=true \
  --message-action SUPPRESS
aws cognito-idp admin-set-user-password --user-pool-id "$POOL_ID" \
  --username "$OWNER" --password 'a-strong-password' --permanent
```

Then open `/#admin`, sign in, and the **"Set up authenticator"** step generates a
TOTP secret in your browser — add it to your authenticator app and verify. The
secret never leaves your device.

---

## Reset MFA (lost authenticator)

Clear the registered token; your next sign-in re-offers the setup step. MFA is
required, so with no token the app walks you through enrolling a fresh one — and
once enrolled the setup path is closed again.

```bash
aws cognito-idp admin-set-user-mfa-preference --user-pool-id "$POOL_ID" \
  --username "$OWNER" \
  --software-token-mfa-settings Enabled=false,PreferredMfa=false
```

## Reset password (forgotten)

```bash
aws cognito-idp admin-set-user-password --user-pool-id "$POOL_ID" \
  --username "$OWNER" --password 'a-new-strong-password' --permanent
```
