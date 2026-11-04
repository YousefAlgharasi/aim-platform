# Student web E2E: placement test (Playwright)

Real browser, real backend. Runs on two viewports (desktop + Pixel 7).

```bash
cd apps/student-web/e2e
npm install && npx playwright install chromium

# Mode A - fresh throwaway student per run (needs the Supabase service key)
E2E_SERVICE_ROLE_KEY=... E2E_AUTH_URL=http://127.0.0.1:8000 \
BASE_URL=https://aim-learn.com API_BASE=https://api.aim-learn.com \
npx playwright test

# Mode B - an existing NEW student (no placement choice yet)
E2E_EMAIL=... E2E_PASSWORD=... npx playwright test
```

On the server, without installing anything:

```bash
docker run --rm --network host -v "$PWD":/e2e -w /e2e \
  -e E2E_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" -e E2E_AUTH_URL=http://127.0.0.1:8000 -e CI=1 \
  mcr.microsoft.com/playwright:v1.49.1-jammy sh -c "npm install && npx playwright test"
```

Then purge leftovers: `scripts/purge-e2e-users.sh`.

Tuning: `E2E_PACE_MS` (delay per answer, default 1500) and `E2E_SETTLE_MS`
(wait before starting so the API rate-limit window resets, default 62000).
Writing/speaking questions are skipped (AI graded / need a microphone).
