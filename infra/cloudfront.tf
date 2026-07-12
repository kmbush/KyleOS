# The CDN. One OAC and one cache policy that honors each object's own Cache-Control,
# so a single default behavior serves immutable assets, no-cache index.html/config.json,
# and short-lived content.json correctly (PHASE3 §5). A second origin serves uploaded
# images under the uploads prefix. SPA fallback maps 403/404 to index.html.

resource "aws_cloudfront_origin_access_control" "s3" {
  name                              = "${var.project_name}-s3-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# min_ttl 0 + respecting origin headers is what lets one behavior cache everything
# correctly. A managed policy that ignores origin Cache-Control would not (PHASE3 §5).
resource "aws_cloudfront_cache_policy" "honor_origin" {
  name        = "${var.project_name}-honor-origin"
  min_ttl     = 0
  default_ttl = 0
  max_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  http_version        = "http2and3"
  aliases             = [var.domain_name, local.www_domain]
  comment             = "${var.project_name} site"

  origin {
    origin_id                = "site"
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
  }

  origin {
    origin_id                = "images"
    domain_name              = aws_s3_bucket.images.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
  }

  default_cache_behavior {
    target_origin_id       = "site"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = aws_cloudfront_cache_policy.honor_origin.id
  }

  # Uploaded images live in their own bucket; route their prefix to that origin.
  ordered_cache_behavior {
    path_pattern           = "${var.upload_prefix}/*"
    target_origin_id       = "images"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = aws_cloudfront_cache_policy.honor_origin.id
  }

  # SPA fallback: S3+OAC returns 403 for a missing key, 404 otherwise. Map both to
  # the app shell with a 200 so client-side routing works (PHASE3 §5).
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# Seed content.json once from the committed example, then never touch it again:
# the admin editor (and break-glass) own it thereafter (PHASE3 §5, ADR-002/004).
resource "aws_s3_object" "content_seed" {
  bucket        = aws_s3_bucket.site.id
  key           = var.content_key
  source        = "${local.repo_root}/apps/web/content.example.json"
  content_type  = "application/json"
  cache_control = var.content_cache_control

  lifecycle {
    ignore_changes = all
  }
}
