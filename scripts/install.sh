#!/usr/bin/env bash
set -euo pipefail

SERVICE="${1:-all}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

install_backend() {
  echo "→ backend-api: npm ci"
  cd "$ROOT/services/backend-api" && npm ci
}

install_aim_engine() {
  echo "→ aim-engine: pip install"
  cd "$ROOT/services/aim-engine"
  if [ ! -d "venv" ]; then
    python3 -m venv venv
  fi
  source venv/bin/activate
  pip install -r requirements.txt --quiet
  deactivate
}

install_admin() {
  echo "→ admin-dashboard: npm ci"
  cd "$ROOT/apps/admin-dashboard" && npm ci
}

install_mobile() {
  echo "→ mobile: flutter pub get"
  cd "$ROOT/apps/mobile" && flutter pub get
}

case "$SERVICE" in
  backend)    install_backend ;;
  aim-engine) install_aim_engine ;;
  admin)      install_admin ;;
  mobile)     install_mobile ;;
  all)
    install_backend
    install_aim_engine
    install_admin
    install_mobile
    echo "✓ All services installed."
    ;;
  *)
    echo "Usage: $0 [backend|aim-engine|admin|mobile|all]"
    exit 1
    ;;
esac
