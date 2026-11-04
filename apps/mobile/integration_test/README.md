# Mobile E2E: placement test

Drives the real app against the real backend: sign in -> first-login gate ->
placement test (all objective questions) -> result screen.

```bash
cd apps/mobile
flutter pub get
flutter gen-l10n

flutter devices        # pick an emulator / simulator / desktop device
flutter test integration_test/placement_e2e_test.dart -d <device-id> \
  --dart-define=BACKEND_API_BASE_URL=https://api.aim-learn.com \
  --dart-define=AIM_ENV=production \
  --dart-define=E2E_EMAIL=<new student email> \
  --dart-define=E2E_PASSWORD=<password>
```

Notes
- The student must be **new**: the gate (and the "take the test" choice) is shown
  only once per student. Create a fresh student per run - e.g. on the server:
  `python3 tests/e2e/placement_live_e2e.py` shows how (register via
  `/auth/register`, confirm the email, then `KEEP_USER=1` keeps it).
  Remove leftovers with `scripts/purge-e2e-users.sh`.
- Writing and speaking questions are skipped (AI graded / need a microphone).
- The test paces itself (~1.2 s per answer) to stay under the API rate limit
  (60 requests/min per IP).
- If the app copy changes, update the `_T` constants at the top of the test.
