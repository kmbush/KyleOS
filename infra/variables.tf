# Every input. Account-specific values have NO default — they live only in the
# gitignored terraform.tfvars (ADR-006). terraform.tfvars.example ships placeholders.

# --- Account-specific: a forker must set these (no defaults) ---

variable "region" {
  description = "AWS region for the app stack (e.g. us-west-2). ACM stays in us-east-1."
  type        = string
}

variable "domain_name" {
  description = "Apex domain, also the name of the existing Route 53 hosted zone."
  type        = string
}

variable "contact_sender_email" {
  description = "Verified SES From address for contact-form mail."
  type        = string
}

variable "contact_recipient_email" {
  description = "Verified SES address that receives contact-form mail."
  type        = string
}

# --- Tunable defaults: safe to leave as-is ---

variable "project_name" {
  description = "Name prefix for resources and tags."
  type        = string
  default     = "kyleos"
}

variable "lambda_runtime" {
  description = "Python runtime for all functions."
  type        = string
  default     = "python3.13"
}

variable "lambda_architecture" {
  description = "Lambda instruction set; arm64 is cheaper and safe (pure-Python deps)."
  type        = string
  default     = "arm64"
}

variable "log_retention_days" {
  description = "CloudWatch log retention for the functions."
  type        = number
  default     = 14
}

variable "content_key" {
  description = "S3 key of the content document."
  type        = string
  default     = "content.json"
}

variable "content_cache_control" {
  description = "Cache-Control on content.json (short — edits appear fast)."
  type        = string
  default     = "max-age=60"
}

variable "upload_prefix" {
  description = "Key prefix for uploaded images; also the CloudFront path for them."
  type        = string
  default     = "uploads"
}

variable "presign_expiry_seconds" {
  description = "Lifetime of a presigned upload URL."
  type        = number
  default     = 300
}

variable "max_upload_bytes" {
  description = "Client-enforced upload size cap (a presigned PUT cannot cap size)."
  type        = number
  default     = 5242880
}

variable "allowed_content_types" {
  description = "Comma-separated image content types accepted for upload."
  type        = string
  default     = "image/png,image/jpeg,image/webp,image/gif"
}

variable "honeypot_field" {
  description = "Hidden contact-form field; any value marks the submission as a bot."
  type        = string
  default     = "company"
}

variable "stage_throttle_burst" {
  description = "API stage default burst limit (coarse, global)."
  type        = number
  default     = 20
}

variable "stage_throttle_rate" {
  description = "API stage default steady-state rate limit (req/s)."
  type        = number
  default     = 10
}

variable "contact_throttle_burst" {
  description = "Burst limit on POST /contact (spam brake, PHASE3 §7)."
  type        = number
  default     = 2
}

variable "contact_throttle_rate" {
  description = "Steady-state rate limit on POST /contact (req/s)."
  type        = number
  default     = 1
}
