# Speaking and Writing Deferral

> Phase 4 — P4-036
> Scope: Placement Test system only.

---

## 1. Purpose

This document records the decision to defer speaking and writing assessment from Phase 4 of the AIM Platform Placement Test.

Phase 4 delivers an objective placement MVP covering grammar, vocabulary, reading, and listening. Speaking and writing placement are valid future capabilities but are not required to establish a reliable starting level estimate for Phase 4 learners.

---

## 2. Decision

**Speaking and writing placement assessment are deferred out of Phase 4.**

They are not blocked permanently. They are explicitly scoped to a later phase once the objective placement foundation is stable and the platform has the infrastructure to support audio recording, submission, and backend evaluation.

---

## 3. Rationale

### 3.1 Objective MVP First

Grammar, vocabulary, reading, and listening are fully objective skill areas. Each answer is either correct or incorrect. The backend can score them deterministically without any model inference, audio pipeline, or human reviewer.

Speaking and writing require:

- audio or text capture infrastructure;
- backend evaluation logic or model integration;
- rubric design for open-ended responses;
- human or AI review workflows.

None of these are needed to produce a reliable A1 / A2 / B1 level estimate from the objective sections.

### 3.2 Scope Protection

Phase 4 is a placement foundation phase. Its non-negotiable rules (see `docs/phase-4/placement-test-charter.md`) prohibit:

- AIM Engine runtime integration;
- AI Teacher integration;
- open-ended response evaluation.

Implementing speaking or writing placement in Phase 4 would require at least one of these capabilities and would expand scope beyond the placement MVP boundary.

### 3.3 Delivery Risk

Adding audio capture or open-ended text evaluation to Phase 4 would:

- increase delivery time for the objective placement MVP;
- introduce infrastructure dependencies that are not yet designed;
- couple Phase 4 completion to audio/AI pipeline readiness.

Deferring removes these risks without reducing the placement test's ability to assign a starting level.

---

## 4. What Is In Scope for Phase 4

The Phase 4 placement test covers four objective skill sections:

| Section | Skill Code | Assessment Type |
|---|---|---|
| Grammar | `grammar` | Multiple choice / objective |
| Vocabulary | `vocabulary` | Multiple choice / objective |
| Reading | `reading` | Comprehension / objective |
| Listening | `listening` | Comprehension / objective |

These four sections are sufficient to assign an estimated CEFR level (A1, A2, or B1) per the placement blueprint rules in `docs/phase-4/placement-blueprint-rules.md`.

---

## 5. What Is Deferred

The following are out of scope for Phase 4 and must not be implemented, stubbed, or scaffolded in Phase 4 tasks:

| Capability | Reason for Deferral |
|---|---|
| Speaking placement section | Requires audio capture and evaluation infrastructure |
| Writing placement section | Requires open-ended text evaluation or human review |
| Audio recording in Flutter | Not part of Phase 4 mobile scope |
| AI-evaluated responses | AIM Engine runtime integration is forbidden in Phase 4 |
| Human review queue for placement | Out of Phase 4 placement MVP scope |
| Rubric-based scoring | Backend scoring must remain deterministic in Phase 4 |

---

## 6. Future Phase Conditions

Speaking and writing placement may be introduced in a later phase when all of the following conditions are met:

1. The objective placement foundation (Phase 4) is complete and stable.
2. Audio capture and submission infrastructure is designed and implemented.
3. A backend evaluation service for spoken or written responses exists.
4. Scoring rules for speaking and writing placement are defined and documented.
5. The AIM Engine or a dedicated evaluation service is ready to process open-ended responses in a controlled placement context.
6. A new phase charter explicitly includes speaking and writing placement as in-scope work.

Until these conditions are met, speaking and writing placement must not be added to any Phase 4 task output.

---

## 7. Impact on Placement Result

The placement result in Phase 4 reflects objective section performance only.

| Result Field | Source |
|---|---|
| Estimated CEFR level | Backend scoring of grammar, vocabulary, reading, listening |
| Skill map | Backend-computed from objective section scores |
| Weakness indicators | Backend-computed from objective section performance |
| Initial learning path | Backend-generated from objective placement result |

The absence of speaking and writing does not make the Phase 4 placement result invalid. The result is explicitly scoped to objective skill estimation. Future phases may enrich the result with speaking and writing signals once those sections are built and validated.

---

## 8. Enforcement

Phase 4 tasks must not implement speaking or writing placement work even if a task description could be interpreted to include it.

If any task execution would require:

- audio recording, submission, or evaluation;
- open-ended text submission or evaluation;
- speaking or writing rubric scoring;

the agent must stop and mark the task Blocked, citing this document.

---

## 9. References

- `docs/phase-4/placement-test-charter.md` — Phase 4 scope and non-negotiable rules (P4-001)
- `docs/phase-4/placement-scope-boundaries.md` — Full allowed and forbidden work list (P4-003)
- `docs/phase-4/placement-blueprint-rules.md` — Section structure and question count rules (P4-029)
- `docs/phase-4/no-aim-runtime-rule.md` — AIM Engine runtime prohibition (P4-004)

---

## 10. Metadata

| Field | Value |
|---|---|
| Task ID | P4-036 |
| Branch | phase4/P4-036-placement-speaking-writing-deferral |
| Priority | P2 |
| Dependency | P4-003 |
| Output | docs/phase-4/speaking-writing-deferral.md |
