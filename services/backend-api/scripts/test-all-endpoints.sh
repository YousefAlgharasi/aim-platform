#!/usr/bin/env bash
# =============================================================================
# AIM Platform — Backend API Endpoint Test Script
# =============================================================================
# Tests every backend endpoint with curl.
#
# Usage:
#   ./scripts/test-all-endpoints.sh
#   ./scripts/test-all-endpoints.sh --base-url http://localhost:3000
#   ./scripts/test-all-endpoints.sh --email admin@example.com --password secret
#
# Environment variables (alternative to flags):
#   BASE_URL          — API base URL        (default: http://localhost:3000)
#   TEST_EMAIL        — Login email         (default: student@example.com)
#   TEST_PASSWORD     — Login password      (default: password123)
#   ADMIN_EMAIL       — Admin login email   (default: admin@example.com)
#   ADMIN_PASSWORD    — Admin login password (default: admin123)
#   SKIP_ADMIN        — Set to 1 to skip admin-only endpoints
#   SKIP_DESTRUCTIVE  — Set to 1 to skip POST/PATCH/DELETE that mutate data
# =============================================================================

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────

BASE_URL="${BASE_URL:-http://localhost:3000}"
TEST_EMAIL="${TEST_EMAIL:-student@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:-password123}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
SKIP_ADMIN="${SKIP_ADMIN:-0}"
SKIP_DESTRUCTIVE="${SKIP_DESTRUCTIVE:-0}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base-url)       BASE_URL="$2"; shift 2;;
    --email)          TEST_EMAIL="$2"; shift 2;;
    --password)       TEST_PASSWORD="$2"; shift 2;;
    --admin-email)    ADMIN_EMAIL="$2"; shift 2;;
    --admin-password) ADMIN_PASSWORD="$2"; shift 2;;
    --skip-admin)     SKIP_ADMIN=1; shift;;
    --skip-destructive) SKIP_DESTRUCTIVE=1; shift;;
    *) echo "Unknown flag: $1"; exit 1;;
  esac
done

# ── Colours & counters ───────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PASS=0
FAIL=0
SKIP=0
TOTAL=0
FAILURES=()

# ── Helpers ──────────────────────────────────────────────────────────────────

log_section() {
  echo ""
  echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${BOLD}${CYAN}  $1${NC}"
  echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════${NC}"
}

log_subsection() {
  echo ""
  echo -e "${BOLD}── $1 ──${NC}"
}

# test_endpoint METHOD PATH [EXPECTED_STATUS] [DATA] [TOKEN] [DESCRIPTION]
test_endpoint() {
  local method="$1"
  local path="$2"
  local expected="${3:-200}"
  local data="${4:-}"
  local token="${5:-}"
  local desc="${6:-$method $path}"
  TOTAL=$((TOTAL + 1))

  local curl_args=(-s -o /dev/null -w "%{http_code}" -X "$method")
  curl_args+=(-H "Content-Type: application/json")

  if [[ -n "$token" ]]; then
    curl_args+=(-H "Authorization: Bearer $token")
  fi

  if [[ -n "$data" ]]; then
    curl_args+=(-d "$data")
  fi

  local status
  status=$(curl "${curl_args[@]}" "${BASE_URL}${path}" 2>/dev/null || echo "000")

  # Accept any of the expected statuses (comma-separated)
  local matched=0
  IFS=',' read -ra EXPECTED_CODES <<< "$expected"
  for code in "${EXPECTED_CODES[@]}"; do
    if [[ "$status" == "$code" ]]; then
      matched=1
      break
    fi
  done

  if [[ $matched -eq 1 ]]; then
    echo -e "  ${GREEN}✓${NC} ${desc} — ${status}"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} ${desc} — got ${status}, expected ${expected}"
    FAIL=$((FAIL + 1))
    FAILURES+=("$desc — got $status, expected $expected")
  fi
}

# test_endpoint_body METHOD PATH TOKEN — prints response body
test_endpoint_body() {
  local method="$1"
  local path="$2"
  local token="${3:-}"
  local data="${4:-}"

  local curl_args=(-s -X "$method" -H "Content-Type: application/json")
  if [[ -n "$token" ]]; then
    curl_args+=(-H "Authorization: Bearer $token")
  fi
  if [[ -n "$data" ]]; then
    curl_args+=(-d "$data")
  fi

  curl "${curl_args[@]}" "${BASE_URL}${path}" 2>/dev/null
}

skip_endpoint() {
  local desc="$1"
  TOTAL=$((TOTAL + 1))
  SKIP=$((SKIP + 1))
  echo -e "  ${YELLOW}○${NC} SKIP: ${desc}"
}

# ── Login helper ─────────────────────────────────────────────────────────────

