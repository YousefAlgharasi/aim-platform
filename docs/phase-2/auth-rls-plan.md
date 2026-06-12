# Phase 2 — Auth RLS Plan

## Purpose

This document defines the Row Level Security (RLS) strategy and explicit policy plan for all Phase 2 auth-related tables.

The goal is to prevent unauthorized direct access to auth data through any database channel other than the NestJS backend service.

---

## Dependencies

| Migration | Table |
|---|---|
| P2-013 | `users` |
| P2-014 | `student_profiles` |
| P2-015 | `admin_profiles` |
| P2-016 | `roles`, `permissions`, `role_permissions` |
| P2-017 | `user_roles` |
| P2-018 | `auth_audit_logs` |

---

## Architecture Context

The AIM Platform backend is a NestJS service that connects to the Supabase PostgreSQL database using a direct database connection string (pg client). This connection uses the database owner role and **bypasses RLS by default**.

Flutter Mobile communicates exclusively through the NestJS backend API. Flutter does not connect to Supabase PostgREST or use the Supabase JS/Dart client directly for data access.

RLS therefore serves as a **defense-in-depth layer** against:
- Direct PostgREST access using a Supabase anon or authenticated key
- Accidental exposure of the Supabase connection
- Supabase Dashboard direct queries using anon role
- Any future client that attempts to bypass the backend

The NestJS backend remains the final authority for authorization, ownership, and role/permission checks. RLS is not a replacement for backend guards.

---

## RLS Strategy

**Default stance: deny all direct client access.**

When RLS is enabled on a table and no permissive policies exist, PostgreSQL denies all access for roles other than the table owner. This is the baseline.

Explicit policies are added only where Supabase Auth JWT-based access is safe and intentional.

The Supabase **service role** bypasses RLS automatically and is used by the NestJS backend connection.

The Supabase **anon role** and **authenticated role** access is governed by explicit policies defined below.

---

## Policy Decisions Per Table

### users

| Operation | Policy | Reason |
|---|---|---|
| SELECT | Allow authenticated user to read own row | `/auth/me` requires safe user read path |
| INSERT | Deny | Backend service role only |
| UPDATE | Deny | Backend service role only |
| DELETE | Deny | Backend soft-deletes via `status` field |

Own row condition: `supabase_auth_uid = auth.uid()`

---

### student_profiles

| Operation | Policy | Reason |
|---|---|---|
| SELECT | Allow authenticated user to read own profile | Own profile access only |
| INSERT | Deny | Backend service role only |
| UPDATE | Deny | Backend service role only |
| DELETE | Deny | Backend service role only |

Own row condition: join `users` on `users.id = student_profiles.user_id WHERE users.supabase_auth_uid = auth.uid()`

---

### admin_profiles

| Operation | Policy | Reason |
|---|---|---|
| SELECT | Deny all | Admin profile access through backend only |
| INSERT | Deny | Backend service role only |
| UPDATE | Deny | Backend service role only |
| DELETE | Deny | Backend service role only |

Admin profile data must not be accessible through direct PostgREST access under any circumstance.

---

### roles

| Operation | Policy | Reason |
|---|---|---|
| SELECT | Allow authenticated users | Role definitions are non-sensitive for authenticated users |
| INSERT | Deny | Backend service role only |
| UPDATE | Deny | Backend service role only |
| DELETE | Deny | Backend service role only |

---

### permissions

| Operation | Policy | Reason |
|---|---|---|
| SELECT | Allow authenticated users | Permission definitions are non-sensitive for authenticated users |
| INSERT | Deny | Backend service role only |
| UPDATE | Deny | Backend service role only |
| DELETE | Deny | Backend service role only |

---

### role_permissions

| Operation | Policy | Reason |
|---|---|---|
| SELECT | Allow authenticated users | Role-permission mapping is non-sensitive for authenticated users |
| INSERT | Deny | Backend service role only |
| UPDATE | Deny | Backend service role only |
| DELETE | Deny | Backend service role only |

---

### user_roles

| Operation | Policy | Reason |
|---|---|---|
| SELECT | Allow authenticated user to read own assignments | Users may read their own role assignments |
| INSERT | Deny | Backend service role only |
| UPDATE | Deny | Backend service role only |
| DELETE | Deny | Backend service role only |

Own row condition: join `users` on `users.id = user_roles.user_id WHERE users.supabase_auth_uid = auth.uid()`

---

### auth_audit_logs

| Operation | Policy | Reason |
|---|---|---|
| SELECT | Deny all | Audit log is internal only; never directly accessible |
| INSERT | Deny | Backend service role only; append-only |
| UPDATE | Deny | Append-only enforced at RLS level |
| DELETE | Deny | Append-only enforced at RLS level |

---

## Policy Implementation

RLS policies are implemented in migration:

```text
services/backend-api/prisma/migrations/20260612140000_apply_auth_rls_policies/migration.sql
```

---

## Conflict Rules

If a later task proposes:

- granting direct SELECT on `admin_profiles` to any Supabase role other than service role;
- granting INSERT/UPDATE/DELETE on any Phase 2 table to the anon or authenticated role;
- granting direct SELECT on `auth_audit_logs` to any non-service role;
- removing RLS from any Phase 2 table;

it must stop and document a conflict against this plan before proceeding.

---

## Out of Scope

RLS policies for the following are not covered here and belong to Phase 3+:

- placement test results
- lesson or session data
- AIM Engine state
- practice or review records
- progress or retention data

---

## Done Criteria

This plan satisfies P2-020 when:

- strategy decision is documented (backend-first, RLS as defense-in-depth);
- per-table policy decisions are explicit for all 8 Phase 2 tables;
- policy conditions use `auth.uid()` correctly;
- the RLS migration file exists and implements all policies;
- `auth_audit_logs` has full deny across all operations;
- `admin_profiles` has full deny across all operations;
- no secrets or privileged credentials are present.
