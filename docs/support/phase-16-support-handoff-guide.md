# Phase 16 — Support Handoff Guide

**Document ID:** P16-071
**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Created:** 2026-06-21

---

## Purpose

This guide prepares the support team for handling user issues after the AIM Platform release. It covers known issues, common problems for each user role, troubleshooting steps, and escalation paths.

---

## 1. Platform Overview for Support

The AIM Platform is an adaptive learning system for Arabic language education. It has three user roles:

| Role | Interface | Description |
|------|-----------|-------------|
| Student | Mobile app (`apps/mobile/`) | Learns Arabic through lessons, practice, assessments, AI teacher |
| Parent | Web dashboard (`apps/web/` — parent-dashboard) | Monitors child's progress, manages notifications |
| Admin | Web dashboard (`apps/web/` — admin features) | Manages users, curriculum, analytics, system settings |

### Technology Stack (Support-Relevant)

| Component | Technology | Relevance to Support |
|-----------|-----------|---------------------|
| Authentication | Supabase Auth | Login issues, password resets, session problems |
| Backend API | NestJS | API errors, data issues |
| Mobile App | Flutter | App crashes, UI issues |
| Web App | React | Browser compatibility, loading issues |
| Database | PostgreSQL (Supabase) | Data integrity issues |

---

## 2. Known Issues at Release

### 2.1 Known Limitations

| ID | Issue | Affected Users | Workaround |
|----|-------|---------------|------------|
| KI-01 | App version 0.1.0 — pre-release numbering | All | Cosmetic only; does not affect functionality |
| KI-02 | No offline mode | Students (mobile) | Requires internet connection for all features |
| KI-03 | AI Teacher response time varies | Students | Response time depends on AI provider; may take 5-15 seconds |
| KI-04 | Voice teacher requires microphone permission | Students (mobile) | Must grant microphone permission in device settings |
| KI-05 | Billing integration may not be fully functional | Students, Parents | Contact support for subscription issues |
| KI-06 | Analytics data may have short delay | Parents, Admins | Data refreshes periodically; may not be real-time |
| KI-07 | RTL rendering may have minor inconsistencies | All | Report specific screens for targeted fixes |
| KI-08 | No push notifications at launch | Students, Parents | Users must open the app/dashboard to see notifications |

### 2.2 Issues Under Investigation

| ID | Issue | Status | ETA |
|----|-------|--------|-----|
| UI-01 | Design system inconsistencies across some screens | Under review | Phase 17 |
| UI-02 | Browser-specific rendering differences | Under review | Phase 17 |

---

## 3. Common Student (Mobile App) Problems

### 3.1 Login Issues

| Problem | Troubleshooting Steps |
|---------|----------------------|
| Cannot log in | 1. Verify email/password are correct. 2. Check if account exists in admin dashboard. 3. Try "Forgot Password" flow. 4. Check if Supabase Auth service is operational. |
| Session expired | 1. Ask user to log in again. 2. If persistent, check if JWT secret changed. |
| Account locked | 1. Check Supabase Auth for account status. 2. Admin can unlock via dashboard. |

### 3.2 Learning Flow Issues

| Problem | Troubleshooting Steps |
|---------|----------------------|
| Lessons not loading | 1. Check internet connection. 2. Force close and reopen app. 3. Check backend API health. 4. Verify curriculum data exists for user's level. |
| Progress not saving | 1. Check internet connection. 2. Verify backend API is responding. 3. Check database for recent write failures. |
| Wrong level assigned | 1. Review placement test results in admin dashboard. 2. Admin can reassign level manually. |
| Placement test stuck | 1. Check AIM engine health (`services/aim-engine/`). 2. Verify backend API can reach AIM engine. 3. User may need to restart placement. |

### 3.3 AI Teacher Issues

| Problem | Troubleshooting Steps |
|---------|----------------------|
| AI not responding | 1. Check AI provider API status (external dependency). 2. Verify `AI_PROVIDER_API_KEY` is valid. 3. Check backend API logs for timeout errors. |
| Voice input not working | 1. Verify microphone permission granted. 2. Check STT provider API status. 3. Verify `STT_PROVIDER_API_KEY` is valid. |
| Inappropriate response | 1. Log the conversation for review. 2. Report to engineering for AI safety review. 3. Check `docs/security/ai-safety-privacy-rules.md` for policy. |

### 3.4 App Crashes

| Problem | Troubleshooting Steps |
|---------|----------------------|
| App crashes on launch | 1. Clear app cache. 2. Reinstall the app. 3. Check for OS compatibility (Flutter requires recent Android/iOS). |
| App crashes during lesson | 1. Collect crash details (device model, OS version, lesson ID). 2. Escalate to engineering with crash report. |

---

## 4. Common Parent (Web Dashboard) Problems

### 4.1 Account and Access Issues

