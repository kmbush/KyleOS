# Shared locals and data sources. The Route 53 zone already exists and is looked up,
# never created (PHASE3 §2). Bucket names embed the account ID for global uniqueness
# without committing a name (the account ID lives only in state, not the repo).

locals {
  tags = {
    Project   = var.project_name
    ManagedBy = "terraform"
  }

  # A custom domain is optional. Empty domain_name = deploy CloudFront-URL-only, with
  # no ACM cert and no DNS — the correct default for a forker without a domain, and
  # (for now) how Kyle's new stack coexists with the old live site until the Phase 6
  # DNS cutover (GIT_STRATEGY).
  has_domain = trimspace(var.domain_name) != ""
  www_domain = "www.${var.domain_name}"

  # CORS origin: the custom domain(s) when set, else the CloudFront URL.
  allowed_origins = local.has_domain ? [
    "https://${var.domain_name}", "https://${local.www_domain}"
  ] : ["https://${aws_cloudfront_distribution.site.domain_name}"]

  site_bucket_name   = "${var.project_name}-site-${data.aws_caller_identity.current.account_id}"
  images_bucket_name = "${var.project_name}-images-${data.aws_caller_identity.current.account_id}"

  repo_root = "${path.module}/.."
}

data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

# Looked up only when a custom domain is configured; the zone must already exist.
data "aws_route53_zone" "primary" {
  count = local.has_domain ? 1 : 0
  name  = var.domain_name
}
