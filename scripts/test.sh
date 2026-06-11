#!/usr/bin/env bash
set -euo pipefail

SERVICE="${1:-all}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAILED=0

test_backend() {
  echo "→ backend-api: npm test"
  cd "$ROOT/services/backend-api" && npm test || FAILED=1
}

test_aim_engine() {
  echo "→ aim-engine: pytest"
  cd "$ROOT/services/aim-engine"
  source venv/bin/activate
  pytest --tb=short || FAILED=1
  deactivate
}

test_admin() {
  echo "→ admin-dashboard: no runtime tests in Phase 1 (tsc --noEmit)"
  cd "$ROOT/apps/admin-dashboard" && npx tsc --noEmit || FAILED=1
}

test_mobile() {
  echo "→ mobile: flutter test"
  cd "$ROOT/apps/mobile" && flutter test || FAILED=1
}

case "$SERVICE" in
  backend)    test_backend ;;
  aim-engine) test_aim_engine ;;
  admin)      test_admin ;;
  mobile)     test_mobile ;;
  all)
    test_backend
    test_aim_engine
    test_admin
    test_mobile
    if [ "$FAILED" -ne 0 ]; then
      echo "✗ One or more test suites failed."
      exit 1
    fi
    echo "✓ All tests passed."
    ;;
  *)
    echo "Usage: $0 [backend|aim-engine|admin|mobile|all]"
    exit 1
    ;;
esac
