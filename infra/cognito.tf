# The single-admin user pool. Self-signup off, MFA required, TOTP only, no SMS
# (ADR-003). The one user is created by hand after apply — not in Terraform.

resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-users"

  # Self-signup disabled: only an admin can create the one user (ADR-003).
  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  # MFA required, software-token (TOTP) only. No SMS: SIM-swap risk and it costs money.
  mfa_configuration = "ON"
  software_token_mfa_configuration {
    enabled = true
  }

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 12
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = true
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "admin_only"
      priority = 1
    }
  }
}

resource "aws_cognito_user_pool_client" "this" {
  name         = "${var.project_name}-web"
  user_pool_id = aws_cognito_user_pool.this.id

  # Public SPA client: no secret, SRP auth, and Cognito's TOTP MFA challenge (ADR-003).
  generate_secret               = false
  prevent_user_existence_errors = "ENABLED"
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  # Tokens are held in memory only (ADR-003), so short lifetimes cost nothing.
  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 1
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}
