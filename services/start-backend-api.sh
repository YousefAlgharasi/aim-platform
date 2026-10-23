#!/usr/bin/env bash
# =============================================================================
# AIM Platform — Backend API (NestJS) — Dev Start Script
# =============================================================================
# Usage:
#   ./start-backend-api.sh           # dev/watch mode (default)
#   ./start-backend-api.sh --prod    # production mode
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_DIR="${SCRIPT_DIR}/backend-api"

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log_info()  { echo -e "${CYAN}[backend-api]${NC} $*"; }
log_ok()    { echo -e "${GREEN}[backend-api]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[backend-api]${NC} $*"; }
log_error() { echo -e "${RED}[backend-api]${NC} $*" >&2; }

PROD_MODE=false
for arg in "$@"; do
  case "$arg" in
    --prod)   PROD_MODE=true ;;
    --help|-h)
      echo "Usage: $0 [--prod]"
      echo "  (no flag)   Dev/watch mode  (npm run start:dev)"
      echo "  --prod      Production mode (npm run start)"
      exit 0 ;;
    *) log_error "Unknown argument: $arg"; exit 1 ;;
  esac
done

cd "${SERVICE_DIR}"
log_info "Working directory: ${SERVICE_DIR}"

# --- Node check ---
if ! command -v node &>/dev/null; then
  log_error "node not found. Install Node.js >= 20."; exit 1
fi
NODE_MAJOR=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if (( NODE_MAJOR < 20 )); then
  log_error "Node.js >= 20 required. Found major: ${NODE_MAJOR}"; exit 1
fi
log_ok "Node.js $(node --version) ✓"

# --- Install if needed ---
if [[ ! -d node_modules ]]; then
  log_warn "node_modules missing — running npm install …"
  npm install
fi

# --- .env check ---
[[ ! -f .env ]] && log_warn ".env not found — using environment defaults."

PORT="${PORT:-3000}"
log_info "Starting on port ${PORT} …"

if [[ "$PROD_MODE" == "true" ]]; then
  log_warn "PRODUCTION mode"
  exec npm run start
else
  log_ok "DEV/WATCH mode (hot-reload enabled)"
  exec npm run start:dev
fi
