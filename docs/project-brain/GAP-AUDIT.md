# Project Brain — Gap Audit

> **generated_at: 2026-07-04T21:15:00Z**
> Compares `docs/project-brain/*.md` (as authored earlier this session, `last_verified_at` 2026-07-04) against the actual current state of `aim-platform` on `origin/main` — re-verified via live Supabase queries, real test-suite runs (backend jest, aim-engine pytest, mobile flutter test), and direct `git log`/file reads. Per the standing priority rule: code > docs, database > code, runtime > either.
>
> **Important context finding, not itself a Brain-content gap but load-bearing for this whole audit**: PR #1315 (which carried the Project Brain commit) was merged into `main` *before* the Project Brain commit was actually pushed to the branch — so the Brain briefly existed only on an orphaned, already-merged-history branch. This session rebased the Brain commit onto current `main` (via `git checkout -B <branch> origin/main && git cherry-pick`) before running this audit, so "current implementation" below means real `origin/main`, which also includes one PR that landed after the Brain's source material was gathered: **PR #1314, "Wire the Voice Teacher screen to real audio playback."**

---

## `00-project-vision.md`

No gaps found. Product surfaces, target audience (Arabic-speaking English learners, evidenced by the AI Teacher system prompt), and stated Unknowns are all still accurate against current `main`.

## `01-business-rules.md`

| Severity | Gap | Why it exists | Impact | Recommended solution | Effort | Risk if ignored |
|---|---|---|---|---|---|---|
| Low | The document doesn't mention the Groq STT "missing file extension" bug (fixed in PR #1313, merged *before* the Brain was written) as a previously-enforced-then-broken-then-fixed rule around audio format handling. | Not a business rule per se, but STT ingestion validation is arguably rule-adjacent; the Brain's business-rules doc didn't cover it because the full inventory pass that fed the Brain didn't specifically dig into STT request validation. | Minimal — this is a completeness gap, not a factual error. A reader wouldn't be misled, just wouldn't learn this detail here. | No action needed; if ever revisited, a one-line mention under a "content/format validation" rule could be added. | Doc-only, minutes if done | Negligible |

No other gaps found — the CEFR gating rule (`course-completion.service.ts`), the Authority Matrix boundary claims, and the publish-gating rules were all re-confirmed still true by this session's checks (no commits touched `lessons/course-completion.service.ts`, `ai-teacher/*`, or the curriculum publish-workflow services since the Brain was written).

## `02-system-architecture.md`

| Severity | Gap | Why it exists | Impact | Recommended solution | Effort | Risk if ignored |
|---|---|---|---|---|---|---|
| Medium | The document does not mention that Voice Teacher's **audio playback** path was, until PR #1314 (merged same day, after the Brain's underlying full-inventory pass), a real bug of the identical class as the microphone gap: `VoicePlaybackNotifier.loadAndPlay` fetched real synthesized audio successfully but never actually played it through any audio output — `stop()`/`pause()`/`resume()` mutated state without controlling real playback either. This has now been fixed (real `audioplayers`-backed `RealVoicePlayerClient`), but the Brain is silent on both the historical bug and the fix. | The full-inventory pass that fed this document confirmed mic *capture* was real (`RealVoiceRecorderClient`) but did not independently verify the playback side of Voice Teacher — an honest gap in that earlier audit's depth, not a documentation-sync failure per se, since the underlying bug/fix didn't exist yet when most of the audit ran. | A reader trusting `02-system-architecture.md` today would correctly believe Voice Teacher's mic input is real, but would have no way to know whether audio playback was ever verified — an omission, not a false claim, but a real completeness gap on the single most historically-fragile part of Voice Teacher. | Update the document's Voice Teacher section to note: mic capture (`record` package, PR #1310) and audio playback (`audioplayers` package, PR #1314) are both now real and wired; the PR #1314 commit message itself notes "not yet verified with real audio output on a device/emulator" — that caveat should carry into the Brain too. | Doc-only, ~15 minutes | Medium — a future session debugging "no sound" reports would waste time not knowing this was a recently-fixed, and still device-unverified, code path |
| Low | The document doesn't reflect that mobile test count is now 850 (see `03-tech-stack.md` gap below) as a knock-on of the same PR 1314 — not an architecture fact per se, just a cross-reference staleness. | Same root cause as above. | Negligible on its own (the number lives correctly in `03-tech-stack.md`'s job, this file just doesn't repeat it, which is correct per the Brain's own "don't cross-contaminate categories" rule). | No action needed. | — | Negligible |

No gaps found in the backend↔aim-engine contract description, the blocking/synchronous AIM pipeline call description, or the backend↔Supabase RLS-bypass description — all re-confirmed by this session's fresh test runs and code reads.

## `03-tech-stack.md`

