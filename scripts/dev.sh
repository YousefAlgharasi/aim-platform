#!/usr/bin/env bash
set -euo pipefail

SERVICE="${1:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -z "$SERVICE" ]; then
  echo "Usage: $0 <backend|aim-engine|both|admin|mobile|docker>"
  echo ""
  echo "  backend     Start NestJS backend API in watch mode (port 3000)"
  echo "  aim-engine  Start Python AIM Engine in dev mode (port 8010)"
  echo "  both        Start backend-api AND aim-engine together (parallel)"
  echo "  admin       Start Next.js admin dashboard in dev mode (port 3001)"
  echo "  mobile      Start Flutter mobile app"
  echo "  docker      Start all backend services via Docker Compose"
  exit 0
fi

case "$SERVICE" in
  backend)
    echo "→ backend-api: npm run start:dev (port 3000)"
    bash "$ROOT/services/backend-api/scripts/start.sh"
    ;;
  aim-engine)
    echo "→ aim-engine: uvicorn (port 8010)"
    bash "$ROOT/services/aim-engine/scripts/start.sh"
    ;;
  both)
    echo "→ Starting backend-api (port 3000) and aim-engine (port 8010) in parallel …"
    echo "   Press Ctrl+C to stop both services."
    echo ""

    # Store PIDs so we can kill both on exit
    PIDS=()

    _cleanup() {
      echo ""
      echo "→ Stopping all services …"
      for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
          kill "$pid" 2>/dev/null || true
        fi
      done
      wait 2>/dev/null || true
      echo "→ All services stopped."
    }
    trap _cleanup EXIT INT TERM

    bash "$ROOT/services/backend-api/scripts/start.sh" &
    PIDS+=($!)

    bash "$ROOT/services/aim-engine/scripts/start.sh" &
    PIDS+=($!)

    # Wait for any child to exit; if one crashes, kill the other
    wait -n 2>/dev/null || true
    ;;
  admin)
    echo "→ admin-dashboard: next dev (port 3001)"
    cd "$ROOT/apps/admin-dashboard" && npm run dev -- --port 3001
    ;;
  mobile)
    echo "→ mobile: flutter run"
    MOBILE_ENV="$ROOT/apps/mobile/.env"
    if [ -f "$MOBILE_ENV" ]; then
      mobile_env_value() {
        awk -F= -v key="$1" '$1 == key { sub(/\r$/, "", $2); print $2 }' "$MOBILE_ENV"
      }

      BACKEND_API_BASE_URL_VALUE="$(mobile_env_value BACKEND_API_BASE_URL)"
      SUPABASE_URL_VALUE="$(mobile_env_value SUPABASE_URL)"
      SUPABASE_ANON_KEY_VALUE="$(mobile_env_value SUPABASE_ANON_KEY)"

      cd "$ROOT/apps/mobile" && flutter run \
        --dart-define="BACKEND_API_BASE_URL=$BACKEND_API_BASE_URL_VALUE" \
        --dart-define="SUPABASE_URL=$SUPABASE_URL_VALUE" \
        --dart-define="SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY_VALUE"
    else
      cd "$ROOT/apps/mobile" && flutter run
    fi
    ;;
  docker)
    echo "→ docker compose up (backend-api + aim-engine)"
    cd "$ROOT/infra/docker" && docker compose up
    ;;
  *)
    echo "Unknown service: $SERVICE"
    echo "Usage: $0 <backend|aim-engine|both|admin|mobile|docker>"
    exit 1
    ;;
esac
