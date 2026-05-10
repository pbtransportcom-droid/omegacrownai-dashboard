#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${OMEGA_DASHBOARD_URL:-https://omegacrownai.com}"

if [ -z "${OMEGA_INTERNAL_API_KEY:-}" ]; then
  echo "[executive-cron] Missing OMEGA_INTERNAL_API_KEY"
  exit 1
fi

curl -sS "$BASE_URL/api/internal/executive/cron" \
  -H "Content-Type: application/json" \
  -H "x-omega-internal-key: $OMEGA_INTERNAL_API_KEY" \
  -d '{"runtimeSessionId":"executive-cron"}'
