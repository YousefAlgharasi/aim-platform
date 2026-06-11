#!/usr/bin/env bash
set -euo pipefail

SERVICE="${1:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -z "$SERVICE" ]; then
  echo "Usage: $0 <backend|aim-engine|admin|mobile|docker>"
  echo ""
  echo "  backend     Start NestJS backend API in watch mode (port 3000)"
  echo "  aim-engine  Start Python AIM Engine (port 8010)"
  echo "  admin       Start Next.js admin dashboard in dev mode (port 3001)"
  echo "  mobile      Start Flutter mobile app"
  echo "  docker      Start all backend services via Docker Compose"
  exit 0
fi

case "$SERVICE" in
  backend)
    echo "→ backend-api: npm run start:dev (port 3000)"
    cd "$ROOT/services/backend-api" && npm run start:dev
    ;;
  aim-engine)
    echo "→ aim-engine: uvicorn (port 8010)"
    cd "$ROOT/services/aim-engine"
    source venv/bin/activate
    uvicorn app.main:app --host 0.0.0.0 --port 8010 --reload
    deactivate
    ;;
  admin)
    echo "→ admin-dashboard: next dev (port 3001)"
    cd "$ROOT/apps/admin-dashboard" && npm run dev -- --port 3001
    ;;
  mobile)
    echo "→ mobile: flutter run"
    cd "$ROOT/apps/mobile" && flutter run
    ;;
  docker)
    echo "→ docker compose up (backend-api + aim-engine)"
    cd "$ROOT/infra/docker" && docker compose up
    ;;
  *)
    echo "Unknown service: $SERVICE"
    echo "Usage: $0 <backend|aim-engine|admin|mobile|docker>"
    exit 1
    ;;
esac
