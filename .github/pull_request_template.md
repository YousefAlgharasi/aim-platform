## Summary

Briefly describe what this PR does and why.

---

## Phase 1 Compliance Checks

All boxes must be checked before this PR can be merged.

### Docs Alignment

- [ ] All output files match the task definition in `docs/tasks/phase_1_task_prompts.md`.
- [ ] No planning or architecture document was modified without a corresponding task authorizing the change.
- [ ] If a new document was created, it does not contradict `docs/phase-1/system-foundation-charter.md` or `docs/product/non-negotiables.md`.

### Tests

- [ ] All existing tests pass.
- [ ] New code includes tests where the task prompt requires them.
- [ ] If tests were skipped or are not applicable, the reason is documented in the Notion completion comment.

### No Student Web App

- [ ] This PR does not create a Student Web App (`apps/web/` extension, `apps/student-web/`, or any React/Next.js learner interface).
- [ ] No new React or Next.js learner app code is added.
- [ ] The existing `apps/web/` directory was not extended.

### No Client-Side AIM Logic

- [ ] No mastery calculation is implemented in Flutter, admin dashboard, or any client.
- [ ] No student level calculation is implemented in any client.
- [ ] No weakness detection is implemented in any client.
- [ ] No difficulty adaptation is implemented in any client.
- [ ] No retention calculation is implemented in any client.
- [ ] No recommendation logic is implemented in any client.
- [ ] Flutter does not call the AIM Engine directly.
- [ ] Flutter does not call the AI Teacher Gateway directly.

### No Secrets

- [ ] No AI provider API keys are committed.
- [ ] No Supabase service-role keys are committed.
- [ ] No database credentials (`DATABASE_URL` with real values) are committed.
- [ ] No real `.env` file is committed.
- [ ] All environment variables reference `.env.example` placeholders only.

### No Speed-as-Mastery

- [ ] `response_time_seconds`, average response time, and speed score are not used as direct mastery, level, or difficulty-increase signals.
- [ ] If speed-related fields are present, they are used only as educational behavior evidence (hesitation, possible guessing, fatigue), not as mastery or level inputs.

---

## Task Reference

Notion Task ID: `P1-XXX`  
Commit: (fill in)

---

## Files Changed

List the files created or modified by this PR:

-
-
