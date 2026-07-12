# Packaging + the three API routes. Only put_content has a third-party dependency
# (fastjsonschema); it is vendored by a build step alongside the committed schema.json
# (PHASE3 §3, ADR-009/010). The other two are boto3-only, so a single-file zip. Each
# function gets a role scoped to exactly the resources it touches (PHASE3 §7).

locals {
  api_dir     = "${local.repo_root}/services/api"
  schema_json = "${local.repo_root}/apps/web/src/lib/schema.json"
  build_dir   = "${path.module}/build"
}

# Vendor fastjsonschema and copy the handler + shared schema into a build dir. Pure
# Python, so no --platform needed for arm64. Reruns when any input changes.
resource "null_resource" "put_content_build" {
  triggers = {
    handler      = filesha256("${local.api_dir}/put_content/handler.py")
    requirements = filesha256("${local.api_dir}/put_content/requirements.txt")
    schema       = filesha256(local.schema_json)
  }

  provisioner "local-exec" {
    interpreter = ["bash", "-c"]
    command     = <<-EOT
      set -euo pipefail
      rm -rf "${local.build_dir}/put_content"
      mkdir -p "${local.build_dir}/put_content"
      python3 -m pip install \
        --target "${local.build_dir}/put_content" \
        -r "${local.api_dir}/put_content/requirements.txt"
      cp "${local.api_dir}/put_content/handler.py" "${local.build_dir}/put_content/"
      cp "${local.schema_json}" "${local.build_dir}/put_content/"
    EOT
  }
}

data "archive_file" "put_content" {
  depends_on  = [null_resource.put_content_build]
  type        = "zip"
  source_dir  = "${local.build_dir}/put_content"
  output_path = "${local.build_dir}/put_content.zip"
}

data "archive_file" "post_contact" {
  type        = "zip"
  source_file = "${local.api_dir}/post_contact/handler.py"
  output_path = "${local.build_dir}/post_contact.zip"
}

data "archive_file" "post_upload_url" {
  type        = "zip"
  source_file = "${local.api_dir}/post_upload_url/handler.py"
  output_path = "${local.build_dir}/post_upload_url.zip"
}

module "put_content" {
  source = "./modules/lambda-fn"

  name               = "${var.project_name}-put-content"
  filename           = data.archive_file.put_content.output_path
  source_code_hash   = data.archive_file.put_content.output_base64sha256
  runtime            = var.lambda_runtime
  architecture       = var.lambda_architecture
  log_retention_days = var.log_retention_days

  environment = {
    SITE_BUCKET                = aws_s3_bucket.site.bucket
    CONTENT_KEY                = var.content_key
    CLOUDFRONT_DISTRIBUTION_ID = aws_cloudfront_distribution.site.id
    CONTENT_CACHE_CONTROL      = var.content_cache_control
  }

  # Replace exactly one object, then invalidate exactly one distribution. No /* (§7).
  policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "WriteContent"
        Effect   = "Allow"
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.site.arn}/${var.content_key}"
      },
      {
        Sid      = "InvalidateContent"
        Effect   = "Allow"
        Action   = "cloudfront:CreateInvalidation"
        Resource = aws_cloudfront_distribution.site.arn
      },
    ]
  })

  api_id            = aws_apigatewayv2_api.this.id
  api_execution_arn = aws_apigatewayv2_api.this.execution_arn
  route_key         = "PUT /content"
  authorizer_id     = aws_apigatewayv2_authorizer.jwt.id
}

module "post_upload_url" {
  source = "./modules/lambda-fn"

  name               = "${var.project_name}-post-upload-url"
  filename           = data.archive_file.post_upload_url.output_path
  source_code_hash   = data.archive_file.post_upload_url.output_base64sha256
  runtime            = var.lambda_runtime
  architecture       = var.lambda_architecture
  log_retention_days = var.log_retention_days

  environment = {
    IMAGES_BUCKET          = aws_s3_bucket.images.bucket
    UPLOAD_PREFIX          = var.upload_prefix
    PRESIGN_EXPIRY_SECONDS = tostring(var.presign_expiry_seconds)
    MAX_UPLOAD_BYTES       = tostring(var.max_upload_bytes)
    ALLOWED_CONTENT_TYPES  = var.allowed_content_types
  }

  # Write only under the uploads prefix; the presigned URL inherits this scope (§7).
  policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid      = "PutUpload"
      Effect   = "Allow"
      Action   = "s3:PutObject"
      Resource = "${aws_s3_bucket.images.arn}/${var.upload_prefix}/*"
    }]
  })

  api_id            = aws_apigatewayv2_api.this.id
  api_execution_arn = aws_apigatewayv2_api.this.execution_arn
  route_key         = "POST /upload-url"
  authorizer_id     = aws_apigatewayv2_authorizer.jwt.id
}

module "post_contact" {
  source = "./modules/lambda-fn"

  name               = "${var.project_name}-post-contact"
  filename           = data.archive_file.post_contact.output_path
  source_code_hash   = data.archive_file.post_contact.output_base64sha256
  runtime            = var.lambda_runtime
  architecture       = var.lambda_architecture
  log_retention_days = var.log_retention_days

  environment = {
    SES_SENDER     = var.contact_sender_email
    SES_RECIPIENT  = var.contact_recipient_email
    HONEYPOT_FIELD = var.honeypot_field
  }

  # Send only from the verified sender identity, only as that From address (§7).
  policy_json = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid      = "SendContactMail"
      Effect   = "Allow"
      Action   = "ses:SendEmail"
      Resource = aws_ses_email_identity.sender.arn
      Condition = {
        StringEquals = {
          "ses:FromAddress" = var.contact_sender_email
        }
      }
    }]
  })

  api_id            = aws_apigatewayv2_api.this.id
  api_execution_arn = aws_apigatewayv2_api.this.execution_arn
  route_key         = "POST /contact"
  # Public route: no authorizer (ADR-005 — the honeypot + throttle guard it).
}
