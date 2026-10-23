#!/usr/bin/env bash
# =============================================================================
# AIM Platform — AIM Engine (FastAPI / uvicorn) — Dev Start Script
# =============================================================================
# Usage:
#   ./scripts/start.sh            # default dev mode (--reload)
#   ./scripts/start.sh --prod     # production mode (no reload, 1 worker)
#   ./scripts/start.sh --workers 4 --prod  # multi-worker production
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Resolve script location
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
NC='\033[0m'

log_info()  { echo -e "${CYAN}[aim-engine]${NC} $*"; }
log_ok()    { echo -e "${GREEN}[aim-engine]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[aim-engine]${NC} $*"; }
log_error() { echo -e "${RED}[aim-engine]${NC} $*" >&2; }

# ---------------------------------------------------------------------------
# Parse flags
# ---------------------------------------------------------------------------
PROD_MODE=false
WORKERS=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prod)    PROD_MODE=true; shift ;;
    --workers) WORKERS="${2:?--workers requires a value}"; shift 2 ;;
    --help|-h)
      echo "Usage: $0 [--prod] [--workers N]"
      echo "  (no flag)     Start in dev mode with --reload (single worker)"
      echo "  --prod        Start in production mode (no --reload)"
      echo "  --workers N   Number of uvicorn workers (prod mode only, default: 1)"
      exit 0
      ;;
    *)
      log_error "Unknown argument: $1"
      exit 1
      ;;
  esac
done

cd "${SERVICE_DIR}"
log_info "Working directory: ${SERVICE_DIR}"

# ---------------------------------------------------------------------------
# Pre-flight: Python version
# ---------------------------------------------------------------------------
if ! command -v python3 &>/dev/null; then
  log_error "python3 is not installed or not on PATH."
  exit 1
fi

PY_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
PY_MAJOR=$(python3 -c "import sys; print(sys.version_info.major)")
PY_MINOR=$(python3 -c "import sys; print(sys.version_info.minor)")

if (( PY_MAJOR < 3 || (PY_MAJOR == 3 && PY_MINOR < 11) )); then
  log_error "Python >= 3.11 required. Found: ${PY_VERSION}"
  exit 1
fi
log_ok "Python ${PY_VERSION} ✓"

# ---------------------------------------------------------------------------
# Virtual environment
# ---------------------------------------------------------------------------
VENV_DIR="${SERVICE_DIR}/.venv"

if [[ ! -d "${VENV_DIR}" ]]; then
  log_warn ".venv not found — creating virtual environment …"
  python3 -m venv "${VENV_DIR}"
fi

# Activate the venv for this shell session
# shellcheck disable=SC1091
source "${VENV_DIR}/bin/activate"
log_ok "Virtual environment activated: ${VENV_DIR}"

# ---------------------------------------------------------------------------
# Install / sync dependencies
# ---------------------------------------------------------------------------
if ! python3 -c "import uvicorn" &>/dev/null 2>&1; then
  log_warn "Dependencies not installed — running: pip install -e '.[dev]' …"
  pip install --quiet -e ".[dev]"
fi

# ---------------------------------------------------------------------------
# Check .env
# ---------------------------------------------------------------------------
if [[ ! -f "${SERVICE_DIR}/.env" ]]; then
  log_warn ".env file not found. The service will use built-in defaults."
  log_warn "Copy .env.example to .env and fill in values if needed."
fi

# ---------------------------------------------------------------------------
# Read config from env (mirrors AimEngineSettings defaults)
# ---------------------------------------------------------------------------
AIM_ENGINE_HOST="${AIM_ENGINE_HOST:-0.0.0.0}"
AIM_ENGINE_PORT="${AIM_ENGINE_PORT:-8010}"
AIM_ENGINE_LOG_LEVEL="${AIM_ENGINE_LOG_LEVEL:-info}"

log_info "Host:      ${AIM_ENGINE_HOST}"
log_info "Port:      ${AIM_ENGINE_PORT}"
log_info "Log level: ${AIM_ENGINE_LOG_LEVEL}"

# ---------------------------------------------------------------------------
# Start uvicorn
# ---------------------------------------------------------------------------
if [[ "$PROD_MODE" == "true" ]]; then
  log_warn "Running in PRODUCTION mode (no hot-reload, ${WORKERS} worker(s))."
  exec uvicorn app.main:app \
    --host "${AIM_ENGINE_HOST}" \
    --port "${AIM_ENGINE_PORT}" \
    --log-level "${AIM_ENGINE_LOG_LEVEL}" \
    --workers "${WORKERS}"
else
  log_ok "Running in DEV mode (hot-reload enabled, single worker)."
  exec uvicorn app.main:app \
    --host "${AIM_ENGINE_HOST}" \
    --port "${AIM_ENGINE_PORT}" \
    --log-level "${AIM_ENGINE_LOG_LEVEL}" \
    --reload
fi
