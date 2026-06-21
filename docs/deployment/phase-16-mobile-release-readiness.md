# Phase 16 — Mobile Release Readiness

**Document ID:** P16-063
**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Created:** 2026-06-21

---

## Purpose

This document assesses the readiness of the AIM Platform mobile app (`apps/mobile/`) for release to the Google Play Store (Android) and Apple App Store (iOS).

---

## 1. App Overview

- **App name:** aim_mobile
- **Version:** 0.1.0+1 (as defined in `apps/mobile/pubspec.yaml`)
- **Framework:** Flutter (SDK >=3.3.0 <4.0.0)
- **State management:** flutter_riverpod ^2.5.1
- **Auth:** Supabase via `@supabase/supabase-js` (web) / `flutter_secure_storage` ^9.0.0 (mobile)
- **Network:** http ^1.2.2

---

## 2. Feature Inventory

The mobile app includes the following feature modules (from `apps/mobile/lib/features/`):

| Feature | Directory | Status |
|---------|-----------|--------|
| Authentication | `auth/` | Implemented |
| Onboarding | `onboarding/` | Implemented |
| Home | `home/` | Implemented |
| Learning Path | `learning_path/` | Implemented |
| Lessons | `lessons/` | Implemented |
| Practice | `practice/` | Implemented |
| Assessments | `assessments/` | Implemented |
| Placement | `placement/` | Implemented |
| Question & Answer | `question_answer/` | Implemented |
| AI Teacher | `ai_teacher/` | Implemented |
| Voice Teacher | `voice_teacher/` | Implemented |
| AIM Results | `aim_results/` | Implemented |
| Progress | `progress/` | Implemented |
| Analytics Summary | `analytics_summary/` | Implemented |
| Achievements | `achievements/` | Implemented |
| Notifications | `notifications/` | Implemented |
| Billing | `billing/` | Implemented |
| Profile | `profile/` | Implemented |
| Reviews | `reviews/` | Implemented |
| Design System Preview | `design_system_preview/` | Implemented |
| Shell | `shell/` | Implemented |

---

## 3. Build Configuration

### 3.1 Android Build

**Build command:**
```bash
cd apps/mobile
flutter build apk --release
# or for app bundle
flutter build appbundle --release
```

**Build-time configuration (via --dart-define):**
- `AIM_ENV` — Environment (local/staging/production)
- `BACKEND_API_BASE_URL` — Backend API endpoint
- `SUPABASE_URL` — Supabase project URL (public, client-safe)
- `SUPABASE_ANON_KEY` — Supabase anonymous key (public, client-safe)

**Signing:** Android release builds require a keystore file. The keystore must be configured in `apps/mobile/android/key.properties` (not committed to repository).

**Current gap:** No `key.properties` template or signing configuration is documented in the repository. The CI workflow (`.github/workflows/mobile.yml`) should be verified for signing steps.

### 3.2 iOS Build

**Build command:**
```bash
cd apps/mobile
flutter build ios --release
```

**Signing:** iOS builds require an Apple Developer account, provisioning profile, and signing certificate. These are managed via Xcode or Fastlane.

**Current gap:** No Fastlane configuration or iOS signing documentation exists in the repository.

---

## 4. Store Metadata Readiness

### 4.1 Google Play Store

| Item | Status | Notes |
|------|--------|-------|
| App title (Arabic/English) | Not verified | Needs bilingual listing |
| Short description | Not verified | Max 80 characters |
| Full description | Not verified | Max 4000 characters |
| Feature graphic (1024x500) | Not verified | Required for store listing |
| Screenshots (phone) | Not verified | Min 2, recommended 8 |
| Screenshots (tablet) | Not verified | Recommended for tablet support |
| App icon (512x512) | Not verified | Must match in-app icon |
| Privacy policy URL | Not verified | Required for apps collecting data |
| Content rating questionnaire | Not verified | Required before publishing |
| Target audience | Not verified | Educational app for students |
| App category | Not verified | Education |

### 4.2 Apple App Store

