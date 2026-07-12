"""POST /contact: forward a contact-form submission by email, silently dropping
anything that trips the honeypot (DESIGN §8).

Public endpoint, so every field is validated. Per-IP rate limiting is handled by
API Gateway throttling (infra), not here. Uses boto3 from the Lambda runtime."""

import json
import os

import boto3

SENDER = os.environ["SES_SENDER"]
RECIPIENT = os.environ["SES_RECIPIENT"]
# The hidden form field a real user never sees; any value means a bot filled it.
HONEYPOT_FIELD = os.environ.get("HONEYPOT_FIELD", "company")

ses = boto3.client("ses")


def _response(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def handler(event, context):
    try:
        form = json.loads(event.get("body") or "")
    except ValueError:
        return _response(400, {"error": "Request body must be valid JSON."})

    # Bot detected: accept and discard so the sender learns nothing (DESIGN §8).
    if str(form.get(HONEYPOT_FIELD, "")).strip():
        return _response(200, {"ok": True})

    name = str(form.get("name", "")).strip()
    email = str(form.get("email", "")).strip()
    message = str(form.get("message", "")).strip()
    if not (name and email and message):
        return _response(400, {"error": "name, email, and message are required."})

    ses.send_email(
        Source=SENDER,
        Destination={"ToAddresses": [RECIPIENT]},
        ReplyToAddresses=[email],
        Message={
            "Subject": {"Data": f"KyleOS contact from {name}"},
            "Body": {"Text": {"Data": f"From: {name} <{email}>\n\n{message}"}},
        },
    )
    return _response(200, {"ok": True})
