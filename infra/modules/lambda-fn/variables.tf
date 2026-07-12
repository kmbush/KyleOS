# Inputs for one API route: a Lambda function, its log group, its least-privilege
# role, and its API Gateway wiring. Everything account-specific comes from the root.

variable "name" {
  description = "Function name; also names the log group and role."
  type        = string
}

variable "filename" {
  description = "Path to the deployment zip (built by the root)."
  type        = string
}

variable "source_code_hash" {
  description = "Base64 SHA-256 of the zip, so a code change triggers redeploy."
  type        = string
}

variable "handler" {
  description = "Lambda entrypoint."
  type        = string
  default     = "handler.handler"
}

variable "runtime" {
  description = "Lambda runtime identifier."
  type        = string
}

variable "architecture" {
  description = "Lambda instruction set (arm64 is cheaper)."
  type        = string
}

variable "memory_size" {
  description = "Function memory in MB."
  type        = number
  default     = 128
}

variable "timeout" {
  description = "Function timeout in seconds."
  type        = number
  default     = 10
}

variable "environment" {
  description = "Environment variables the handler reads."
  type        = map(string)
}

variable "policy_json" {
  description = "The function's least-privilege permissions (no wildcards)."
  type        = string
}

variable "log_retention_days" {
  description = "CloudWatch log retention."
  type        = number
}

variable "api_id" {
  description = "HTTP API to attach the route to."
  type        = string
}

variable "api_execution_arn" {
  description = "HTTP API execution ARN, for the invoke permission."
  type        = string
}

variable "route_key" {
  description = "HTTP API route, e.g. \"PUT /content\"."
  type        = string
}

variable "authorizer_id" {
  description = "JWT authorizer to require, or null for a public route."
  type        = string
  default     = null
}
