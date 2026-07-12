#!/usr/bin/env bash
# ADR-006: fail the build if any environment-specific value is committed. This
# repo is public and must stay forkable — no account IDs, ARNs, API endpoints,
# regions, or bucket names in tracked code or config.
#
# Scope: only files that are (or would be) committed are scanned. Using git to
# enumerate them means .gitignore is honored, so generated runtime files
# (config.json, content.json, terraform state) are never false-positives.
#   - docs/ is design prose that necessarily quotes these patterns and shared
#     architectural facts (e.g. ACM must live in us-east-1); no real values.
#   - reference/ is the read-only design spec.
#   - *.example.* templates use placeholders by design.
#   - This script is the single home of the pattern, so nothing self-matches.
set -euo pipefail

pattern='AKIA|[0-9]{12}|arn:aws|execute-api|amazonaws\.com|us-[a-z]+-[0-9]'

matches=$(
  git ls-files --cached --others --exclude-standard |
    grep -vE '^(docs/|reference/)' |
    grep -vE '\.example\.' |
    grep -vE '(^|/)leak-check\.sh$' |
    xargs -r grep -nIE "$pattern" /dev/null || true
)

if [ -n "$matches" ]; then
  echo "$matches"
  echo "::error::Environment-specific value found in a tracked file. See docs/DESIGN.md ADR-006."
  exit 1
fi
echo "Leak check clean."
