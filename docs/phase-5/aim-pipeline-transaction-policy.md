# AIM Pipeline Transaction Policy

**Task:** P5-065  
**Status:** Implemented  
**Applies to:** `AimPersistenceService` (Stage 6 of the AIM pipeline)

---

## Purpose

This document defines the consistency rules for persisting validated AIM Engine
response categories to the Phase 5 database tables.

Before P5-065, all six category writes were not wired (the `AimPersistenceService`
only wired `WeaknessUpdateService` and left the other five as no-ops). A partial
write leaving stale state across tables was therefore the only possible outcome
on any failure.

---

## Transaction boundary

**All six category writes execute within a single PostgreSQL transaction.**

```
BEGIN
  ├── StudentSkillStateUpdateService.upsertMany()     (P5-057)
  ├── WeaknessUpdateService.upsertMany()              (P5-058)
  ├── DifficultyDecisionService.persist()             (P5-059)
  ├── RecommendationOutputService.replaceActiveSet()  (P5-060)
  ├── ReviewScheduleOutputService.upsertMany()        (P5-061)
  └── SessionSummaryService.persist()                 (P5-063 / P5-062)
COMMIT  — or ROLLBACK on any error
```

A single `PoolClient` is checked out from the connection pool for the duration of
the persist call. All six category services receive a `TransactionScopedDb` adapter
that wraps this client, ensuring every SQL statement runs on the same physical
connection and is therefore covered by the same transaction.

---

## Failure semantics

| Failure point | Outcome |
|---|---|
| Any category write throws | `ROLLBACK` — no category row is written |
| `COMMIT` succeeds | All six category writes are durable |
| Client checkout fails | `persist()` throws; orchestrator records `persistence_failed` |

The orchestrator (P5-056) catches the re-thrown error from `persist()` and
records a `persistence_failed` audit entry, then returns `ok: false` to the
caller.

---

## Audit writes are excluded

`AimAuditService.record()` writes are intentionally **not** included in the
transaction. Audit writes are:

- Append-only (no read-modify-write risk)
- Best-effort (a failed audit write must not roll back category data)
- Self-swallowing — `AimAuditService` catches its own errors and returns void

---

## Concurrent request safety

The pipeline orchestrator is invoked once per attempt submission. Because
individual HTTP requests are serialized per student session at the product level,
two transactions on the same `(studentId, sessionId)` pair will not race in
normal operation.

If a race does occur (e.g. two simultaneous submissions), PostgreSQL row-level
locks on the ON CONFLICT upserts in each category service provide protection:
the second transaction blocks on the locked rows and completes after the first
commits.

---

## FrustrationSignalService note

`FrustrationSignalService` (P5-062) writes to the same `session_summaries` row
as `SessionSummaryService` (P5-063). Only `SessionSummaryService` is called from
the transaction — `FrustrationSignalService` is registered in DI for potential
standalone use but deliberately excluded from the Stage 6 pipeline to avoid a
double-write on the same row. The team should formally deprecate
`FrustrationSignalService` or confirm `SessionSummaryService` fully subsumes it.

---

## Implementation files

- `services/backend-api/src/features/aim/persistence/aim-persistence.service.ts`
  (rewritten for P5-065 — full wiring + transaction)
- `services/backend-api/src/features/aim/persistence/aim-persistence.service.spec.ts`
  (new — covers transaction commit, rollback, and all six category calls)
