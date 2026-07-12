"""POST /upload-url: hand an authenticated editor a short-lived presigned S3 PUT
URL for one project screenshot, scoped to the uploads prefix and an allowed type.

A presigned PUT cannot cap object size (DESIGN §7), so MAX_UPLOAD_BYTES is returned
for the client to enforce before uploading. Uses boto3 from the Lambda runtime."""

import json
import os
import uuid

import boto3

BUCKET = os.environ["IMAGES_BUCKET"]
PREFIX = os.environ["UPLOAD_PREFIX"].strip("/")
EXPIRY_SECONDS = int(os.environ["PRESIGN_EXPIRY_SECONDS"])
MAX_UPLOAD_BYTES = int(os.environ["MAX_UPLOAD_BYTES"])
ALLOWED_CONTENT_TYPES = {t.strip() for t in os.environ["ALLOWED_CONTENT_TYPES"].split(",") if t.strip()}

EXTENSIONS = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif"}

s3 = boto3.client("s3")


def _response(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def handler(event, context):
    try:
        content_type = str(json.loads(event.get("body") or "")["contentType"]).strip()
    except (ValueError, KeyError, TypeError):
        return _response(400, {"error": "Body must be JSON with a contentType field."})

    if content_type not in ALLOWED_CONTENT_TYPES:
        return _response(400, {"error": f"Unsupported content type: {content_type}"})

    key = f"{PREFIX}/{uuid.uuid4().hex}.{EXTENSIONS.get(content_type, 'bin')}"
    url = s3.generate_presigned_url(
        "put_object",
        Params={"Bucket": BUCKET, "Key": key, "ContentType": content_type},
        ExpiresIn=EXPIRY_SECONDS,
    )
    return _response(200, {"key": key, "url": url, "maxBytes": MAX_UPLOAD_BYTES})