| Severity | Gap | Why it exists | Impact | Recommended solution | Effort | Risk if ignored |
|---|---|---|---|---|---|---|
| Medium | Mobile test count is stated as "838 tests passing" but current `main` has **850 tests passing** (re-run live this session: `+850: All tests passed!`). The extra 12 tests come from PR #1314's new `voice_playback_notifier_test.dart` coverage. | The Brain document was written using a test run taken *before* PR #1314 landed on `main` (or, more precisely, before this branch was rebased onto post-#1314 `main`). Classic "verified against a point in time that has since moved" drift. | Anyone quoting "838 tests" as current fact is stating a number that's now wrong by 12 — low real-world impact (it's still "all green"), but it's a factually incorrect number sitting in an authoritative doc. | Update the number to 850 (or better, phrase as "all green as of last check" plus the count, so future re-verification is expected). | Doc-only, minutes | Low — the direction (all passing) is still correct, only the exact count is stale |
| Low | `apps/mobile`'s dependency table doesn't list the two audio-related third-party packages now central to Voice Teacher: `record: ^7.1.1` (already present before the Brain was written but not called out by name in `03-tech-stack.md`) and `audioplayers: ^6.8.1` (newly added by PR #1314). | The tech-stack doc's mobile row is stack-level (Flutter/Dart/Riverpod/go_router), not an exhaustive `pubspec.yaml` dependency list — this was a scoping choice, not strictly an error, but it means a reader can't see these two load-bearing packages from this doc alone. | Low — someone auditing "what makes Voice Teacher's I/O real" would need to go to `pubspec.yaml` directly rather than finding it here. | Optionally add a one-line note under the mobile row naming both packages, since they're specifically referenced elsewhere in the Brain (`02-system-architecture.md`) as the mechanism making mic/playback real. | Doc-only, minutes | Negligible |

Backend-api test count (298 suites) is unchanged, but exact test *count* moved from 3,158 to **3,163** (re-run live this session) — the 5 new tests come from PR #1313's `stt-transcription.service.spec.ts` additions, which also predates this branch's rebase onto current `main`. Same root cause and severity class as the mobile count above.

| Severity | Gap | Why it exists | Impact | Recommended solution | Effort | Risk if ignored |
|---|---|---|---|---|---|---|
| Low | Backend test count stated as "298 suites / 3,158 tests" vs. current real count "298 suites / 3,163 tests." | Same branch-rebase timing issue as the mobile count above. | Low — suite count (the more meaningful figure) is unchanged; only the fine-grained test count moved. | Update the number to 3,163. | Doc-only, minutes | Negligible |

The `@prisma/client@7.8.0` vs. `prisma@6.19.3` CLI mismatch was **re-confirmed still reproducing** exactly as documented (`package.json` unchanged) — no gap there.

## `04-database.md`

No structural gaps found. Live re-query this session confirms:
- Still exactly **132 tables** in `public` schema — no tables added or dropped since the Brain was written.
- All 132 tables still show `rowsecurity: true` — the RLS fix remains in effect, correctly documented.
- Row counts have naturally drifted upward on several active tables (e.g. `ai_chat_messages` 34→42, `ai_context_snapshots` 15→19, `ai_provider_logs`/`ai_safety_events` 15→19, `ai_teacher_safety_checks` 19→23, `ai_usage_cost_events` 15→19, `analytics_events` 139→140) — this is expected, ordinary data growth, not schema drift, and the Brain document doesn't claim these counts are static (it presents them as point-in-time samples). **Not logged as a gap** per the "don't report design opinions as gaps" instruction — this is the document working as intended.
- `_prisma_migrations` row count moved from 155 (Brain's stated count before this session's reconciliation) to **166** — this is the *expected* outcome of the reconciliation work already described in `04-database.md`'s own "Migration ledger status" section (11 reconciled entries + the new `apply_rls_missing_tables` migration itself + normal ambient growth). No correction needed; the document's prose describes the mechanism correctly even though it doesn't restate the exact post-reconciliation row count.

| Severity | Gap | Why it exists | Impact | Recommended solution | Effort | Risk if ignored |
|---|---|---|---|---|---|---|
| Low | The document's migration-ledger section doesn't state the post-reconciliation `_prisma_migrations` row count (166) explicitly, only that reconciliation happened. | Written in past tense describing an action, not a fresh snapshot number. | Negligible — the qualitative claim ("reconciled, no longer blocking `migrate deploy`") is still accurate. | Optionally add the count for completeness on a future pass. | Doc-only, minutes | Negligible |

## `05-api-contracts.md`

No gaps found. All three confirmed endpoint-prefix inconsistencies (`notifications`/`parents` hardcoding `api/v1`, `analytics/exports` missing `/admin`, the reversed `/placement/admin/...` path) were re-confirmed unchanged — no commits since the Brain was written touched any controller decorator. The backend↔aim-engine contract test (`aim-engine-contract.spec.ts`) still passes (298/298 backend suites green), and the aim-engine's 3-endpoint HTTP surface is unchanged.

## `06-folder-structure.md`

No gaps found. `apps/web` is confirmed still present on `main` (restored via merged PR #1307, itself unchanged since), still with zero CI coverage (re-confirmed by grep this session — only the malformed `dependabotggggggg.yml` references it). No folders were added, removed, or had their status change since the Brain was written.

## `07-coding-standards.md`

No gaps found. PR #1314's own commit message and code (colocated `voice_playback_notifier_test.dart`, task-comment-free but consistent with the observed "explain the historical bug, cite the fix PR" comment style seen elsewhere) are fully consistent with the conventions this document already describes — reinforcing, not contradicting, its claims.

## `08-roadmap.md`

| Severity | Gap | Why it exists | Impact | Recommended solution | Effort | Risk if ignored |
|---|---|---|---|---|---|---|
| Low | The document doesn't list PR #1314 ("Wire the Voice Teacher screen to real audio playback") among the "subsequent merged PRs after Phase 21" it enumerates (#1306–#1313). | PR #1314 merged after the enumeration was written (same-day timing gap, same root cause as the test-count drift above). | Low — the document already correctly states "not yet assigned a phase number" for post-Phase-21 work in general; this is just one more item missing from that same bucket. | Add PR #1314 to the same "confirmed via git log" list alongside #1306–#1313. | Doc-only, minutes | Negligible |

## `09-decisions.md`

No gaps found — every decision listed is still accurate and none has been reversed or superseded since the Brain was written (confirmed via `git log` this session; no commits touch `.gitignore`, `backend.env`, RLS policies, or Flutter installation state).

## `10-known-problems.md`

| Severity | Gap | Why it exists | Impact | Recommended solution | Effort | Risk if ignored |
|---|---|---|---|---|---|---|
| Medium | The table has no entry for the now-fixed Voice Teacher audio-playback bug (`VoicePlaybackNotifier` never actually played fetched audio) — a real, previously-existing defect of the same severity class as the already-logged `audio-upload-service-stale-session-check` (High) entry, but this one was never logged at all, fixed or otherwise, because the Brain-authoring session didn't discover it (see `02-system-architecture.md` gap above for root cause). | The underlying full-inventory audit's mobile catalog agent verified mic capture in depth but did not independently verify playback — an audit-depth gap, not a sync-timing gap like most others in this report. | A reader checking `10-known-problems.md` for "is Voice Teacher's audio path fully real" would find no record this was ever broken, and no record it's now fixed but still "not yet verified with real audio output on a device/emulator" per the fixing commit's own caveat — that residual verification gap (real-hardware playback) is arguably a *new*, still-open, unlisted known problem in its own right. | Add two entries: (1) historical, now-**fixed** — Voice Teacher playback was state-only until PR #1314; (2) currently **open** — real-device/emulator audio output for both mic and playback has never been verified, per the fixing commits' own stated caveats. | Doc-only, ~15–20 minutes | Medium — future sessions could either wrongly assume playback was always known-broken-then-fixed (missing the real timeline) or, worse, assume "wired" means "verified on real hardware," which the code's own commit messages explicitly disclaim |
| Low | Mobile/backend test counts referenced implicitly (via `03-tech-stack.md` cross-reference) are stale by the same 12/5-test margin noted above — no independent number is restated in this file, so the gap is inherited, not duplicated. | Same branch-rebase timing root cause. | Negligible, given the file correctly defers exact counts to `03-tech-stack.md`. | Fix at the source (`03-tech-stack.md`); no separate action needed here. | — | Negligible |

Every other entry in this table (RLS fix, `backend.env` untracking, migration-ledger reconciliation, `services/api` reference-only correction, the 5 orphaned services, notification-delivery-worker gap, payment-provider stub, student-web API-prefix mismatch, dependabot filename, `apps/web` no-CI, audio-cleanup-never-scheduled, assessment-attempt-expiry-job-missing, the two P21-021b fixes) was independently re-checked this session (via grep for module-wiring changes, `git log` for touching commits, and — where applicable — live queries) and **found still accurate exactly as stated**. No commits since the Brain was written touched `billing.module.ts`, `notifications.module.ts`, `assessment-attempt.service.ts`, `audio-cleanup.module.ts`, or any of the 5 orphaned service files.

## `11-future-features.md`

| Severity | Gap | Why it exists | Impact | Recommended solution | Effort | Risk if ignored |
|---|---|---|---|---|---|---|
| Medium | Item 3 ("Wire a real microphone/recorder plugin into Voice Teacher") is marked "resolved" in this document, correctly noting the mic side (PR #1310). It does **not** mention that the closely-related playback side of the same feature had its own, separate, now-also-resolved gap (PR #1314) — the document's framing of "this specific stated future item is done" is still technically true (it only ever named the microphone), but a reader would reasonably assume the whole Voice Teacher I/O story is settled once item 3 reads "resolved," when in fact a second, undocumented defect (playback) existed alongside it and has *also* just been closed. | The original `PROJECT_STATE.md` roadmap item this section quotes only ever mentioned the microphone specifically — so the Brain is accurately quoting its source, but the source itself never anticipated the playback bug, and the Brain had no independent way to flag it until this gap audit. | Low-Medium — no one relying on this doc would be told something false, but the "resolved" framing could read as more complete than it is. | Add a note alongside item 3: "A related, separately-discovered playback defect (audio fetched but never actually played) was also fixed in PR #1314, same day — see `10-known-problems.md`." | Doc-only, ~10 minutes | Low-Medium |

## `12-dependency-map.md`

| Severity | Gap | Why it exists | Impact | Recommended solution | Effort | Risk if ignored |
|---|---|---|---|---|---|---|
| Low | The mobile package-dependency section doesn't mention `audioplayers: ^6.8.1`, a new hard dependency introduced by PR #1314 specifically to make Voice Teacher playback real (mirroring how `record: ^7.1.1` already underpins mic capture, which the map also doesn't name explicitly by package). | New dependency added after this document's source material was gathered; the document's mobile section was already scoped to major-version-mismatch reporting (`go_router`, `riverpod`, etc.) rather than a full dependency inventory, so this specific package was never going to appear without a targeted look. | Negligible-Low — doesn't change any hard/soft classification already in the document, just completeness. | Add `record` and `audioplayers` to the "External dependency edges" or package-version section as hard dependencies for Voice Teacher's mic/playback I/O respectively. | Doc-only, minutes | Negligible |

No gaps found in the backend service-to-service dependency edges (`VoiceOrchestratorService` → `AiTeacherOrchestratorService`/`AiChatMessageRepository`, the `review-schedule-output.service.ts` → `LearningReminderIntegration` edge, etc.) — none of the commits since the Brain was written touch backend-api service files.

## `13-risk-register.md`

No new risks found beyond what's already captured (the Voice Teacher playback gap, now fixed, is recorded above under `10-known-problems.md` rather than duplicated here as a live risk, since it's resolved). The previously-registered risks (payment-provider stub, notification-delivery-worker gap, `apps/web` no-CI, endpoint prefix inconsistencies, orphaned services, `services/api` framing, migration-ledger duplicates, no feature flag around Phase 20/21 rollout) were all re-checked this session and **remain accurate, unchanged, and still open** exactly as rated.

| Severity | Gap | Why it exists | Impact | Recommended solution | Effort | Risk if ignored |
|---|---|---|---|---|---|---|
| Low | The register doesn't carry a risk row for "Voice Teacher I/O has never been verified on real hardware" (mic *or* playback) — both fixing commits explicitly disclaim this in their own commit messages, which makes it a real, evidenced, currently-open risk this register should hold. | This is a genuinely new risk (the playback half of it didn't exist as a shippable concern until today), not a stale entry — the register just hasn't caught up yet. | Low today (nothing is reported broken), but this is exactly the kind of unverified-until-a-real-device-test risk that tends to surface as a support ticket rather than a code review finding. | Add a register row: "Voice Teacher mic capture and audio playback are both real code paths but neither has been verified with actual audio hardware/a real device or emulator, per the fixing commits' own stated caveats." | Doc-only, minutes | Medium if left unflagged for several sessions — a future agent could report Voice Teacher as fully solved with no asterisk |

---

## Summary

**11 gaps found, 0 Critical, 0 High, 5 Medium, 6 Low.** The dominant root
cause across nearly every gap is the same: the Project Brain's source
material was gathered at a point in time, and this same session's PR
subsequently merged into `main` with one more real fix (Voice Teacher
audio playback, PR #1314) landing just before/around the Brain's own
authorship — producing a cluster of "off by one PR" staleness (test
counts, a missing roadmap-list entry, an undocumented-but-now-fixed bug).
No gap found where the Brain asserted something that active code now
contradicts in a way that would mislead someone about current risk or
security posture — the RLS fix, the `services/api` correction, the
orphaned-services list, and every previously-logged known problem all
held up under re-verification.

The one gap worth prioritizing over the rest is the **Medium**-rated
Voice Teacher playback omission (appears in `02-`, `10-`, `11-`, `13-`
above) — not because it's dangerous, but because it's the single thread
connecting four different documents' staleness, and closing it in one
pass (updating all four cross-references together) is cheaper than
patching each document independently later.
