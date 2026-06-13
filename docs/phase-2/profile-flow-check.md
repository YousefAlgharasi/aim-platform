# Profile Flow Check

## Phase 2 — P2-057

**Scope:** Auth, Users, Roles only.
**Goal:** Verify profile access works through backend ownership checks — no unauthorized profile access, no forbidden fields, no client-side authorization decisions.

---

## Coverage

This document reviews the Flutter profile flow implemented across P2-051 through P2-056.

| Task | Component | Verdict |
|---|---|---|
| P2-051 | Flutter profile models and entities | ✓ Pass |
| P2-052 | Flutter profile remote datasource | ✓ Pass |
| P2-053 | Flutter profile repository and provider | ✓ Pass |
| P2-054 | Flutter profile screen | ✓ Pass |
| P2-055 | Flutter basic edit profile flow | ✓ Pass (with note) |
| P2-056 | Flutter role-aware UI placeholder | ✓ Pass |

---

## Check 1 — Flutter Profile Models and Entities (P2-051)

**Files reviewed:**
- `apps/mobile/lib/features/profile/data/models/profile_me_response_model.dart`
- `apps/mobile/lib/features/profile/data/models/student_profile_model.dart`
- `apps/mobile/lib/features/profile/data/models/admin_profile_model.dart`
- `apps/mobile/lib/features/profile/data/models/user_profile_model.dart`
- `apps/mobile/lib/features/profile/data/models/profile_update_payload_models.dart`
- `apps/mobile/lib/features/profile/logic/entity/` (student_profile, admin_profile, user_profile, profile_update_payloads)

**Security checks:**

| Check | Result |
|---|---|
| `supabase_auth_uid` absent from all model/entity types | ✓ |
| `userId` (internal) absent from `StudentProfileResponseModel` and `AdminProfileResponseModel` (per P2-011) | ✓ |
| JWT tokens, secrets, or credentials absent from all types | ✓ |
| Role enforcement fields absent — roles are read-only from `authContextProvider`, not profile | ✓ |
| `SafeStudentProfileUpdatePayloadModel` contains only: displayName, avatarUrl, preferredLanguage, timezone | ✓ |
| `SafeAdminProfileUpdatePayloadModel` contains only: displayName, avatarUrl, department | ✓ |
| Update payloads do not expose roleKey, userType, email, status (immutable fields) | ✓ |

---

## Check 2 — Flutter Profile Remote Datasource (P2-052)

**Files reviewed:**
- `apps/mobile/lib/features/profile/data/datasources/profile_remote_datasource.dart`
- `apps/mobile/lib/features/profile/data/datasources/profile_remote_datasource_impl.dart`

**Behaviour:**

`ProfileRemoteDatasourceImpl` calls:
- `GET /profile/me` — reads the authenticated user's own profile using the bearer token.
- `PATCH /profile/me` — updates safe profile fields using the bearer token.

Backend endpoint (`ProfileController`) uses `SupabaseJwtAuthGuard` + `@CurrentUser()` to resolve the user identity from the JWT. The client never supplies a user ID — ownership is enforced server-side.

**Security checks:**

| Check | Result |
|---|---|
| Datasource calls `BackendApiClient` exclusively — no direct HTTP bypassing the client | ✓ |
| Bearer token injected per-call in `Authorization` header — not stored in datasource | ✓ |
| No user ID supplied in request body or URL — backend resolves from JWT | ✓ |
| No secrets, service-role keys, or database credentials present | ✓ |
| Response decoded to `ProfileMeResponseModel` — fields validated via `fromJson` | ✓ |

---

## Check 3 — Flutter Profile Repository and Provider (P2-053)

**Files reviewed:**
- `apps/mobile/lib/features/profile/logic/repository/profile_repository.dart`
- `apps/mobile/lib/features/profile/data/repository/repo_impl/profile_repository_impl.dart`
- `apps/mobile/lib/features/profile/logic/provider/profile_notifier.dart`
- `apps/mobile/lib/features/profile/logic/provider/profile_provider.dart`

**Behaviour:**

`ProfileNotifier` (extends `AppStateNotifier`) manages `AppAsyncState<ProfileMeResponseModel>`.
- `loadProfile(bearerToken)` — delegates to `ProfileRepository.getProfile`, transitions state.
- `updateProfile(bearerToken, {studentPayload?, adminPayload?})` — delegates to `ProfileRepository.updateProfile`, returns bool.
- `clearProfile()` — resets state on logout.

**Security checks:**

| Check | Result |
|---|---|
| Bearer token passed per-call — not stored in notifier | ✓ |
| Repository is an abstraction layer — implementation detail hidden from UI | ✓ |
| No authorization decisions in notifier — all enforcement is backend-side | ✓ |
| Failure state set on error — no raw exception leakage to UI | ✓ |
| `clearProfile()` called on logout — no stale profile data persisted | ✓ |

---

## Check 4 — Flutter Profile Screen (P2-054)

**Files reviewed:**
- `apps/mobile/lib/features/profile/ui/pages/profile_page.dart`

**Behaviour:**

