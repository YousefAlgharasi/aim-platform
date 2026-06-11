#!/usr/bin/env bash
set -euo pipefail

echo "AIM env/secret safety check"

fail() {
  echo "ERROR: $1" >&2
  exit 1
}

warn() {
  echo "WARN: $1" >&2
}

# Only inspect tracked files. This avoids reading local untracked .env files.
tracked_files="$(git ls-files)"

# Block committed env files except explicit examples/templates.
blocked_env_files="$(
  printf '%s\n' "$tracked_files" \
    | grep -E '(^|/)\.env($|\.|/)|(^|/).+\.env$' \
    | grep -Ev '(^|/)\.env\.example$|(^|/)\.env\.template$|(^|/)example\.env$' \
    || true
)"

if [ -n "$blocked_env_files" ]; then
  echo "$blocked_env_files" >&2
  fail "Committed env files are not allowed. Use .env.example or .env.template only."
fi

# Confirm required ignore rules exist.
if [ ! -f ".gitignore" ]; then
  fail ".gitignore is missing."
fi

grep -Eq '^\.env$' .gitignore || fail ".gitignore must exclude .env"
grep -Eq '^\.env\.local$' .gitignore || fail ".gitignore must exclude .env.local"

# Block obvious real secret assignment patterns in tracked source/docs/config.
# Allows placeholders such as <placeholder>, <project-ref>, example/test/local values.
secret_pattern='(SUPABASE_SERVICE_ROLE_KEY|SUPABASE_JWT_SECRET|AI_PROVIDER_API_KEY|AIM_AI_PROVIDER_API_KEY|JWT_SECRET|DATABASE_URL|OPENAI_API_KEY|ANTHROPIC_API_KEY|DEEPSEEK_API_KEY|GOOGLE_API_KEY|FIREBASE_PRIVATE_KEY|PRIVATE_KEY)[[:space:]]*[:=][[:space:]]*["'"'"']?([^"'"'"' <>{}#]+)'

matches="$(
  printf '%s\n' "$tracked_files" \
    | grep -Ev '(^|/)(node_modules|dist|build|\.git)/' \
    | xargs grep -nEI "$secret_pattern" 2>/dev/null \
    | grep -Ev '<placeholder>|<project-ref>|<password>|example|example\.com|example\.test|localhost|127\.0\.0\.1|dummy|fake|test|changeme|development|postgresql://postgres\.<project-ref>:<password>@<host>:5432/postgres' \
    || true
)"

if [ -n "$matches" ]; then
  echo "$matches" >&2
  fail "Potential committed secret detected."
fi

# Block common private key blocks.
private_key_matches="$(
  printf '%s\n' "$tracked_files" \
    | grep -Ev '(^|/)(node_modules|dist|build|\.git)/' \
    | xargs grep -nE '-----BEGIN (RSA |EC |OPENSSH |DSA |)?PRIVATE KEY-----' 2>/dev/null \
    || true
)"

if [ -n "$private_key_matches" ]; then
  echo "$private_key_matches" >&2
  fail "Private key material must not be committed."
fi

echo "AIM env/secret safety check passed."
