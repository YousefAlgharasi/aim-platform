# AIM Platform — Project Brain Index

> **Project Brain last verified: 2026-07-04** (latest date across all 14 documents below — this is the date to check against before trusting any document as current; each document also carries its own "Last verified" line).

This is the fixed reference set for anyone (human engineer, new agent
session, or the persistent CTO system prompt) getting oriented on
`aim-platform` — read this before re-deriving the architecture from
scratch or trusting a stale phase doc. Every fact in these documents was
independently verified against the live code, the live Supabase project
(`yrarpdkvdxszgxxondkt`), or a real test-suite run — not copied from a doc
without checking. Where something couldn't be verified, it's marked
**Unknown** rather than guessed.

Source of truth for a starting seed: `docs/architect-onboarding/project-memory.json`
(kept in sync with this Project Brain — decisions and known-issues added
here were added there too).

| Doc | What it covers |
|---|---|
| [`00-project-vision.md`](./00-project-vision.md) | What AIM Platform actually is/does today, and its evidenced target audience (Arabic-speaking English learners). |
| [`01-business-rules.md`](./01-business-rules.md) | Rules actually enforced in code: CEFR course-gating, AI Teacher Authority Matrix, rate limits, safety filtering, publish-gating. |
| [`02-system-architecture.md`](./02-system-architecture.md) | Real call paths between backend-api, aim-engine, Supabase, and all four frontends; the AI Teacher/Voice Teacher Phase 21 unification. |
| [`03-tech-stack.md`](./03-tech-stack.md) | Stack + pinned versions per app/service, including the exact Flutter 3.44.1/Dart 3.12.1 verified this session, and known version mismatches. |
| [`04-database.md`](./04-database.md) | All 132 live Supabase tables by domain, current RLS status (all now enabled), migration ledger status. |
| [`05-api-contracts.md`](./05-api-contracts.md) | The full backend REST surface controller-by-controller, the backend↔aim-engine contract, and confirmed endpoint-prefix inconsistencies. |
| [`06-folder-structure.md`](./06-folder-structure.md) | Annotated top-level tree — what's live, orphaned, legacy, or reference-only (with the `services/api` correction). |
| [`07-coding-standards.md`](./07-coding-standards.md) | Observed conventions per language/app — not a prescriptive style guide. |
| [`08-roadmap.md`](./08-roadmap.md) | Completed phases (20, 21) and the honest "no Phase 22 defined yet" status. |
| [`09-decisions.md`](./09-decisions.md) | Every decision from `project-memory.json.decisions_log`, kept in sync. |
| [`10-known-problems.md`](./10-known-problems.md) | Every known issue, old and newly found this session, with verification method and current status. |
| [`11-future-features.md`](./11-future-features.md) | Only explicitly stated future intent — not a brainstormed wishlist. |
| [`12-dependency-map.md`](./12-dependency-map.md) | Real module/service/package dependency edges, hard vs. soft. |
| [`13-risk-register.md`](./13-risk-register.md) | Concrete, evidenced risks with how each was found and current severity. |

## How to keep this living

Each document states its own "last verified" date at the top. When you
re-check a fact and it's changed, update both the relevant Project Brain
document **and** `project-memory.json` (whichever holds that fact) so the
two never diverge. Do not let a document's confident tone outlive its
verification date without a re-check.
