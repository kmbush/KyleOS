"""PUT /content: validate the request body against the shared schema, then replace
the site's content document and invalidate its cached copy at the edge.

A malformed body is rejected with 400 before any write — a bad document bricks the
site (DESIGN §8). The schema (schema.json, ADR-009) is copied next to this file at
build time and compiled once per cold start (ADR-010)."""

import json
import os

import boto3
import fastjsonschema
from botocore.exceptions import ClientError

SITE_BUCKET = os.environ["SITE_BUCKET"]
CONTENT_KEY = os.environ["CONTENT_KEY"]
DISTRIBUTION_ID = os.environ["CLOUDFRONT_DISTRIBUTION_ID"]
CACHE_CONTROL = os.environ["CONTENT_CACHE_CONTROL"]

_schema_path = os.path.join(os.path.dirname(__file__), "schema.json")
with open(_schema_path, encoding="utf-8") as f:
    validate = fastjsonschema.compile(json.load(f))

s3 = boto3.client("s3")
cloudfront = boto3.client("cloudfront")


def _response(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def handler(event, context):
    try:
        content = json.loads(event.get("body") or "")
    except ValueError:
        return _response(400, {"error": "Request body must be valid JSON."})

    try:
        validate(content)
    except fastjsonschema.JsonSchemaException as error:
        return _response(400, {"error": error.message})

    s3.put_object(
        Bucket=SITE_BUCKET,
        Key=CONTENT_KEY,
        Body=json.dumps(content).encode("utf-8"),
        ContentType="application/json",
        CacheControl=CACHE_CONTROL,
    )

    # The write above is the save; the edit is now live. Invalidation only makes it
    # appear within seconds instead of within the 60s cache TTL, so a failed
    # invalidation must not report the save itself as failed.
    invalidated = True
    try:
        cloudfront.create_invalidation(
            DistributionId=DISTRIBUTION_ID,
            InvalidationBatch={
                "Paths": {"Quantity": 1, "Items": [f"/{CONTENT_KEY}"]},
                "CallerReference": context.aws_request_id,
            },
        )
    except ClientError:
        invalidated = False

    return _response(200, {"ok": True, "invalidated": invalidated})
