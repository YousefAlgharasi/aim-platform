#!/usr/bin/env bash
set -euo pipefail

SERVICE="${1:-all}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAILED=0

check_backend() {
  echo "→ backend-api: tsc --noEmit"
  cd "$ROOT/services/backend-api" && npx tsc --noEmit || FAILED=1
}

check_aim_engine() {
  echo "→ aim-engine: ruff check + ruff format --check"
  cd "$ROOT/services/aim-engine"
  source venv/bin/activate
  ruff check . || FAILED=1
  ruff format --check . || FAILED=1
  deactivate
}

check_admin() {
  echo "→ admin-dashboard: tsc --noEmit"
  cd "$ROOT/apps/admin-dashboard" && npx tsc --noEmit || FAILED=1
}

check_mobile() {
  echo "→ mobile: flutter analyze"
  cd "$ROOT/apps/mobile" && flutter analyze --no-fatal-infos || FAILED=1
}

case "$SERVICE" in
  backend)    check_backend ;;
  aim-engine) check_aim_engine ;;
  admin)      check_admin ;;
  mobile)     check_mobile ;;
  all)
    check_backend
    check_aim_engine
    check_admin
    check_mobile
    if [ "$FAILED" -ne 0 ]; then
      echo "✗ One or more checks failed."
      exit 1
    fi
    echo "✓ All checks passed."
    ;;
  *)
    echo "Usage: $0 [backend|aim-engine|admin|mobile|all]"
    exit 1
    ;;
esac