| Item | Status | Notes |
|------|--------|-------|
| App name | Not verified | Max 30 characters |
| Subtitle | Not verified | Max 30 characters |
| Description | Not verified | Required |
| Keywords | Not verified | Max 100 characters total |
| Screenshots (6.7", 6.5", 5.5") | Not verified | Required per device size |
| App icon (1024x1024) | Not verified | No alpha channel |
| Privacy policy URL | Required | Must be publicly accessible |
| App Review notes | Not verified | Explain test account access |
| Age rating | Not verified | Must complete questionnaire |
| Category | Not verified | Education |

---

## 5. Permissions Audit

Based on the dependencies in `pubspec.yaml` and typical Flutter app requirements:

| Permission | Platform | Justification | Status |
|------------|----------|---------------|--------|
| Internet | Both | API communication, auth | Required, standard |
| Secure storage | Both | `flutter_secure_storage` for auth tokens | Required |
| Microphone | Both | Voice teacher feature (`voice_teacher/`) | Needs declaration |
| Camera | Both | Potentially for profile photos | Verify if needed |
| Push notifications | Both | Notifications feature | Needs declaration |
| Storage | Android | Offline content caching | Verify if needed |

**Current gap:** No `AndroidManifest.xml` or `Info.plist` audit has been performed to verify declared permissions match actual usage.

---

## 6. Privacy Labels

### 6.1 Apple Privacy Labels (App Privacy)

Based on the app's features, the following data collection must be disclosed:

| Data Type | Collection Purpose | Linked to Identity |
|-----------|-------------------|-------------------|
| Email address | Authentication | Yes |
| Name | User profile | Yes |
| User ID | App functionality | Yes |
| Usage data | Analytics | Yes |
| Diagnostics | App performance | No |
| Audio data | Voice teacher feature | Yes |
| Payment info | Billing/subscriptions | Yes |

### 6.2 Google Play Data Safety

Similar disclosures are required for the Google Play Data Safety section. The same data types apply.

**Current gap:** Privacy labels have not been prepared for either store. This is a release blocker.

---

## 7. RTL/Arabic Support Verification

The app supports Arabic and RTL layouts via `flutter_localizations` SDK dependency.

**Verification needed:**
- [ ] All screens render correctly in RTL mode
- [ ] Arabic text displays properly in all components
- [ ] Navigation gestures work correctly in RTL
- [ ] Date/time formatting uses appropriate locale
- [ ] Number formatting (Arabic-Indic vs Western) is consistent

---

## 8. Release Artifacts Checklist

| Artifact | Format | Status |
|----------|--------|--------|
| Android APK (debug) | `.apk` | Can be built |
| Android App Bundle (release) | `.aab` | Needs signing config |
| iOS IPA (release) | `.ipa` | Needs signing config |
| Android keystore | `.jks` | Not documented |
| iOS provisioning profile | `.mobileprovision` | Not documented |
| Source map / debug symbols | `.dSYM` / mapping | Needed for crash reporting |
| Release notes | Text | See `docs/phase-16/release-notes.md` |

---

## 9. CI/CD Pipeline

**Workflow:** `.github/workflows/mobile.yml`

**Current pipeline capabilities** (to be verified):
- [ ] Flutter analyze (lint)
- [ ] Flutter test (unit tests)
- [ ] Flutter build (debug APK)
- [ ] Release build with signing
- [ ] Store upload automation

---

## 10. Pre-Release Checklist

- [ ] All features listed in Section 2 are functional
- [ ] Build succeeds for both Android and iOS release modes
- [ ] Signing configuration is in place and tested
- [ ] Store metadata is prepared (both stores)
- [ ] Privacy policy URL is live and accurate
- [ ] Privacy labels / Data Safety section is complete
- [ ] Permissions are declared and justified
- [ ] RTL/Arabic support is verified
- [ ] App connects to the production backend API
- [ ] Supabase credentials point to the production project
- [ ] Crash reporting is configured
- [ ] Analytics tracking respects user consent
- [ ] Version number is updated from 0.1.0+1

---

## 11. Release Blockers

1. **Version 0.1.0+1** — The version number suggests this is a pre-release. It must be updated for store submission.
2. **No signing configuration** — Android keystore and iOS provisioning profiles are not documented.
3. **No store metadata** — Screenshots, descriptions, and privacy policy are not prepared.
4. **Privacy labels not prepared** — Required by both stores before submission.
5. **No crash reporting SDK** — `pubspec.yaml` does not include a crash reporting dependency (e.g., Firebase Crashlytics, Sentry).

---

## 12. Recommendations

1. Update the app version to 1.0.0+1 for initial release.
2. Add signing configuration templates to the repository (without actual keys).
3. Prepare bilingual (Arabic/English) store listings.
4. Integrate a crash reporting SDK before release.
5. Conduct a full RTL/Arabic QA pass.
6. Set up Fastlane for automated store deployment.
