#!/usr/bin/env bash
# =============================================================================
# AIM Platform — AIM Engine (FastAPI / uvicorn) — Dev Start Script
# =============================================================================
# Usage:
#   ./start-aim-engine.sh              # dev mode with --reload (default)
#   ./start-aim-engine.sh --prod       # production mode, no reload
#   ./start-aim-engine.sh --prod --workers 4
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_DIR="${SCRIPT_DIR}/aim-engine"
VENV_DIR="${SERVICE_DIR}/.venv"

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log_info()  { echo -e "${CYAN}[aim-engine]${NC} $*"; }
log_ok()    { echo -e "${GREEN}[aim-engine]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[aim-engine]${NC} $*"; }
log_error() { echo -e "${RED}[aim-engine]${NC} $*" >&2; }

PROD_MODE=false
WORKERS=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prod)    PROD_MODE=true; shift ;;
    --workers) WORKERS="${2:?--workers requires a value}"; shift 2 ;;
    --help|-h)
      echo "Usage: $0 [--prod] [--workers N]"
      echo "  (no flag)     Dev mode with hot-reload (single worker)"
      echo "  --prod        Production mode (no --reload)"
      echo "  --workers N   Uvicorn worker count (prod only, default: 1)"
      exit 0 ;;
    *) log_error "Unknown argument: $1"; exit 1 ;;
  esac
done

cd "${SERVICE_DIR}"
log_info "Working directory: ${SERVICE_DIR}"

# --- Python check ---
if ! command -v python3 &>/dev/null; then
  log_error "python3 not found."; exit 1
fi
PY_MAJOR=$(python3 -c "import sys; print(sys.version_info.major)")
PY_MINOR=$(python3 -c "import sys; print(sys.version_info.minor)")
if (( PY_MAJOR < 3 || (PY_MAJOR == 3 && PY_MINOR < 11) )); then
  log_error "Python >= 3.11 required. Found: ${PY_MAJOR}.${PY_MINOR}"; exit 1
fi
log_ok "Python $(python3 --version) ✓"

# --- Virtual environment ---
if [[ ! -d "${VENV_DIR}" ]]; then
  log_warn ".venv not found — creating virtual environment …"
  python3 -m venv "${VENV_DIR}"
fi

# shellcheck disable=SC1091
source "${VENV_DIR}/bin/activate"
log_ok "Virtualenv activated: ${VENV_DIR}"

# --- Install deps if needed ---
if ! python3 -c "import uvicorn" &>/dev/null 2>&1; then
  log_warn "uvicorn not found — running: pip install -e '.[dev]' …"
  pip install --quiet -e ".[dev]"
fi

# --- .env check ---
[[ ! -f "${SERVICE_DIR}/.env" ]] && log_warn ".env not found — using built-in defaults."

AIM_ENGINE_HOST="${AIM_ENGINE_HOST:-0.0.0.0}"
AIM_ENGINE_PORT="${AIM_ENGINE_PORT:-8010}"
AIM_ENGINE_LOG_LEVEL="${AIM_ENGINE_LOG_LEVEL:-info}"

log_info "Host: ${AIM_ENGINE_HOST}  Port: ${AIM_ENGINE_PORT}  Log: ${AIM_ENGINE_LOG_LEVEL}"

if [[ "$PROD_MODE" == "true" ]]; then
  log_warn "PRODUCTION mode (${WORKERS} worker(s), no reload)"
  exec uvicorn app.main:app \
    --host "${AIM_ENGINE_HOST}" \
    --port "${AIM_ENGINE_PORT}" \
    --log-level "${AIM_ENGINE_LOG_LEVEL}" \
    --workers "${WORKERS}"
else
  log_ok "DEV mode (hot-reload enabled)"
  exec uvicorn app.main:app \
    --host "${AIM_ENGINE_HOST}" \
    --port "${AIM_ENGINE_PORT}" \
    --log-level "${AIM_ENGINE_LOG_LEVEL}" \
    --reload
fi
