# No Client-Side Placement Scoring Rule

> Phase 4 — P4-035
> Scope: Placement Test system only.

---

## 1. Purpose

This document establishes the binding rule that **Flutter and all other clients must never compute, derive, estimate, or store placement scores, CEFR levels, skill signals, weakness maps, or initial learning paths locally**.

All placement scoring, level assignment, skill map computation, weakness map derivation, and initial path generation are backend-authoritative operations. The backend is the sole source of truth for all placement outputs.

This rule applies to every Phase 4 task, every Flutter developer, and every agent executing Phase 4 work. It may not be overridden by task descriptions, implementation convenience, or product pressure.

---

## 2. The Rule

> **Flutter must not score placement locally. The backend is the final authority for all placement scoring and result generation.**

This means Flutter must never:

- Compute a placement score from answers submitted locally.
- Derive or estimate a CEFR level (A1, A2, B1) from any local data.
- Compute a skill mastery signal (`strong`, `developing`, `emerging`) from local answer state.
- Derive or rank a weakness map from local skill signals.
- Derive or order an initial learning path from local weakness data.
- Store threshold constants (score thresholds, signal thresholds, section weights) in Flutter code.
- Contain level-mapping functions or scoring logic, even as helpers or utilities.
- Display a derived level or score before the backend result API responds.
- Cache a computed level or score and serve it from local storage.

---

## 3. What Flutter Is Allowed to Do

Flutter's role in the placement flow is strictly limited to:

| Allowed Action | Description |
|---|---|
| Display questions | Render question prompt, type, and options received from the backend |
| Record answer selections | Hold the student's selected answer locally until submission |
| Submit answers | Send each answer to the backend submit API (`POST /placement/attempts/:id/answers`) |
| Poll or fetch result | Call the result API (`GET /placement/attempts/:id/result`) after attempt completion |
| Display result fields | Show `estimatedLevel`, `skillName`, and `signal` exactly as returned by the backend |
| Navigate based on result | Move to the next screen after the result is received |

Flutter must not perform any computation on the data it receives beyond rendering and navigation.

---

## 4. What Flutter Must Never Contain

The following must not appear anywhere in Flutter code — not in models, services, utilities, providers, BLoC logic, or comments:

| Forbidden Item | Why Forbidden |
|---|---|
| Score threshold constants (e.g. `const b1Threshold = 70`) | Backend config — not a client concern |
| Section weight constants (e.g. `const grammarWeight = 0.30`) | Backend config — not a client concern |
| Signal threshold constants (e.g. `const emergingThreshold = 0.40`) | Backend config — not a client concern |
| Level-mapping functions (e.g. `mapScoreToLevel(score)`) | Backend-only logic |
| Skill signal computation (e.g. `computeSignal(correct, total)`) | Backend-only logic |
| Section mastery calculation (e.g. `correct / total`) | Backend-only logic |
| Weakness ranking logic | Backend-only logic |
| Initial path derivation logic | Backend-only logic |
| Local `estimatedLevel` computation before API response | Creates divergence from backend result |
| Cached placement score in local storage | Score must not persist locally |

If a reviewer finds any of these in Flutter code, the code must be rejected and rewritten to remove the forbidden logic. The backend result must be the only source of these values.

---

## 5. Why This Rule Exists

### 5.1 Correctness

The backend applies the official threshold and weighting rules defined in P4-030, P4-031, P4-032, P4-033, and P4-034. These rules are the product of deliberate design decisions. Any Flutter-side reimplementation would need to be kept in sync with backend changes — which creates a synchronisation risk.

If Flutter computes a level independently, it may show a different result than the backend stored in `placement_results`. This creates a data inconsistency that is difficult to debug and can mislead learners.

### 5.2 Security

The placement result determines the learner's starting level and initial learning path. A client that computes its own level could be modified to inject a falsified level, bypass the backend result, or expose internal scoring logic to reverse engineering.

Keeping all scoring on the backend prevents result manipulation and protects the integrity of the placement system.

### 5.3 Evolvability

