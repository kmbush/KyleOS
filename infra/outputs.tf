# runtime_config is written verbatim to dist/config.json by CI and fetched by the app
# at boot (ADR-006, PHASE3 §4). Keys must match AppConfig / config.example.json exactly.
# site_bucket and cloudfront_id are consumed by deploy.yml for sync + invalidation.

output "runtime_config" {
  description = "Public runtime config; becomes config.json at deploy."
  value = {
    region            = var.region
    apiBaseUrl        = aws_apigatewayv2_api.this.api_endpoint
    cognitoUserPoolId = aws_cognito_user_pool.this.id
    cognitoClientId   = aws_cognito_user_pool_client.this.id
  }
}

output "site_url" {
  description = "Reachable site URL: the custom domain when set, else the CloudFront URL."
  value       = local.has_domain ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.site.domain_name}"
}

output "site_bucket" {
  description = "Site bucket name; deploy.yml syncs the build here."
  value       = aws_s3_bucket.site.bucket
}

output "cloudfront_id" {
  description = "Distribution ID; deploy.yml invalidates it after a deploy."
  value       = aws_cloudfront_distribution.site.id
}
