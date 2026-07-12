# Shared locals and data sources. The Route 53 zone already exists and is looked up,
# never created (PHASE3 §2). Bucket names embed the account ID for global uniqueness
# without committing a name (the account ID lives only in state, not the repo).

locals {
  tags = {
    Project   = var.project_name
    ManagedBy = "terraform"
  }

  www_domain         = "www.${var.domain_name}"
  site_bucket_name   = "${var.project_name}-site-${data.aws_caller_identity.current.account_id}"
  images_bucket_name = "${var.project_name}-images-${data.aws_caller_identity.current.account_id}"

  repo_root = "${path.module}/.."
}

data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

data "aws_route53_zone" "primary" {
  name = var.domain_name
}
