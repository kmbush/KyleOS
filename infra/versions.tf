# Terraform + provider version pins. Terraform >= 1.10 is required for native S3
# state locking (use_lockfile, backend.tf) — no DynamoDB lock table (PHASE3 §2).

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}
