#!/usr/bin/env bash
# =============================================================================
# AIM Platform — Admin Dashboard (Next.js) — Dev Start Script
# =============================================================================
# Usage:
#   ./start-admin-dashboard.sh           # dev mode with hot-reload (default)
#   ./start-admin-dashboard.sh --prod    # production mode (next start)
#   ./start-admin-dashboard.sh --build   # build then start in production mode
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${SCRIPT_DIR}/admin-dashboard"

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log_info()  { echo -e "${CYAN}[admin-dashboard]${NC} $*"; }
log_ok()    { echo -e "${GREEN}[admin-dashboard]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[admin-dashboard]${NC} $*"; }
log_error() { echo -e "${RED}[admin-dashboard]${NC} $*" >&2; }

# ---------------------------------------------------------------------------
# Parse flags
# ---------------------------------------------------------------------------
PROD_MODE=false
BUILD_FIRST=false

for arg in "$@"; do
  case "$arg" in
    --prod)  PROD_MODE=true ;;
    --build) BUILD_FIRST=true; PROD_MODE=true ;;
    --help|-h)
      echo "Usage: $0 [--prod] [--build]"
      echo "  (no flag)  Dev mode with hot-reload (npm run dev) — port 3001"
      echo "  --prod     Production mode (npm run start)       — port 3001"
      echo "  --build    Build first, then start in production mode"
      exit 0 ;;
    *) log_error "Unknown argument: $arg"; exit 1 ;;
  esac
done

cd "${APP_DIR}"
log_info "Working directory: ${APP_DIR}"

# ---------------------------------------------------------------------------
# Node check (Next.js 16 requires Node >= 18)
# ---------------------------------------------------------------------------
if ! command -v node &>/dev/null; then
  log_error "node not found. Install Node.js >= 18."; exit 1
fi
NODE_MAJOR=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if (( NODE_MAJOR < 18 )); then
  log_error "Node.js >= 18 required. Found major: ${NODE_MAJOR}"; exit 1
fi
log_ok "Node.js $(node --version) ✓"

# ---------------------------------------------------------------------------
# Install deps if missing
# ---------------------------------------------------------------------------
if [[ ! -d node_modules ]]; then
  log_warn "node_modules missing — running npm install …"
  npm install
fi

# ---------------------------------------------------------------------------
# .env check
# ---------------------------------------------------------------------------
if [[ ! -f .env && ! -f .env.local ]]; then
  log_warn "No .env or .env.local found. The app will use built-in defaults."
  log_warn "Copy .env.example to .env.local and fill in the required values."
else
  [[ -f .env.local ]] && log_ok ".env.local found ✓" || log_ok ".env found ✓"
fi

# ---------------------------------------------------------------------------
# Start
# ---------------------------------------------------------------------------
if [[ "$BUILD_FIRST" == "true" ]]; then
  log_info "Building production bundle …"
  npm run build
fi

if [[ "$PROD_MODE" == "true" ]]; then
  log_warn "PRODUCTION mode — port 3001"
  exec npm run start
else
  log_ok "DEV mode (hot-reload enabled) — port 3001"
  exec npm run dev
fi