| Problem | Troubleshooting Steps |
|---------|----------------------|
| Cannot access dashboard | 1. Verify parent account exists. 2. Check browser compatibility. 3. Clear browser cache. 4. Try incognito/private window. |
| Cannot see linked students | 1. Verify parent-student linkage in admin dashboard. 2. Check `features/parents/` for linking logic. 3. Admin can manually link parent to student. |

### 4.2 Data Viewing Issues

| Problem | Troubleshooting Steps |
|---------|----------------------|
| Progress data not updating | 1. Refresh the page. 2. Check if student has recent activity. 3. Verify backend API analytics endpoint is responding. |
| Analytics charts not rendering | 1. Check browser console for JavaScript errors. 2. Verify API returns data. 3. Try a different browser. |

### 4.3 Notification Issues

| Problem | Troubleshooting Steps |
|---------|----------------------|
| Not receiving notifications | 1. Check notification preferences. 2. Verify email address is correct. 3. Check spam/junk folder for email notifications. 4. Push notifications are not available at launch (KI-08). |

---

## 5. Common Admin Problems

### 5.1 User Management

| Problem | Troubleshooting Steps |
|---------|----------------------|
| Cannot find a user | 1. Search by email or name. 2. Check if user account exists in Supabase Auth. 3. Verify search is using correct filters. |
| Cannot change user role | 1. Verify admin has sufficient permissions. 2. Check `admin-role-assignment.service.ts` for role assignment logic. 3. Check if role change requires specific permission level. |
| Cannot deactivate user | 1. Check if user has active subscriptions. 2. Verify admin permissions. 3. Use `update-user-status.dto.ts` endpoint. |

### 5.2 Analytics Issues

| Problem | Troubleshooting Steps |
|---------|----------------------|
| Analytics dashboard empty | 1. Check if analytics data exists. 2. Verify backend API analytics endpoint. 3. Check browser console for errors. |
| Data discrepancies | 1. Check analytics aggregation timing. 2. Compare raw data vs aggregated data. 3. Escalate to engineering if data integrity issue suspected. |

### 5.3 Curriculum Management

| Problem | Troubleshooting Steps |
|---------|----------------------|
| Cannot update curriculum | 1. Verify admin permissions for curriculum management. 2. Check backend API curriculum endpoints. 3. Verify database constraints (foreign keys, etc.). |

---

## 6. Troubleshooting Flowchart

```
User reports issue
        |
        v
Is the platform reachable?
  |           |
  No          Yes
  |           |
  v           v
Check:        Is it a login issue?
- API health  |           |
- Supabase    No          Yes
- DNS/hosting |           |
  |           v           v
  v         Which role?   Check Supabase Auth
Escalate    |  |  |       - Account exists?
to DevOps   |  |  |       - Password correct?
            |  |  |       - Account locked?
         Student Parent Admin
            |     |     |
            v     v     v
         See    See   See
         Sec.3  Sec.4 Sec.5
```

---

## 7. Escalation Paths

### Tier 1 (Support Team)
- Login issues (password reset, account unlock)
- Basic troubleshooting (clear cache, reinstall, check connectivity)
- Known issue acknowledgment
- User education (how to use features)

### Tier 2 (Senior Support / Technical Support)
- Data discrepancies
- Complex account issues (parent-student linking)
- API error investigation
- Mobile app crash triage

### Tier 3 (Engineering)
- Backend API bugs
- Database issues
- AI teacher / Voice teacher issues
- Security incidents
- Performance degradation

### Escalation Contact

| Tier | Contact Method | Response Time |
|------|---------------|---------------|
| Tier 1 > Tier 2 | Internal ticket | < 4 hours |
| Tier 2 > Tier 3 | Engineering ticket + chat | < 2 hours |
| Security incident | Direct to engineering lead | Immediate |
| Data breach | Direct to engineering lead + legal | Immediate |

---

## 8. Support Tools

| Tool | Purpose | Access |
|------|---------|--------|
| Supabase Dashboard | User account management, auth logs | Admin credentials required |
| Admin Dashboard | User management, analytics, notifications | Admin role required |
| Backend API logs | Error investigation | Server access required |
| GitHub Issues | Bug tracking and feature requests | Repository access |

---

## 9. FAQ for Support

**Q: Can a student use the app without an internet connection?**
A: No. The AIM Platform requires an internet connection for all features. Offline mode is not available in this release.

**Q: How long does the AI teacher take to respond?**
A: Typically 5-15 seconds, depending on the complexity of the question and the AI provider's response time.

**Q: Can a parent be linked to multiple students?**
A: Yes. The parent-student linking system supports multiple children per parent.

**Q: What browsers are supported for the web dashboard?**
A: Modern versions of Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported.

**Q: How often does analytics data refresh?**
A: Analytics data may not be real-time. Refresh intervals depend on the aggregation schedule, which may range from minutes to hours.

**Q: What should I do if a student reports inappropriate AI teacher responses?**
A: Log the conversation details, report to engineering for AI safety review, and refer to `docs/security/ai-safety-privacy-rules.md` for the platform's AI safety policy.
