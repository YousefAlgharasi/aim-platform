#!/usr/bin/env bash
# P5-078: No Client AIM Regression Check
#
# Proves that Flutter (apps/mobile) and Admin Dashboard (apps/admin-dashboard)
# do not call the AIM Engine directly and do not compute AIM-owned values.
#
# Usage:
#   bash scripts/checks/no-client-aim-regression-check.sh
#
# Exit codes:
#   0 — all checks pass (boundary intact)
#   1 — one or more violations found
#
# Scope: Phase 5 AIM Engine integration security boundary.
# This script must never contain secrets.

set -euo pipefail

PASS=0
FAIL=1
result=$PASS
violations=()

CLIENT_DIRS=(
  "apps/mobile/lib"
  "apps/admin-dashboard"
  "apps/web"
)

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
check() {
  local label="$1"
  local pattern="$2"
  local dirs=("${@:3}")

  local found
  found=$(grep -rn --include="*.dart" --include="*.ts" --include="*.tsx" --include="*.js" \
    "$pattern" "${dirs[@]}" 2>/dev/null | grep -v "\.md:" | grep -v "node_modules" || true)

  if [[ -n "$found" ]]; then
    echo "FAIL: $label"
    echo "$found"
    violations+=("$label")
    result=$FAIL
  else
    echo "PASS: $label"
  fi
}

echo "=========================================="
echo "P5-078 — No Client AIM Regression Check"
echo "=========================================="
echo ""

# 1. No client code references the AIM Engine analysis path
check \
  "Client does not reference /aim/v1/analysis" \
  "aim/v1/analysis" \
  "${CLIENT_DIRS[@]}"

# 2. No client code references the AIM Engine URL env var as a call target
check \
  "Client does not use AIM_ENGINE_URL as a fetch target" \
  "AIM_ENGINE_URL" \
  "${CLIENT_DIRS[@]}"

# 3. No client code imports or references AimEngineClient
check \
  "Client does not import AimEngineClient or AimEngineAdapter" \
  "AimEngineClient\|AimEngineAdapter\|aim-engine-client\|aim-engine-adapter" \
  "${CLIENT_DIRS[@]}"

# 4. No client code constructs AIM analysis requests
check \
  "Client does not construct AIM analysis request payloads" \
  "AimAnalysisRequest\|AimAttemptInput\|postAnalysis" \
  "${CLIENT_DIRS[@]}"

# 5. Flutter does not compute mastery, weakness, or difficulty locally
check \
  "Flutter does not compute mastery locally (no local calc)" \
  "masteryScore\s*[+\-\*\/=]\|computeMastery\|calculateMastery\|deriveMastery" \
  "apps/mobile/lib"

# 6. Flutter does not compute difficulty locally
check \
  "Flutter does not compute difficulty locally" \
  "computeDifficulty\|calculateDifficulty\|difficulty\s*[+\-\*\/]=\|local.*difficulty" \
  "apps/mobile/lib"

# 7. Admin Dashboard does not compute AIM values
check \
  "Admin Dashboard does not compute mastery or weakness" \
  "computeMastery\|calculateMastery\|computeWeakness\|calculateWeakness\|computeDifficulty" \
  "apps/admin-dashboard"

echo ""
echo "=========================================="
if [[ $result -eq $PASS ]]; then
  echo "RESULT: PASS — all checks passed"
  echo "AIM Engine client boundary is intact."
else
  echo "RESULT: FAIL — violations found:"
  for v in "${violations[@]}"; do
    echo "  - $v"
  done
fi
echo "=========================================="

exit $result