do_login() {
  local email="$1"
  local password="$2"
  local label="$3"

  local body
  body=$(test_endpoint_body POST "/auth/login" "" \
    "{\"email\":\"$email\",\"password\":\"$password\"}")

  local token
  token=$(echo "$body" | grep -o '"accessToken":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [[ -z "$token" ]]; then
    echo -e "${RED}  ✗ Failed to login as $label ($email). Response: $body${NC}"
    return 1
  fi

  echo -e "${GREEN}  ✓ Logged in as $label ($email)${NC}"
  echo "$token"
}

# =============================================================================
#  START
# =============================================================================

echo -e "${BOLD}AIM Platform — Backend API Endpoint Test Suite${NC}"
echo -e "Base URL:  ${BASE_URL}"
echo -e "Student:   ${TEST_EMAIL}"
echo -e "Admin:     ${ADMIN_EMAIL}"
echo -e "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# ── 0. Health / Foundation (public) ──────────────────────────────────────────

log_section "0. HEALTH / FOUNDATION (public)"

test_endpoint GET  "/health"     200 "" "" "GET /health"
test_endpoint GET  "/version"    200 "" "" "GET /version"
test_endpoint GET  "/health/db-tables" 200 "" "" "GET /health/db-tables"

# ── 1. Auth — Public endpoints ──────────────────────────────────────────────

log_section "1. AUTH — PUBLIC ENDPOINTS"

# Register (may 200 or 409 if user exists or 400 for validation)
if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /auth/register (destructive)"
else
  test_endpoint POST "/auth/register" "200,201,409,400" \
    '{"email":"test-script-user@example.com","password":"TestPass123!"}' \
    "" "POST /auth/register"
fi

# Login as student
test_endpoint POST "/auth/login" "200,201,401" \
  "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
  "" "POST /auth/login (student)"

# Obtain tokens
log_subsection "Obtaining auth tokens"

STUDENT_TOKEN=""
STUDENT_LOGIN=$(test_endpoint_body POST "/auth/login" "" \
  "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
STUDENT_TOKEN=$(echo "$STUDENT_LOGIN" | grep -o '"accessToken":"[^"]*"' | head -1 | cut -d'"' -f4)

if [[ -z "$STUDENT_TOKEN" ]]; then
  echo -e "${RED}  ✗ Could not obtain student token. Some tests will fail.${NC}"
  echo -e "${RED}    Response: $STUDENT_LOGIN${NC}"
else
  echo -e "${GREEN}  ✓ Student token obtained${NC}"
fi

ADMIN_TOKEN=""
if [[ "$SKIP_ADMIN" != "1" ]]; then
  ADMIN_LOGIN=$(test_endpoint_body POST "/auth/login" "" \
    "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
  ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"accessToken":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [[ -z "$ADMIN_TOKEN" ]]; then
    echo -e "${YELLOW}  ○ Could not obtain admin token. Admin tests will be skipped.${NC}"
    SKIP_ADMIN=1
  else
    echo -e "${GREEN}  ✓ Admin token obtained${NC}"
  fi
fi

# Extract student user ID from login response
STUDENT_USER_ID=$(echo "$STUDENT_LOGIN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo -e "  Student user ID: ${STUDENT_USER_ID:-unknown}"

# ── 2. Auth — Protected endpoints ───────────────────────────────────────────

log_section "2. AUTH — PROTECTED ENDPOINTS"

test_endpoint GET  "/auth/me"        200 "" "$STUDENT_TOKEN" "GET /auth/me"
test_endpoint POST "/auth/bootstrap" 200 "" "$STUDENT_TOKEN" "POST /auth/bootstrap"

# Refresh token
REFRESH_TOKEN=$(echo "$STUDENT_LOGIN" | grep -o '"refreshToken":"[^"]*"' | head -1 | cut -d'"' -f4)
if [[ -n "$REFRESH_TOKEN" ]]; then
  test_endpoint POST "/auth/refresh" "200,201" \
    "{\"refreshToken\":\"$REFRESH_TOKEN\"}" "" "POST /auth/refresh"
else
  skip_endpoint "POST /auth/refresh (no refresh token)"
fi

# Logout — test with a separate login to avoid invalidating our token
if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /auth/logout (destructive)"
else
  LOGOUT_LOGIN=$(test_endpoint_body POST "/auth/login" "" \
    "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
  LOGOUT_TOKEN=$(echo "$LOGOUT_LOGIN" | grep -o '"accessToken":"[^"]*"' | head -1 | cut -d'"' -f4)
  if [[ -n "$LOGOUT_TOKEN" ]]; then
    test_endpoint POST "/auth/logout" "204,200" "" "$LOGOUT_TOKEN" "POST /auth/logout"
  else
    skip_endpoint "POST /auth/logout (could not get token)"
  fi
fi

# Unauthenticated access should be rejected
test_endpoint GET "/auth/me" "401" "" "" "GET /auth/me (no token → 401)"

# ── 3. Profile ───────────────────────────────────────────────────────────────

log_section "3. PROFILE"

test_endpoint GET   "/profile/me" "200,404" "" "$STUDENT_TOKEN" "GET /profile/me"

if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "PATCH /profile/me (destructive)"
else
  test_endpoint PATCH "/profile/me" "200,404" \
    '{"displayName":"Test User"}' "$STUDENT_TOKEN" "PATCH /profile/me"
fi

# ── 4. Placement Test ────────────────────────────────────────────────────────

log_section "4. PLACEMENT TEST"

test_endpoint GET  "/placement/active"   "200,404" "" "$STUDENT_TOKEN" "GET /placement/active"
test_endpoint GET  "/placement/sections" "200,400,404" "" "$STUDENT_TOKEN" "GET /placement/sections"

if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /placement/attempts (destructive)"
else
  ATTEMPT_RESP=$(test_endpoint_body POST "/placement/attempts" "$STUDENT_TOKEN")
  PLACEMENT_ATTEMPT_ID=$(echo "$ATTEMPT_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  test_endpoint POST "/placement/attempts" "200,201,400,409" "" "$STUDENT_TOKEN" "POST /placement/attempts"

  if [[ -n "$PLACEMENT_ATTEMPT_ID" ]]; then
    test_endpoint GET "/placement/questions" "200,400" "" "$STUDENT_TOKEN" \
      "GET /placement/questions"
    test_endpoint POST "/placement/attempts/$PLACEMENT_ATTEMPT_ID/answers" "200,201,400" \
      '{"questionId":"00000000-0000-0000-0000-000000000001","selectedOptionId":"opt-1"}' \
      "$STUDENT_TOKEN" "POST /placement/attempts/:id/answers"
    test_endpoint POST "/placement/attempts/$PLACEMENT_ATTEMPT_ID/complete" "200,400,409" \
      "" "$STUDENT_TOKEN" "POST /placement/attempts/:id/complete"
    test_endpoint GET "/placement/attempts/$PLACEMENT_ATTEMPT_ID/result" "200,404,400" \
      "" "$STUDENT_TOKEN" "GET /placement/attempts/:id/result"
  fi
fi

# ── 5. Curriculum ────────────────────────────────────────────────────────────

log_section "5. CURRICULUM"

log_subsection "Courses"
test_endpoint GET "/curriculum/courses"      "200" "" "$STUDENT_TOKEN" "GET /curriculum/courses"
test_endpoint GET "/curriculum/courses/00000000-0000-0000-0000-000000000001" "200,404" "" "$STUDENT_TOKEN" \
  "GET /curriculum/courses/:id"

log_subsection "Levels"
test_endpoint GET "/curriculum/courses/00000000-0000-0000-0000-000000000001/levels" "200,404" "" "$STUDENT_TOKEN" \
  "GET /curriculum/courses/:courseId/levels"

log_subsection "Chapters"
test_endpoint GET "/curriculum/chapters"     "200" "" "$STUDENT_TOKEN" "GET /curriculum/chapters"
test_endpoint GET "/curriculum/chapters/00000000-0000-0000-0000-000000000001" "200,404" "" "$STUDENT_TOKEN" \
  "GET /curriculum/chapters/:id"

log_subsection "Lessons"
test_endpoint GET "/curriculum/lessons"      "200" "" "$STUDENT_TOKEN" "GET /curriculum/lessons"
test_endpoint GET "/curriculum/lessons/00000000-0000-0000-0000-000000000001" "200,404" "" "$STUDENT_TOKEN" \
  "GET /curriculum/lessons/:id"

log_subsection "Skills"
test_endpoint GET "/curriculum/skills"       "200" "" "$STUDENT_TOKEN" "GET /curriculum/skills"
test_endpoint GET "/curriculum/skills/00000000-0000-0000-0000-000000000001" "200,404" "" "$STUDENT_TOKEN" \
  "GET /curriculum/skills/:id"

log_subsection "Objectives"
test_endpoint GET "/curriculum/objectives"   "200" "" "$STUDENT_TOKEN" "GET /curriculum/objectives"
test_endpoint GET "/curriculum/objectives/00000000-0000-0000-0000-000000000001" "200,404" "" "$STUDENT_TOKEN" \
  "GET /curriculum/objectives/:id"

log_subsection "Questions"
test_endpoint GET "/curriculum/questions"    "200" "" "$STUDENT_TOKEN" "GET /curriculum/questions"
test_endpoint GET "/curriculum/questions/00000000-0000-0000-0000-000000000001" "200,404" "" "$STUDENT_TOKEN" \
  "GET /curriculum/questions/:id"

log_subsection "Lesson Assets"
test_endpoint GET "/curriculum/lesson-assets" "200" "" "$STUDENT_TOKEN" "GET /curriculum/lesson-assets"

log_subsection "Lesson Links"
DUMMY_LESSON="00000000-0000-0000-0000-000000000001"
test_endpoint GET "/curriculum/lessons/$DUMMY_LESSON/objectives" "200,404" "" "$STUDENT_TOKEN" \
  "GET /curriculum/lessons/:id/objectives"
test_endpoint GET "/curriculum/lessons/$DUMMY_LESSON/skills" "200,404" "" "$STUDENT_TOKEN" \
  "GET /curriculum/lessons/:id/skills"

log_subsection "Question Links"
test_endpoint GET "/curriculum/questions/$DUMMY_LESSON/skills" "200,404" "" "$STUDENT_TOKEN" \
  "GET /curriculum/questions/:id/skills"

log_subsection "Audit Logs"
test_endpoint GET "/curriculum/audit-logs" "200,403" "" "$STUDENT_TOKEN" \
  "GET /curriculum/audit-logs"

log_subsection "Stable Key Lookups"
test_endpoint GET "/curriculum/skills/by-key/test-key" "200,404" "" "$STUDENT_TOKEN" \
  "GET /curriculum/skills/by-key/:key"
test_endpoint GET "/curriculum/objectives/by-key/test-key" "200,404" "" "$STUDENT_TOKEN" \
  "GET /curriculum/objectives/by-key/:key"

log_subsection "Lesson Publish Validation"
test_endpoint GET "/curriculum/lessons/$DUMMY_LESSON/publish-validation" "200,404" "" "$STUDENT_TOKEN" \
  "GET /curriculum/lessons/:id/publish-validation"

# Curriculum write endpoints (admin)
if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /curriculum/courses (destructive)"
  skip_endpoint "PATCH /curriculum/courses/:id (destructive)"
  skip_endpoint "POST /curriculum/chapters (destructive)"
  skip_endpoint "PATCH /curriculum/chapters/:id (destructive)"
  skip_endpoint "POST /curriculum/lessons (destructive)"
  skip_endpoint "PATCH /curriculum/lessons/:id (destructive)"
  skip_endpoint "POST /curriculum/skills (destructive)"
  skip_endpoint "PATCH /curriculum/skills/:id (destructive)"
  skip_endpoint "POST /curriculum/objectives (destructive)"
  skip_endpoint "PATCH /curriculum/objectives/:id (destructive)"
  skip_endpoint "POST /curriculum/questions (destructive)"
  skip_endpoint "PATCH /curriculum/questions/:id (destructive)"
  skip_endpoint "POST /curriculum/lesson-assets (destructive)"
  skip_endpoint "PATCH /curriculum/lesson-assets/:id (destructive)"
  skip_endpoint "POST /curriculum/lesson-assets/:id/archive (destructive)"
  skip_endpoint "POST /curriculum/lessons/:id/objectives (destructive)"
  skip_endpoint "DELETE /curriculum/lessons/:id/objectives/:oid (destructive)"
  skip_endpoint "POST /curriculum/lessons/:id/skills (destructive)"
  skip_endpoint "DELETE /curriculum/lessons/:id/skills/:sid (destructive)"
  skip_endpoint "POST /curriculum/questions/:id/skills (destructive)"
  skip_endpoint "PUT /curriculum/questions/:id/skills/:sid/primary (destructive)"
  skip_endpoint "DELETE /curriculum/questions/:id/skills/:sid (destructive)"
  skip_endpoint "GET /curriculum/workflow/:entityType/:entityId/publish (destructive)"
  skip_endpoint "PATCH /curriculum/workflow/:entityType/:entityId/archive (destructive)"
  skip_endpoint "PATCH /curriculum/workflow/:entityType/:entityId/restore (destructive)"
fi

# ── 6. Sessions (Learning Sessions) ─────────────────────────────────────────

log_section "6. LEARNING SESSIONS"

if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /sessions/start (destructive)"
  skip_endpoint "POST /sessions/:id/attempt (destructive)"
else
  test_endpoint POST "/sessions/start" "200,201,400,403" \
    '{"lessonId":"00000000-0000-0000-0000-000000000001"}' \
    "$STUDENT_TOKEN" "POST /sessions/start"
  test_endpoint POST "/sessions/00000000-0000-0000-0000-000000000001/attempt" "200,201,400,404" \
    '{"answers":[]}' "$STUDENT_TOKEN" "POST /sessions/:id/attempt"
fi

# ── 7. AIM (Adaptive Instruction Model) ─────────────────────────────────────

log_section "7. AIM"

DUMMY_STUDENT="${STUDENT_USER_ID:-00000000-0000-0000-0000-000000000001}"
DUMMY_SESSION="00000000-0000-0000-0000-000000000001"

test_endpoint GET "/aim/students/$DUMMY_STUDENT/skill-states" "200,403,404" "" "$STUDENT_TOKEN" \
  "GET /aim/students/:studentId/skill-states"
test_endpoint GET "/aim/students/$DUMMY_STUDENT/review-schedules" "200,403,404" "" "$STUDENT_TOKEN" \
  "GET /aim/students/:studentId/review-schedules"
test_endpoint GET "/aim/students/$DUMMY_STUDENT/weakness-records" "200,403,404" "" "$STUDENT_TOKEN" \
  "GET /aim/students/:studentId/weakness-records"
test_endpoint GET "/aim/students/$DUMMY_STUDENT/recommendations" "200,403,404" "" "$STUDENT_TOKEN" \
  "GET /aim/students/:studentId/recommendations"
test_endpoint GET "/aim/students/$DUMMY_STUDENT/sessions/$DUMMY_SESSION/state" "200,403,404" "" "$STUDENT_TOKEN" \
  "GET /aim/students/:studentId/sessions/:sessionId/state"

# ── 8. Assessments ───────────────────────────────────────────────────────────

log_section "8. ASSESSMENTS"

test_endpoint GET "/student/assessments" "200" "" "$STUDENT_TOKEN" \
  "GET /student/assessments"
test_endpoint GET "/student/assessments/deadlines" "200" "" "$STUDENT_TOKEN" \
  "GET /student/assessments/deadlines"
test_endpoint GET "/student/assessments/00000000-0000-0000-0000-000000000001" "200,404" "" "$STUDENT_TOKEN" \
  "GET /student/assessments/:id"
test_endpoint GET "/student/assessments/00000000-0000-0000-0000-000000000001/history" "200,404" "" "$STUDENT_TOKEN" \
  "GET /student/assessments/:id/history"

if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /student/assessments/:id/attempts (destructive)"
else
  test_endpoint POST "/student/assessments/00000000-0000-0000-0000-000000000001/attempts" "200,201,400,404,409" \
    "" "$STUDENT_TOKEN" "POST /student/assessments/:id/attempts"
fi

test_endpoint GET "/student/assessments/attempts/00000000-0000-0000-0000-000000000001/resume" "200,404" "" "$STUDENT_TOKEN" \
  "GET /student/assessments/attempts/:attemptId/resume"

if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /student/assessments/attempts/:attemptId/submit (destructive)"
else
  test_endpoint POST "/student/assessments/attempts/00000000-0000-0000-0000-000000000001/submit" "200,400,404,409" \
    '{"answers":[]}' "$STUDENT_TOKEN" "POST /student/assessments/attempts/:attemptId/submit"
fi

test_endpoint GET "/student/assessments/attempts/00000000-0000-0000-0000-000000000001/result" "200,404" "" "$STUDENT_TOKEN" \
  "GET /student/assessments/attempts/:attemptId/result"

# ── 9. AI Teacher ────────────────────────────────────────────────────────────

log_section "9. AI TEACHER"

test_endpoint GET  "/ai-teacher/sessions" "200" "" "$STUDENT_TOKEN" \
  "GET /ai-teacher/sessions"

if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /ai-teacher/sessions (destructive)"
  skip_endpoint "POST /ai-teacher/sessions/:id/messages (destructive)"
  skip_endpoint "POST /ai-teacher/sessions/:id/messages/stream (destructive)"
  skip_endpoint "POST /ai-teacher/messages/:id/feedback (destructive)"
else
  AI_SESSION_RESP=$(test_endpoint_body POST "/ai-teacher/sessions" "$STUDENT_TOKEN" \
    '{"contextRef":"general"}')
  AI_SESSION_ID=$(echo "$AI_SESSION_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  test_endpoint POST "/ai-teacher/sessions" "200,201,400,429" \
    '{"contextRef":"general"}' "$STUDENT_TOKEN" "POST /ai-teacher/sessions"

  if [[ -n "$AI_SESSION_ID" ]]; then
    test_endpoint GET "/ai-teacher/sessions/$AI_SESSION_ID/messages" "200" "" "$STUDENT_TOKEN" \
      "GET /ai-teacher/sessions/:id/messages"
    test_endpoint POST "/ai-teacher/sessions/$AI_SESSION_ID/messages" "200,201,400,429" \
      '{"content":"Hello teacher"}' "$STUDENT_TOKEN" "POST /ai-teacher/sessions/:id/messages"
    test_endpoint GET "/ai-teacher/sessions/$AI_SESSION_ID/safety-status" "200" "" "$STUDENT_TOKEN" \
      "GET /ai-teacher/sessions/:id/safety-status"
  else
    skip_endpoint "GET /ai-teacher/sessions/:id/messages (no session)"
    skip_endpoint "POST /ai-teacher/sessions/:id/messages (no session)"
    skip_endpoint "GET /ai-teacher/sessions/:id/safety-status (no session)"
  fi
fi

# ── 10. Billing ──────────────────────────────────────────────────────────────

log_section "10. BILLING"

test_endpoint GET "/billing/pricing"       "200" "" "$STUDENT_TOKEN" "GET /billing/pricing"
test_endpoint GET "/billing/pricing/plans" "200" "" "$STUDENT_TOKEN" "GET /billing/pricing/plans"
test_endpoint GET "/billing/pricing/prices" "200" "" "$STUDENT_TOKEN" "GET /billing/pricing/prices"
test_endpoint GET "/billing/invoices"      "200" "" "$STUDENT_TOKEN" "GET /billing/invoices"
test_endpoint GET "/billing/subscriptions" "200" "" "$STUDENT_TOKEN" "GET /billing/subscriptions"
test_endpoint GET "/billing/checkout/recent" "200" "" "$STUDENT_TOKEN" "GET /billing/checkout/recent"

test_endpoint GET "/billing/invoices/00000000-0000-0000-0000-000000000001" "200,404" "" "$STUDENT_TOKEN" \
  "GET /billing/invoices/:id"
test_endpoint GET "/billing/subscriptions/00000000-0000-0000-0000-000000000001" "200,404" "" "$STUDENT_TOKEN" \
  "GET /billing/subscriptions/:id"
test_endpoint GET "/billing/checkout/00000000-0000-0000-0000-000000000001/status" "200,404" "" "$STUDENT_TOKEN" \
  "GET /billing/checkout/:sessionId/status"

if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /billing/checkout (destructive)"
  skip_endpoint "POST /billing/subscriptions/:id/cancel (destructive)"
  skip_endpoint "POST /billing/refunds (destructive)"
else
  test_endpoint POST "/billing/checkout" "200,201,400" \
    '{"priceId":"00000000-0000-0000-0000-000000000001"}' \
    "$STUDENT_TOKEN" "POST /billing/checkout"
  test_endpoint POST "/billing/subscriptions/00000000-0000-0000-0000-000000000001/cancel" "200,404,400" \
    "" "$STUDENT_TOKEN" "POST /billing/subscriptions/:id/cancel"
  test_endpoint POST "/billing/refunds" "200,201,400,404" \
    '{"paymentId":"00000000-0000-0000-0000-000000000001","reason":"test"}' \
    "$STUDENT_TOKEN" "POST /billing/refunds"
fi

test_endpoint GET "/billing/refunds/00000000-0000-0000-0000-000000000001" "200,404" "" "$STUDENT_TOKEN" \
  "GET /billing/refunds/:id"

# Billing webhook (public, provider-signed)
test_endpoint POST "/billing/webhooks/provider" "200,400,401,403" \
  '{}' "" "POST /billing/webhooks/provider (webhook)"

# ── 11. Notifications ────────────────────────────────────────────────────────

log_section "11. NOTIFICATIONS"

test_endpoint GET "/api/v1/notifications/inbox" "200" "" "$STUDENT_TOKEN" \
  "GET /api/v1/notifications/inbox"
test_endpoint GET "/api/v1/notifications/inbox/unread-count" "200" "" "$STUDENT_TOKEN" \
  "GET /api/v1/notifications/inbox/unread-count"
test_endpoint GET "/api/v1/notifications/preferences" "200" "" "$STUDENT_TOKEN" \
  "GET /api/v1/notifications/preferences"
test_endpoint GET "/api/v1/notifications/quiet-hours" "200" "" "$STUDENT_TOKEN" \
  "GET /api/v1/notifications/quiet-hours"
test_endpoint GET "/api/v1/notifications/reminders" "200" "" "$STUDENT_TOKEN" \
  "GET /api/v1/notifications/reminders"

if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /api/v1/notifications/device-tokens (destructive)"
  skip_endpoint "DELETE /api/v1/notifications/device-tokens/:id (destructive)"
  skip_endpoint "PATCH /api/v1/notifications/inbox/:id/read (destructive)"
  skip_endpoint "PATCH /api/v1/notifications/inbox/:id/dismiss (destructive)"
  skip_endpoint "PATCH /api/v1/notifications/preferences (destructive)"
  skip_endpoint "PATCH /api/v1/notifications/quiet-hours (destructive)"
  skip_endpoint "PATCH /api/v1/notifications/reminders/:id/pause (destructive)"
  skip_endpoint "PATCH /api/v1/notifications/reminders/:id/resume (destructive)"
  skip_endpoint "PATCH /api/v1/notifications/reminders/:id/cancel (destructive)"
else
  test_endpoint POST "/api/v1/notifications/device-tokens" "200,201,400" \
    '{"token":"test-token","platform":"android"}' "$STUDENT_TOKEN" \
    "POST /api/v1/notifications/device-tokens"
  test_endpoint PATCH "/api/v1/notifications/inbox/00000000-0000-0000-0000-000000000001/read" "200,404" \
    "" "$STUDENT_TOKEN" "PATCH /api/v1/notifications/inbox/:eventId/read"
  test_endpoint PATCH "/api/v1/notifications/inbox/00000000-0000-0000-0000-000000000001/dismiss" "200,404" \
    "" "$STUDENT_TOKEN" "PATCH /api/v1/notifications/inbox/:eventId/dismiss"
  test_endpoint PATCH "/api/v1/notifications/preferences" "200,400" \
    '{"channel":"push","enabled":true}' "$STUDENT_TOKEN" \
    "PATCH /api/v1/notifications/preferences"
  test_endpoint PATCH "/api/v1/notifications/quiet-hours" "200,400" \
    '{"enabled":false}' "$STUDENT_TOKEN" \
    "PATCH /api/v1/notifications/quiet-hours"
fi

# ── 12. Analytics (Student) ──────────────────────────────────────────────────

log_section "12. ANALYTICS (STUDENT)"

test_endpoint GET "/student/analytics/summary" "200,403" "" "$STUDENT_TOKEN" \
  "GET /student/analytics/summary"

# Analytics exports
if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /analytics/exports (destructive)"
else
  test_endpoint POST "/analytics/exports" "200,201,400,403" \
    '{"runId":"00000000-0000-0000-0000-000000000001"}' \
    "$STUDENT_TOKEN" "POST /analytics/exports"
fi
test_endpoint GET "/analytics/exports/00000000-0000-0000-0000-000000000001" "200,404,403" "" "$STUDENT_TOKEN" \
  "GET /analytics/exports/:exportJobId"

# ── 13. Voice Teacher ────────────────────────────────────────────────────────

log_section "13. VOICE TEACHER"

test_endpoint GET "/voice-teacher/sessions" "200" "" "$STUDENT_TOKEN" \
  "GET /voice-teacher/sessions"

if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /voice-teacher/sessions (destructive)"
else
  test_endpoint POST "/voice-teacher/sessions" "200,201,400" \
    '{}' "$STUDENT_TOKEN" "POST /voice-teacher/sessions"
fi

test_endpoint GET "/voice-teacher/sessions/00000000-0000-0000-0000-000000000001/messages" "200,404" "" "$STUDENT_TOKEN" \
  "GET /voice-teacher/sessions/:id/messages"

# ── 14. Operations (Public + Auth) ───────────────────────────────────────────

log_section "14. OPERATIONS"

log_subsection "Feature Requests"
test_endpoint GET "/feature-requests" "200" "" "$STUDENT_TOKEN" \
  "GET /feature-requests"
test_endpoint GET "/feature-requests/00000000-0000-0000-0000-000000000001" "200,404" "" "$STUDENT_TOKEN" \
  "GET /feature-requests/:id"

if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /feature-requests (destructive)"
  skip_endpoint "POST /feature-requests/:id/vote (destructive)"
else
  test_endpoint POST "/feature-requests" "200,201,400" \
    '{"title":"Test feature","description":"A test"}' "$STUDENT_TOKEN" \
    "POST /feature-requests"
  test_endpoint POST "/feature-requests/00000000-0000-0000-0000-000000000001/vote" "200,404" \
    "" "$STUDENT_TOKEN" "POST /feature-requests/:id/vote"
fi

log_subsection "Release Notes"
test_endpoint GET "/release-notes" "200" "" "" "GET /release-notes (public)"
test_endpoint GET "/release-notes/00000000-0000-0000-0000-000000000001" "200,404" "" "" \
  "GET /release-notes/:id"

log_subsection "Feedback"
if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /feedback (destructive)"
else
  test_endpoint POST "/feedback" "200,201,400" \
    '{"type":"bug","message":"Test feedback"}' "$STUDENT_TOKEN" \
    "POST /feedback"
fi
test_endpoint GET "/feedback/mine" "200" "" "$STUDENT_TOKEN" "GET /feedback/mine"

log_subsection "Operational Status"
test_endpoint GET "/operational-status" "200" "" "" "GET /operational-status (public)"

log_subsection "Maintenance Windows (public)"
test_endpoint GET "/maintenance-windows" "200" "" "" "GET /maintenance-windows (public)"

log_subsection "Support Tickets"
test_endpoint GET "/support-tickets" "200" "" "$STUDENT_TOKEN" "GET /support-tickets"
test_endpoint GET "/support-tickets/00000000-0000-0000-0000-000000000001" "200,404" "" "$STUDENT_TOKEN" \
  "GET /support-tickets/:id"

if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /support-tickets (destructive)"
  skip_endpoint "POST /support-tickets/:id/comments (destructive)"
else
  test_endpoint POST "/support-tickets" "200,201,400" \
    '{"subject":"Test ticket","message":"Testing"}' "$STUDENT_TOKEN" \
    "POST /support-tickets"
  test_endpoint POST "/support-tickets/00000000-0000-0000-0000-000000000001/comments" "200,201,400,404" \
    '{"message":"Test comment"}' "$STUDENT_TOKEN" \
    "POST /support-tickets/:id/comments"
fi

# ── 15. Parent Portal ────────────────────────────────────────────────────────

log_section "15. PARENT PORTAL"
echo -e "  ${YELLOW}(Requires parent role — testing reachability only)${NC}"

test_endpoint GET "/api/v1/parent/children" "200,403" "" "$STUDENT_TOKEN" \
  "GET /api/v1/parent/children"
test_endpoint GET "/api/v1/parent/dashboard-summary" "200,403" "" "$STUDENT_TOKEN" \
  "GET /api/v1/parent/dashboard-summary"
test_endpoint GET "/api/v1/parent/invitations" "200,403" "" "$STUDENT_TOKEN" \
  "GET /api/v1/parent/invitations"
test_endpoint GET "/api/v1/parent/notification-preferences" "200,403" "" "$STUDENT_TOKEN" \
  "GET /api/v1/parent/notification-preferences"

DUMMY_CHILD="00000000-0000-0000-0000-000000000001"
test_endpoint GET "/api/v1/parent/children/$DUMMY_CHILD/progress" "200,403,404" "" "$STUDENT_TOKEN" \
  "GET /api/v1/parent/children/:childId/progress"
test_endpoint GET "/api/v1/parent/children/$DUMMY_CHILD/assessments" "200,403,404" "" "$STUDENT_TOKEN" \
  "GET /api/v1/parent/children/:childId/assessments"
test_endpoint GET "/api/v1/parent/children/$DUMMY_CHILD/activity" "200,403,404" "" "$STUDENT_TOKEN" \
  "GET /api/v1/parent/children/:childId/activity"
test_endpoint GET "/api/v1/parent/children/$DUMMY_CHILD/ai-summary" "200,403,404" "" "$STUDENT_TOKEN" \
  "GET /api/v1/parent/children/:childId/ai-summary"
test_endpoint GET "/api/v1/parent/children/$DUMMY_CHILD/ai-safety-summary" "200,403,404" "" "$STUDENT_TOKEN" \
  "GET /api/v1/parent/children/:childId/ai-safety-summary"
test_endpoint GET "/api/v1/parent/children/$DUMMY_CHILD/reports" "200,403,404" "" "$STUDENT_TOKEN" \
  "GET /api/v1/parent/children/:childId/reports"
test_endpoint GET "/api/v1/parent/links/00000000-0000-0000-0000-000000000001/consents" "200,403,404" "" "$STUDENT_TOKEN" \
  "GET /api/v1/parent/links/:linkId/consents"

# Parent analytics
test_endpoint GET "/parent/analytics/reports" "200,403" "" "$STUDENT_TOKEN" \
  "GET /parent/analytics/reports"

if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
  skip_endpoint "POST /api/v1/parent/invitations (destructive)"
  skip_endpoint "POST /api/v1/parent/invitations/accept (destructive)"
  skip_endpoint "POST /api/v1/parent/invitations/:id/revoke (destructive)"
  skip_endpoint "POST /api/v1/parent/consents (destructive)"
  skip_endpoint "POST /api/v1/parent/consents/revoke (destructive)"
  skip_endpoint "PATCH /api/v1/parent/notification-preferences (destructive)"
  skip_endpoint "POST /parent/analytics/reports/:key/run (destructive)"
fi

# ── 16. ADMIN ENDPOINTS ─────────────────────────────────────────────────────

log_section "16. ADMIN ENDPOINTS"

if [[ "$SKIP_ADMIN" == "1" ]]; then
  echo -e "  ${YELLOW}Skipping admin endpoints (no admin token or --skip-admin)${NC}"
  skip_endpoint "Admin Users endpoints"
  skip_endpoint "Admin Roles endpoints"
  skip_endpoint "Admin AI Teacher endpoints"
  skip_endpoint "Admin Analytics endpoints"
  skip_endpoint "Admin Billing endpoints"
  skip_endpoint "Admin Notifications endpoints"
  skip_endpoint "Admin Operations endpoints"
else

  log_subsection "Admin — Users & Roles"
  test_endpoint GET "/admin/users" "200" "" "$ADMIN_TOKEN" "GET /admin/users"
  test_endpoint GET "/admin/users/00000000-0000-0000-0000-000000000001" "200,404" "" "$ADMIN_TOKEN" \
    "GET /admin/users/:id"
  test_endpoint GET "/admin/roles" "200" "" "$ADMIN_TOKEN" "GET /admin/roles"
  test_endpoint GET "/admin/roles/student" "200,404" "" "$ADMIN_TOKEN" "GET /admin/roles/:key"

  if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
    skip_endpoint "PATCH /admin/users/:id/status (destructive)"
    skip_endpoint "PUT /admin/users/:userId/roles (destructive)"
  fi

  log_subsection "Admin — AI Teacher"
  test_endpoint GET "/admin/ai/audit/logs" "200" "" "$ADMIN_TOKEN" "GET /admin/ai/audit/logs"
  test_endpoint GET "/admin/ai/model-configs" "200" "" "$ADMIN_TOKEN" "GET /admin/ai/model-configs"
  test_endpoint GET "/admin/ai/prompts" "200" "" "$ADMIN_TOKEN" "GET /admin/ai/prompts"
  test_endpoint GET "/admin/ai/safety/events" "200" "" "$ADMIN_TOKEN" "GET /admin/ai/safety/events"
  test_endpoint GET "/admin/ai/safety/feedback" "200" "" "$ADMIN_TOKEN" "GET /admin/ai/safety/feedback"
  test_endpoint GET "/admin/ai/usage" "200" "" "$ADMIN_TOKEN" "GET /admin/ai/usage"
  test_endpoint GET "/admin/ai/model-configs/00000000-0000-0000-0000-000000000001" "200,404" "" "$ADMIN_TOKEN" \
    "GET /admin/ai/model-configs/:id"
  test_endpoint GET "/admin/ai/prompts/00000000-0000-0000-0000-000000000001" "200,404" "" "$ADMIN_TOKEN" \
    "GET /admin/ai/prompts/:id"
  test_endpoint GET "/admin/ai/usage/student/$DUMMY_STUDENT" "200,404" "" "$ADMIN_TOKEN" \
    "GET /admin/ai/usage/student/:studentId"
  test_endpoint GET "/admin/ai/usage/student/$DUMMY_STUDENT/limit-status" "200,404" "" "$ADMIN_TOKEN" \
    "GET /admin/ai/usage/student/:studentId/limit-status"

  if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
    skip_endpoint "POST /admin/ai/model-configs/:id/status (destructive)"
    skip_endpoint "POST /admin/ai/model-configs/:id/limits (destructive)"
    skip_endpoint "POST /admin/ai/prompts (destructive)"
    skip_endpoint "POST /admin/ai/prompts/:id/publish (destructive)"
    skip_endpoint "POST /admin/ai/prompts/:id/retire (destructive)"
  fi

  log_subsection "Admin — Analytics"
  test_endpoint GET "/admin/analytics/dashboard/overview" "200,404" "" "$ADMIN_TOKEN" \
    "GET /admin/analytics/dashboard/:dashboardKey"
  test_endpoint GET "/admin/analytics/reports/learning" "200" "" "$ADMIN_TOKEN" \
    "GET /admin/analytics/reports/learning"
  test_endpoint GET "/admin/analytics/reports/assessment" "200" "" "$ADMIN_TOKEN" \
    "GET /admin/analytics/reports/assessment"
  test_endpoint GET "/admin/analytics/reports/revenue" "200" "" "$ADMIN_TOKEN" \
    "GET /admin/analytics/reports/revenue"

  if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
    skip_endpoint "POST /admin/analytics/reports/learning/:key/run (destructive)"
    skip_endpoint "POST /admin/analytics/reports/assessment/:key/run (destructive)"
    skip_endpoint "POST /admin/analytics/reports/revenue/:key/run (destructive)"
  fi

  log_subsection "Admin — Billing"
  test_endpoint GET "/admin/billing/subscriptions/$DUMMY_STUDENT" "200,404" "" "$ADMIN_TOKEN" \
    "GET /admin/billing/subscriptions/:userId"
  test_endpoint GET "/admin/billing/payments/$DUMMY_STUDENT" "200,404" "" "$ADMIN_TOKEN" \
    "GET /admin/billing/payments/:userId"
  test_endpoint GET "/admin/billing/invoices/$DUMMY_STUDENT" "200,404" "" "$ADMIN_TOKEN" \
    "GET /admin/billing/invoices/:userId"
  test_endpoint GET "/admin/billing/refunds/00000000-0000-0000-0000-000000000001" "200,404" "" "$ADMIN_TOKEN" \
    "GET /admin/billing/refunds/:paymentId"
  test_endpoint GET "/admin/billing/provider-events" "200" "" "$ADMIN_TOKEN" \
    "GET /admin/billing/provider-events"
  test_endpoint GET "/admin/billing/audit-logs" "200" "" "$ADMIN_TOKEN" \
    "GET /admin/billing/audit-logs"

  log_subsection "Admin — Notifications"
  test_endpoint GET "/api/v1/admin/notifications/audit-logs" "200" "" "$ADMIN_TOKEN" \
    "GET /api/v1/admin/notifications/audit-logs"
  test_endpoint GET "/api/v1/admin/notifications/templates" "200" "" "$ADMIN_TOKEN" \
    "GET /api/v1/admin/notifications/templates"
  test_endpoint GET "/api/v1/admin/notifications/templates/00000000-0000-0000-0000-000000000001" "200,404" "" "$ADMIN_TOKEN" \
    "GET /api/v1/admin/notifications/templates/:templateId"
  test_endpoint GET "/api/v1/admin/notifications/events/$DUMMY_STUDENT" "200,404" "" "$ADMIN_TOKEN" \
    "GET /api/v1/admin/notifications/events/:userId"
  test_endpoint GET "/api/v1/admin/notifications/delivery-attempts/00000000-0000-0000-0000-000000000001" "200,404" "" "$ADMIN_TOKEN" \
    "GET /api/v1/admin/notifications/delivery-attempts/:eventId"

  log_subsection "Admin — Operations"
  test_endpoint GET "/admin/operations/dashboard" "200" "" "$ADMIN_TOKEN" \
    "GET /admin/operations/dashboard"
  test_endpoint GET "/admin/feature-flags" "200" "" "$ADMIN_TOKEN" \
    "GET /admin/feature-flags"
  test_endpoint GET "/admin/incidents" "200" "" "$ADMIN_TOKEN" \
    "GET /admin/incidents"
  test_endpoint GET "/admin/maintenance-windows" "200" "" "$ADMIN_TOKEN" \
    "GET /admin/maintenance-windows"
  test_endpoint GET "/admin/support-tickets" "200" "" "$ADMIN_TOKEN" \
    "GET /admin/support-tickets"
  test_endpoint GET "/admin/release-notes" "200" "" "$ADMIN_TOKEN" \
    "GET /admin/release-notes"

  if [[ "$SKIP_DESTRUCTIVE" == "1" ]]; then
    skip_endpoint "POST /admin/feature-flags (destructive)"
    skip_endpoint "PATCH /admin/feature-flags/:id (destructive)"
    skip_endpoint "POST /admin/incidents (destructive)"
    skip_endpoint "PATCH /admin/incidents/:id/status (destructive)"
    skip_endpoint "POST /admin/maintenance-windows (destructive)"
    skip_endpoint "PATCH /admin/maintenance-windows/:id/status (destructive)"
    skip_endpoint "PATCH /admin/support-tickets/:id/status (destructive)"
    skip_endpoint "PATCH /admin/support-tickets/:id/assign (destructive)"
    skip_endpoint "POST /admin/release-notes (destructive)"
    skip_endpoint "POST /admin/release-notes/:id/publish (destructive)"
    skip_endpoint "POST /admin/release-notes/:id/archive (destructive)"
  fi

fi

# =============================================================================
#  SUMMARY
# =============================================================================

echo ""
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${CYAN}  RESULTS${NC}"
echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Total:   ${TOTAL}"
echo -e "  ${GREEN}Passed:  ${PASS}${NC}"
echo -e "  ${RED}Failed:  ${FAIL}${NC}"
echo -e "  ${YELLOW}Skipped: ${SKIP}${NC}"
echo ""

if [[ ${#FAILURES[@]} -gt 0 ]]; then
  echo -e "${RED}${BOLD}Failed endpoints:${NC}"
  for f in "${FAILURES[@]}"; do
    echo -e "  ${RED}✗${NC} $f"
  done
  echo ""
fi

if [[ $FAIL -eq 0 ]]; then
  echo -e "${GREEN}${BOLD}All tested endpoints passed! ✓${NC}"
  exit 0
else
  echo -e "${RED}${BOLD}${FAIL} endpoint(s) failed.${NC}"
  exit 1
fi
