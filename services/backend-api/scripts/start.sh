#!/usr/bin/env bash
# =============================================================================
# AIM Platform — Backend API (NestJS) — Dev Start Script
# =============================================================================
# Usage:
#   ./scripts/start.sh            # default dev mode (--watch)
#   ./scripts/start.sh --prod     # production mode (nest start)
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Resolve script location so the script works regardless of CWD
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# ---------------------------------------------------------------------------
# Colour helpers
# ---------------------------------------------------------------------------
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Colour

log_info()  { echo -e "${CYAN}[backend-api]${NC} $*"; }
log_ok()    { echo -e "${GREEN}[backend-api]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[backend-api]${NC} $*"; }
log_error() { echo -e "${RED}[backend-api]${NC} $*" >&2; }

# ---------------------------------------------------------------------------
# Parse flags
# ---------------------------------------------------------------------------
PROD_MODE=false
for arg in "$@"; do
  case "$arg" in
    --prod) PROD_MODE=true ;;
    --help|-h)
      echo "Usage: $0 [--prod]"
      echo "  (no flag)   Start in dev/watch mode (npm run start:dev)"
      echo "  --prod      Start in production mode (npm run start)"
      exit 0
      ;;
    *)
      log_error "Unknown argument: $arg"
      exit 1
      ;;
  esac
done

cd "${SERVICE_DIR}"
log_info "Working directory: ${SERVICE_DIR}"

# ---------------------------------------------------------------------------
# Pre-flight: check Node / npm
# ---------------------------------------------------------------------------
if ! command -v node &>/dev/null; then
  log_error "node is not installed or not on PATH. Install Node.js >= 20."
  exit 1
fi

NODE_VERSION=$(node -e "process.stdout.write(process.versions.node)")
MAJOR="${NODE_VERSION%%.*}"
if (( MAJOR < 20 )); then
  log_error "Node.js >= 20 required. Found: ${NODE_VERSION}"
  exit 1
fi
log_ok "Node.js ${NODE_VERSION} ✓"

if ! command -v npm &>/dev/null; then
  log_error "npm is not installed or not on PATH."
  exit 1
fi

# ---------------------------------------------------------------------------
# Install dependencies if node_modules is missing or package-lock changed
# ---------------------------------------------------------------------------
if [[ ! -d node_modules ]]; then
  log_warn "node_modules not found — running npm install …"
  npm install
fi

# ---------------------------------------------------------------------------
# Check .env
# ---------------------------------------------------------------------------
if [[ ! -f .env ]]; then
  log_warn ".env file not found. The service will use environment defaults."
  log_warn "Copy .env.example to .env and fill in values if needed."
fi

# ---------------------------------------------------------------------------
# Start
# ---------------------------------------------------------------------------
PORT="${PORT:-3000}"
log_info "Starting Backend API on port ${PORT} …"

if [[ "$PROD_MODE" == "true" ]]; then
  log_warn "Running in PRODUCTION mode."
  exec npm run start
else
  log_ok "Running in DEV/WATCH mode (hot-reload enabled)."
  exec npm run start:dev
fi
