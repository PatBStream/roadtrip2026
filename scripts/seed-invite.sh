#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <email> <display-name> [base-url]" >&2
  exit 1
fi

EMAIL="$1"
DISPLAY_NAME="$2"
BASE_URL="${3:-http://localhost:53000}"

if [[ -z "${SESSION_SECRET:-}" ]]; then
  echo "SESSION_SECRET environment variable is required" >&2
  exit 1
fi

curl -sS \
  -X POST \
  -H 'content-type: application/json' \
  -H "x-admin-seed-key: ${SESSION_SECRET}" \
  "${BASE_URL}/api/admin-seed-invite" \
  -d "$(printf '{\"email\":\"%s\",\"displayName\":\"%s\"}' "$EMAIL" "$DISPLAY_NAME")"

echo