Scoring rules (thresholds, weights, signal definitions) will evolve over Phase 4 iterations and into future phases. Backend-only scoring means rule updates require only a backend deployment — no Flutter release is needed. If Flutter contained scoring logic, every scoring rule change would require a coordinated Flutter release.

### 5.4 AIM Engine Boundary

Phase 4 explicitly prohibits AIM Engine runtime integration (see `docs/phase-4/no-aim-runtime-rule.md`). Allowing Flutter to score placement locally would effectively reproduce a subset of AIM Engine behaviour inside the client — which violates the AIM Engine boundary even without a direct integration.

---

## 6. Enforcement

### 6.1 Code Review

Every Flutter PR that touches placement code must be reviewed against this rule. Reviewers must reject any PR that contains scoring logic, threshold constants, or level-mapping functions.

### 6.2 Agent Execution

Any agent executing a Phase 4 Flutter task must:

- Read this document before writing Flutter code.
- Refuse to add scoring logic, threshold constants, or level-mapping functions to Flutter code.
- Mark the task Blocked if the task description would require Flutter to score placement locally.

### 6.3 Flutter No-Scoring Regression Check (P4-070)

Task P4-070 adds a static analysis check and test assertion that verifies no forbidden scoring logic exists in the Flutter placement feature directory. This check must pass before the Flutter placement feature is considered complete.

---

## 7. Affected Placement Outputs

This rule applies to every output produced by the placement scoring pipeline:

| Output | Backend-Authoritative | Flutter Role |
|---|---|---|
| Placement score (0–100) | ✅ Backend only | Never received or computed |
| Estimated CEFR level (A1/A2/B1) | ✅ Backend only | Display as returned by API |
| Section mastery scores | ✅ Backend only | Never received |
| Skill mastery signal (strong/developing/emerging) | ✅ Backend only | Display as returned by API |
| Weakness map | ✅ Backend only | Display as returned by API |
| Initial learning path | ✅ Backend only | Display as returned by API |
| Score confidence indicator | ✅ Backend only | Never received |
| Section weights | ✅ Backend config | Never sent to Flutter |
| Signal thresholds | ✅ Backend config | Never sent to Flutter |
| Level thresholds | ✅ Backend config | Never sent to Flutter |

---

## 8. Relationship to Other Rules

| Document | Relationship |
|---|---|
| `docs/phase-4/placement-level-thresholds.md` (P4-030) | Defines CEFR level thresholds — backend config, not client config |
| `docs/phase-4/placement-section-weighting.md` (P4-031) | Defines section weights — backend config, not client config |
| `docs/phase-4/placement-skill-scoring-rules.md` (P4-032) | Defines skill signal computation — backend-only |
| `docs/phase-4/placement-weakness-rules.md` (P4-033) | Defines weakness map derivation — backend-only |
| `docs/phase-4/initial-learning-path-rules.md` (P4-034) | Defines initial path derivation — backend-only |
| `docs/phase-4/no-aim-runtime-rule.md` | Prohibits AIM Engine runtime — this rule extends that boundary to client scoring |
| `docs/phase-4/placement-scope-boundaries.md` (P4-003) | Full allowed and forbidden work list |
| P4-070 — Add Flutter No-Scoring Regression Check | Static check that enforces this rule in Flutter code |

---

## 9. Out of Scope

The following are not addressed by this rule (they are handled by other Phase 4 scope documents):

- Answer submission logic (allowed in Flutter — see §3)
- Question display logic (allowed in Flutter — see §3)
- Admin dashboard scoring display (admin API may expose more fields — see P4-030 §5)
- Future Phase 5+ lesson scoring (separate system, separate rules)

---

## 10. Metadata

| Field | Value |
|---|---|
| Task ID | P4-035 |
| Branch | phase4/P4-035-placement-no-client-scoring-rule |
| Priority | P0 |
| Dependency | P4-030, P4-031, P4-032, P4-033, P4-034 |
| Output | docs/phase-4/no-client-side-placement-scoring.md |
