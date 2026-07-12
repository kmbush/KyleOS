# Partial backend: bucket, key, and region are supplied by -backend-config from CI
# and never committed (ADR-006). use_lockfile uses S3's native conditional-write
# locking instead of a DynamoDB table — one admin, near-zero contention, one fewer
# resource (PHASE3 §2). These two settings are non-secret and safe to commit.

terraform {
  backend "s3" {
    use_lockfile = true
    encrypt      = true
  }
}
