# The app stack lives in var.region. The us_east_1 alias exists only to create the
# ACM certificate, which CloudFront requires in us-east-1 regardless of the stack's
# region (DESIGN §11). us-east-1 is a shared AWS fact, not an account value.

provider "aws" {
  region = var.region

  default_tags {
    tags = local.tags
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = local.tags
  }
}
