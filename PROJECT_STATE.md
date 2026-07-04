# PROJECT_STATE.md

**This is the first file any session should read.** Faster than
`docs/architect-onboarding/project-memory.json`, faster than the Project
Brain — a 30-second read to know where this project actually stands right
now, before touching anything else.

**Update this file after every merge.** Not at the end of a phase — after
*every* merged PR. If a merge changes completion %, debt, risk, or
priority, this file is stale the moment that merge lands until someone
updates it.

> Last updated: 2026-07-04
> Updated by: session following Phase 21 + P21-021b + apps/web
> delete/restore episode
> Source of truth for the numbers below: `docs/architect-onboarding/project-memory.json`
> (`phase_history`, `known_issues`, `open_questions`) plus direct
> verification during this session. Percentages are a judgment call, not a
> measured metric — see "How completion % is estimated" at the bottom
> before trusting them at face value.

---

## Current Phase

**Phase 21 — complete, fully merged.**
(Phase 20 also fully merged: 23/23 tasks. Phase 21: 21/21 tasks + one
unplanned follow-up, P21-021b.)

No Phase 22 (or equivalent) has been defined yet. **Unknown** whether one
is planned — nothing in the repo or session history states a next phase.

---

## Overall Completion

**~75%** *(estimated — see methodology below)*

| Component | Estimate | Basis |
|---|---|---|
| Backend (`services/backend-api`) | **90%** | AIM pipeline fully wired end-to-end (Phase 20), chat/voice unified (Phase 21), 298 suites / 3154 tests passing, real migrations tracked. Gaps: RLS disabled on 8 tables, some modules built-but-unwired (`VoiceMessageSubmitModule`), `services/api` reference-only status not re-verified since P20-015/017. |
| AIM Engine (`services/aim-engine`) | **85%** | Real mastery/retention/recommendation ported and wired (P20-007/008/009), contract-tested against backend (P20-016). Gap: prerequisite-graph data doesn't exist yet, so that branch of the recommendation engine degrades gracefully rather than being fully real. |
| Flutter (`apps/mobile`) | **65%** | Course locking, placement recommendation, AI Teacher/Voice Teacher unified session all wired (Phase 21). Gaps: microphone capture not wired to a real recorder plugin (raw audio is a placeholder — documented in `voice_teacher_page.dart`'s own header comment), no Flutter caller yet for `POST /lessons/:id/progress|complete` (found during P21-005), "ready-to-play greeting" relies on the generic per-message play button rather than a dedicated hero state. |
| AI Teacher | **75%** | Focus directives, difficulty-decision surfacing, frustration/engagement signal, unified greeting generation all real and backend-tested. Gap: some of this isn't yet reflected in a dedicated Flutter-side UI treatment beyond what P21-020 built. |
| Voice Teacher | **40%** | Backend orchestration (STT→AI Teacher→TTS), barge-in, lazy TTS, unified persistence into `ai_chat_messages` are all real. **Biggest gap: no real microphone/recorder plugin wired on the Flutter side** — every backend flow has been proven against a placeholder audio buffer, not real captured speech. This is the single largest gap in the whole project right now. |

---

## Technical Debt

- **Voice session legacy tables** — `voice_sessions`/`voice_messages`/`voice_transcripts` are historical-only per P21-021, but `voice_messages` still isn't fully frozen: `voice_rate_limit_policy.service.ts` originally read from it (fixed in P21-021b to read `ai_chat_messages` instead), and `VoiceMessageSubmitModule`'s `AudioUploadService` no longer writes there either as of P21-021b — but the module itself is still not wired into the live `VoiceTeacherModule`, so this whole path is built but dormant.
- **Missing microphone capture** — Voice Teacher's entire backend pipeline is proven against a placeholder audio byte buffer; no real recorder plugin integration exists yet in Flutter.
- **RLS disabled on 8 tables** — `student_learning_goals`, `daily_challenge_templates`, `admin_broadcast_schedules`, `achievement_definitions`, `student_achievements`, `xp_levels`, `student_level_state`, `ai_focus_directives`. Flagged by Supabase's own advisor as critical exposure to anon/authenticated roles. Not fixed — needs real RLS policies, not just flipping the flag on.
- **`apps/web` has no CI coverage** and duplicates admin features already in `apps/admin-dashboard` (notifications/AI/analytics) — its Parent Dashboard has no known equivalent elsewhere, so it can't be deleted without a product decision on where parents' web UI actually lives.
- **`.github/dependabotggggggg.yml`** — malformed filename means GitHub never reads it; it also has a stale `/apps/web` entry regardless.
- **`services/api` reference-only status** — documented as of P20-015 but not re-verified since; drift here would be a real authority-boundary violation if something started importing from it again.
- **Prisma tooling mismatch** — `@prisma/client@7.8.0` vs `prisma@6.19.3` in this environment breaks `prisma generate`/`prisma validate` locally without an explicit `DATABASE_URL`; doesn't block the app itself (raw `pg` via `DatabaseService`), but blocks a clean local Prisma workflow.

## Current Risks

- **No feature flag around the Phase 20/21 rollout.** The Phase 20 punch list explicitly flagged this as a decision point ("worth deciding whether you want a feature flag... or comfortable with it going live for everyone") — no flag was built. Every student's next lesson attempt now genuinely calls the AIM Engine and gets gated by level; there is no staged/cohort rollout mechanism if that needs to be dialed back.
- **RLS gap is a live data-exposure risk**, not just a debt item — `student_level_state` in particular drives real gating decisions and is currently writable/readable by the anon key.
- **Legacy voice tables still partially active** — anyone extending voice features without reading the P21-021/P21-021b history could accidentally reintroduce a write path into `voice_messages`, recreating the exact FK coupling problem P21-021b just fixed.
- **Migration risk during any future schema change** — no working local `prisma migrate deploy` path was used this session (applied instead via `mcp__Supabase__apply_migration` directly against the live project); if that workflow isn't restored, future migrations risk schema.prisma/live-DB drift if someone applies SQL without updating the Prisma model in the same step.
- **`apps/web` deletion/restoration churn** — it was deleted (PR #1306), then restored on a separate branch per user request; current merged state on `main` should be re-confirmed before anyone assumes either way.

## Next Priority

**Unknown — no Phase 22 (or equivalent) has been assigned yet.**

If prioritizing from open debt/risk instead of a new phase, the candidates
already on record are:
1. Decide the RLS fix for the 8 flagged tables (real risk, not just debt).
2. Decide whether `chore/restore-apps-web` gets merged, and what happens
   to the Parent Dashboard long-term (delete for real, keep, or migrate
   its features into `admin-dashboard`/`student-web`).
3. Wire a real microphone/recorder plugin into Voice Teacher — closes the
   largest completion gap in the table above.
4. Decide on the feature-flag question for the Phase 20/21 rollout,
   before it's a live incident instead of a design choice.

---

## How completion % is estimated

There is no automated coverage/completion metric in this repo. These
numbers are a judgment call based on: (a) how many of that component's
planned tasks across Phase 20/21 are merged and tested, (b) whether known
gaps documented in the code itself (comments, TODOs, "known gap" notes)
are closed, and (c) real test-suite pass counts where available. Treat
them as directional, not precise — and update them honestly (including
downward) after every merge, not just upward.
