"""Proves the generated JSON Schema accepts the real content seed (ADR-009, proof #4):
compile apps/web/src/lib/schema.json with fastjsonschema and validate
content.example.json against it. If the schema were over- or under-strict, this fails.

Run standalone (`python3 services/api/test_schema.py`) or under pytest."""

import json
from pathlib import Path

import fastjsonschema

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = ROOT / "apps/web/src/lib/schema.json"
EXAMPLE = ROOT / "apps/web/content.example.json"


def test_schema_accepts_example():
    validate = fastjsonschema.compile(json.loads(SCHEMA.read_text()))
    validate(json.loads(EXAMPLE.read_text()))  # raises JsonSchemaException on mismatch


if __name__ == "__main__":
    test_schema_accepts_example()
    print("schema.json accepts content.example.json")
