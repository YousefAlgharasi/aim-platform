# Phase 16 — User-Facing Known Limitations

**Document ID:** P16-073
**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Created:** 2026-06-21

---

## Purpose

This document lists known limitations of the AIM Platform that are safe to communicate to users. It does not expose security-sensitive implementation details, internal architecture, or vulnerability information.

---

## 1. Mobile App Limitations

### 1.1 Internet Connectivity
**Limitation:** The AIM mobile app requires an active internet connection for all features including lessons, practice, assessments, and the AI teacher.

**User impact:** Students in areas with poor connectivity may experience interruptions. Lessons cannot be downloaded for offline use.

**Planned improvement:** Offline lesson access is planned for a future release.

### 1.2 AI Teacher Response Time
**Limitation:** The AI teacher may take 5-15 seconds to respond to questions, depending on the complexity of the query and current system load.

**User impact:** Students may need to wait briefly for AI responses. This is expected behavior, not an error.

**Planned improvement:** Response time optimization is ongoing.

### 1.3 Voice Input
**Limitation:** The voice input feature for the AI teacher requires microphone permission to be granted in the device settings. Voice recognition accuracy may vary based on background noise and pronunciation clarity.

**User impact:** Students must enable microphone access. Voice recognition works best in quiet environments.

**Workaround:** Students can use text input as an alternative to voice input.

### 1.4 Push Notifications
**Limitation:** Mobile push notifications are not available in this release. Notifications are only visible when the app is opened.

**User impact:** Students will not receive real-time alerts about new lessons, assessment results, or reminders unless they open the app.

**Planned improvement:** Push notification support is planned for a future release.

### 1.5 Device Compatibility
**Limitation:** The app requires Android 5.0 or later, or iOS 12.0 or later. Older devices are not supported.

**User impact:** Students with very old devices may not be able to install or run the app.

---

## 2. Web Dashboard Limitations (Parent and Admin)

### 2.1 Browser Support
**Limitation:** The web dashboard supports modern browsers: Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+. Internet Explorer is not supported.

**User impact:** Users with older browsers may experience display issues or be unable to access the dashboard.

**Workaround:** Update to a supported browser version.

### 2.2 Analytics Data Freshness
**Limitation:** Analytics data (charts, progress summaries, performance metrics) may not reflect the very latest student activity. Data is refreshed periodically.

**User impact:** Parents and admins may see a short delay (minutes to hours) before the latest student activity appears in analytics views.

**Planned improvement:** Near-real-time analytics updates are planned for a future release.

### 2.3 Email Notifications
**Limitation:** Email notifications for parents are not available in this release. Notifications are only visible within the web dashboard.

**User impact:** Parents must log in to the dashboard to view notifications about their child's progress.

**Planned improvement:** Email notification delivery is planned for a future release.

---

## 3. Learning and Assessment Limitations

### 3.1 Placement Test
**Limitation:** The placement test must be completed in a single session. If the app is closed during the placement test, the student may need to restart the test.

**User impact:** Students should ensure they have stable internet and sufficient time (approximately 15-30 minutes) before starting the placement test.

### 3.2 Learning Path Adjustments
**Limitation:** The learning path is generated based on placement test results and ongoing assessment performance. Manual adjustments to a student's level require administrator intervention.

**User impact:** If a student believes their assigned level is incorrect, they should contact their parent or administrator for adjustment.

### 3.3 Assessment Retakes
**Limitation:** Assessment retake policies are determined by the curriculum configuration. Not all assessments may be retakable immediately.

**User impact:** Students may need to wait or complete additional lessons before retaking certain assessments.

---

## 4. Account and Subscription Limitations

### 4.1 Account Recovery
**Limitation:** Account recovery requires a valid email address associated with the account. If the email is no longer accessible, the user must contact support.

**User impact:** Users should ensure their account email is current and accessible.

### 4.2 Parent-Student Linking
**Limitation:** Parent-student linking is managed by administrators. Parents cannot self-link to student accounts.

**User impact:** Parents who need to link to a student account must request the linkage through an administrator.

### 4.3 Subscription Management
**Limitation:** Full subscription management features are being finalized. Some billing operations may require support assistance.

**User impact:** Users experiencing billing issues should contact support directly.

---

## 5. Accessibility and Language Limitations

### 5.1 Arabic/RTL Support
**Limitation:** While the platform supports Arabic and right-to-left (RTL) layout, some screens may have minor rendering inconsistencies in RTL mode.

**User impact:** Most screens display correctly in Arabic. If a specific screen appears incorrectly, please report it for correction.

### 5.2 Language Options
**Limitation:** The platform currently supports Arabic and English. Additional languages are not available.

**User impact:** Users who speak other languages must use either Arabic or English.

---

## 6. Data and Privacy

### 6.1 Data Export
**Limitation:** Self-service data export is not available in this release. Users who need a copy of their data should contact support.

**Planned improvement:** Data export functionality is planned for a future release.

### 6.2 Account Deletion
**Limitation:** Self-service account deletion is not available in this release. Users who wish to delete their account should contact support.

**Planned improvement:** Self-service account deletion is planned for a future release.

---

## 7. Reporting Limitations

If you encounter a problem not listed here, please report it through:
1. The in-app feedback mechanism (if available)
2. Contacting support via the provided support channels
3. Through your parent or administrator

When reporting an issue, please include:
- A description of what happened
- What you expected to happen
- The device and browser/app version you are using
- Screenshots if possible
