# The GitHub Actions OIDC deploy role — how CI assumes AWS with no long-lived keys
# (ADR-007). deploy.yml assumes this role (secrets.AWS_DEPLOY_ROLE_ARN).
#
# This is a PRIVILEGED AUTOMATION role, deliberately broader than the per-Lambda
# runtime roles (§7). It runs `terraform apply` for the whole stack plus the post-apply
# asset sync, so it legitimately needs CRUD across every service the stack manages. It
# is NOT a runtime role and cannot be narrowed to single-resource ARNs the way §7 roles
# are. It is scoped by *service*, and by resource/name prefix where that is practical
# (state bucket, project-prefixed buckets and roles) — never a bare Action:"*".

# The provider already exists in Kyle's account, so reference it (create = false). A
# fresh forker without it sets create_github_oidc_provider = true to create it here.
data "aws_iam_openid_connect_provider" "github" {
  count = var.create_github_oidc_provider ? 0 : 1
  url   = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_openid_connect_provider" "github" {
  count = var.create_github_oidc_provider ? 1 : 0
  url   = "https://token.actions.githubusercontent.com"

  # Audience for GitHub's OIDC on AWS. Built from the partition suffix so no AWS
  # hostname literal lands in the repo (ADR-006) and it stays partition-correct.
  client_id_list = ["sts.${data.aws_partition.current.dns_suffix}"]

  # GitHub's OIDC thumbprints. AWS now validates the JWKS against its trusted CAs, but
  # the API still requires at least one thumbprint.
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fca",
  ]
}

locals {
  partition  = data.aws_partition.current.partition
  account_id = data.aws_caller_identity.current.account_id

  oidc_provider_arn = var.create_github_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : data.aws_iam_openid_connect_provider.github[0].arn

  # ARNs are built from partition/account attributes (never a hardcoded ARN prefix), so
  # the repo stays forkable and no account value is committed (ADR-006).
  state_bucket_arn   = "arn:${local.partition}:s3:::${var.tf_state_bucket}"
  stack_bucket_arn   = "arn:${local.partition}:s3:::${var.project_name}-*"
  stack_role_arn     = "arn:${local.partition}:iam::${local.account_id}:role/${var.project_name}-*"
  oidc_provider_glob = "arn:${local.partition}:iam::${local.account_id}:oidc-provider/*"
}

# Trust: only GitHub's OIDC provider, only for this repo (any branch/env), and only
# with the sts audience — so no other repo or workflow can assume the role.
data "aws_iam_policy_document" "deploy_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [local.oidc_provider_arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.${data.aws_partition.current.dns_suffix}"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:*"]
    }
  }
}

resource "aws_iam_role" "deploy" {
  name               = "${var.project_name}-deploy"
  description        = "GitHub Actions OIDC deploy role for the ${var.project_name} stack."
  assume_role_policy = data.aws_iam_policy_document.deploy_assume.json
}

data "aws_iam_policy_document" "deploy" {
  # Terraform state: object CRUD (incl. the native S3 lockfile) on the state bucket only.
  statement {
    sid = "TerraformState"
    actions = [
      "s3:ListBucket",
      "s3:GetBucketLocation",
      "s3:GetBucketVersioning",
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = [local.state_bucket_arn, "${local.state_bucket_arn}/*"]
  }

  # The stack's own buckets (site + images), constrained to the project name prefix:
  # create/configure them and sync objects (post-apply asset deploy + content seed).
  statement {
    sid       = "StackBuckets"
    actions   = ["s3:*"]
    resources = [local.stack_bucket_arn, "${local.stack_bucket_arn}/*"]
  }

  # The stack's service namespaces. These services are largely global or need broad
  # Describe/List to plan, and most don't support useful resource-level authz on create,
  # so they are service-scoped on "*". Region is not constrained because the set mixes
  # global (cloudfront, route53, acm-in-us-east-1) with regional (lambda, apigateway,
  # cognito-idp, ses, logs) services — a blanket region guard would break the global ones.
  statement {
    sid = "StackServices"
    actions = [
      "cloudfront:*",
      "apigateway:*",
      "lambda:*",
      "cognito-idp:*",
      "ses:*",
      "acm:*",
      "route53:*",
      "logs:*",
    ]
    resources = ["*"]
  }

  # IAM: manage the per-Lambda roles and this deploy role, constrained to the project
  # name prefix. PassRole is needed so Terraform can attach those roles to Lambda.
  statement {
    sid = "StackIam"
    actions = [
      "iam:CreateRole",
      "iam:DeleteRole",
      "iam:GetRole",
      "iam:UpdateRole",
      "iam:UpdateAssumeRolePolicy",
      "iam:PassRole",
      "iam:TagRole",
      "iam:UntagRole",
      "iam:ListRoleTags",
      "iam:PutRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:GetRolePolicy",
      "iam:ListRolePolicies",
      "iam:ListAttachedRolePolicies",
      "iam:AttachRolePolicy",
      "iam:DetachRolePolicy",
    ]
    resources = [local.stack_role_arn]
  }

  # The GitHub OIDC provider: read it (data source) and, for a fresh forker, manage it.
  statement {
    sid = "OidcProvider"
    actions = [
      "iam:GetOpenIDConnectProvider",
      "iam:CreateOpenIDConnectProvider",
      "iam:DeleteOpenIDConnectProvider",
      "iam:TagOpenIDConnectProvider",
      "iam:UpdateOpenIDConnectProviderThumbprint",
      "iam:AddClientIDToOpenIDConnectProvider",
    ]
    resources = [local.oidc_provider_glob]
  }

  # Read-only context Terraform data sources need.
  statement {
    sid       = "ReadContext"
    actions   = ["sts:GetCallerIdentity"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "deploy" {
  name   = "deploy"
  role   = aws_iam_role.deploy.id
  policy = data.aws_iam_policy_document.deploy.json
}
