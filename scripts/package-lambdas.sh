#!/usr/bin/env bash
# Build the put_content Lambda package that Terraform zips (infra/build/put_content).
# Terraform's archive_file is read at plan time, so this must run BEFORE terraform
# init/plan/apply — in CI (deploy.yml) and before a manual apply (RUNBOOK). Only
# put_content needs a build: it vendors fastjsonschema and carries the committed
# schema.json (ADR-009/010). The other two functions are single-file archives.
set -euo pipefail

# Resolve paths relative to this script so it runs from anywhere.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

SRC="$REPO_ROOT/services/api/put_content"
BUILD="$REPO_ROOT/infra/build/put_content"

rm -rf "$BUILD"
mkdir -p "$BUILD"

# Pure-Python dep, so no --platform needed for the arm64 runtime. --no-compile
# skips .pyc (whose embedded metadata varies per build); Lambda compiles at cold start.
python3 -m pip install --no-compile --target "$BUILD" -r "$SRC/requirements.txt"

cp "$SRC/handler.py" "$BUILD/"
cp "$REPO_ROOT/apps/web/src/lib/schema.json" "$BUILD/"

# Byte-identical zip across builds (else the archive hash changes and the Lambda
# redeploys on every push): drop any bytecode, then pin every timestamp.
find "$BUILD" -name '__pycache__' -type d -prune -exec rm -rf {} +
find "$BUILD" -exec touch -h -d '2000-01-01T00:00:00Z' {} +

echo "Built $BUILD"
