# HTTP API with a Cognito JWT authorizer bound to the pool. The routes themselves are
# created by the lambda-fn module (lambda.tf); here we own the API, the authorizer, and
# the $default stage — including the coarse throttle on POST /contact (PHASE3 §7).

resource "aws_apigatewayv2_api" "this" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["https://${var.domain_name}", "https://${local.www_domain}"]
    allow_methods = ["GET", "POST", "PUT", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
    max_age       = 3600
  }
}

# Issuer is built from the pool's endpoint attribute, so no regional AWS hostname is
# hardcoded in the repo (ADR-006). Audience is the app client; API Gateway validates
# the token natively against the pool.
resource "aws_apigatewayv2_authorizer" "jwt" {
  api_id           = aws_apigatewayv2_api.this.id
  name             = "${var.project_name}-cognito-jwt"
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.this.id]
    issuer   = "https://${aws_cognito_user_pool.this.endpoint}"
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = var.stage_throttle_burst
    throttling_rate_limit  = var.stage_throttle_rate
  }

  # Coarse (global, not per-IP) brake on the one public write path. Honeypot in the
  # handler is the real spam defense; this caps abuse volume (PHASE3 §7).
  route_settings {
    route_key              = "POST /contact"
    throttling_burst_limit = var.contact_throttle_burst
    throttling_rate_limit  = var.contact_throttle_rate
  }

  depends_on = [module.post_contact]
}