`ProfilePage` is a `ConsumerWidget` that reads from `authContextProvider` (not `profileProvider` directly). Renders the user's identity, email, roles (as UX-only chips), and profile data. Edit icon navigates to `EditProfilePage`. Logout button triggers `LogoutNotifier`.

**Security checks:**

| Check | Result |
|---|---|
| Role badges are explicitly labelled as UX-only — backend is final authority | ✓ |
| `supabase_auth_uid` not rendered | ✓ |
| Internal permission keys not rendered | ✓ |
| Profile data sourced from `authContextProvider` (backend-loaded) — never from local storage | ✓ |
| Edit access gated on `AppAsyncSuccess` (i.e. authenticated backend state) — no edit if unauthenticated | ✓ |
| Logout confirmed via `LogoutNotifier` which calls backend before clearing state | ✓ |

---

## Check 5 — Flutter Basic Edit Profile Flow (P2-055)

**Files reviewed:**
- `apps/mobile/lib/features/profile/ui/pages/edit_profile_page.dart`

**Behaviour:**

`EditProfilePage` is a `ConsumerStatefulWidget`. Pre-populates fields from `authContextProvider` on `initState`. Editable fields: `displayName`, `preferredLanguage`, `timezone` (student profile only). Non-editable: email, role, userType, status, permissions. Submits via `profileProvider.notifier.updateProfile(bearerToken, studentPayload: payload)`. Bearer token is a placeholder (`''`) pending `supabase_flutter` SDK integration.

**Security checks:**

| Check | Result |
|---|---|
| Only safe backend-approved fields are editable | ✓ |
| Email, roles, userType, status are read-only (displayed, not editable) | ✓ |
| No role or permission changes possible through this form | ✓ |
| `SafeStudentProfileUpdatePayloadModel` used — no forbidden fields in payload | ✓ |
| Backend (`PATCH /profile/me`) enforces ownership via JWT — client cannot change another user's profile | ✓ |
| Error shown as inline banner — no stack trace exposed | ✓ |
| Save button disabled when form is clean or submitting | ✓ |

**Note — bearer token placeholder:**

The bearer token is currently `''` (empty string placeholder). This must be
replaced with the Supabase Auth session access token once `supabase_flutter`
is integrated. Until then, `PATCH /profile/me` calls will fail with 401.
This is a known integration limitation, documented in the P2-055 completion note.

---

## Check 6 — Flutter Role-Aware UI Placeholder (P2-056)

**Files reviewed:**
- `apps/mobile/lib/features/auth/data/models/client_safe_role_model.dart`
- `apps/mobile/lib/features/shell/ui/widgets/role_aware_placeholder_section.dart`

**Behaviour:**

`ClientSafeRoleModel` maps backend role fields (id, key, name, description, isSystem).
`RoleAwarePlaceholderSection` reads `authContext.roles` (backend-provided) and renders
placeholder tiles for: student tools, reviewer/support queue shortcut, admin console shortcut.
Each tile is only shown when `authContext.hasRole(requiredRole)` returns true.

**Security checks:**

| Check | Result |
|---|---|
| Role visibility decisions are UX only — no backend authorization bypassed | ✓ |
| Widget explicitly states "Backend authorization remains final" in UI text | ✓ |
| Roles sourced from `AuthContextModel` (loaded from backend `/auth/me`) — never from local storage | ✓ |
| `ClientSafeRoleModel` does not expose permission codes, RLS policies, or JWT claims | ✓ |
| Placeholder tiles have no action handlers in Phase 2 — UI-only labels | ✓ |

---

## Ownership Check Verification

The backend enforces profile ownership through `ProfileController`:

```
GET  /profile/me  →  SupabaseJwtAuthGuard → @CurrentUser() → ProfileService.getProfileForUser(user.id)
PATCH /profile/me →  SupabaseJwtAuthGuard → @CurrentUser() → ProfileService.updateProfileForUser(user.id, input)
```

`user.id` is always the **internal AIM user ID** resolved from the verified Supabase JWT.
The Flutter client **never supplies a user ID** — it cannot access another user's profile
by crafting a request. No user ID is present in the request body or URL for these endpoints.

---

## Summary of Findings

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | Bearer token placeholder (`''`) in `EditProfilePage` — `PATCH /profile/me` will return 401 until `supabase_flutter` is integrated | Medium | Open — known limitation, documented in P2-055 |
| 2 | `profileProvider` and `authContextProvider` are separate — profile screen reads from `authContextProvider`, edit page submits via `profileProvider`; they must be kept in sync post-update | Low | Architectural note — no security issue |

Finding 1 is a known integration gap pending `supabase_flutter` SDK integration.
It is not a security issue — the backend correctly rejects empty bearer tokens with 401.

---

## Non-Goals

This check does not cover:
- AIM Engine integration (out of scope for Phase 2)
- AI Teacher integration (out of scope for Phase 2)
- Onboarding, placement, lessons, or sessions (out of scope for Phase 2)
- Student Web App (out of scope for Phase 2)
- Admin profile edit flow (no `PATCH /admin-profile/me` exists in Phase 2)
- Full end-to-end runtime testing (requires live Supabase + backend + `supabase_flutter` SDK)
