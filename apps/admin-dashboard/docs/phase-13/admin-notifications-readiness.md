# Phase 13 — Admin Notifications Readiness Notes

**Date:** 2026-06-20
**Author:** GHOST3030
**Scope:** Document future notification management needs for Phase 13

## Purpose

Define the notification management capabilities that will be needed in
Phase 13 without implementing them in Phase 11. This document serves as
a readiness specification.

## Notification Types Identified

### 1. System Notifications

| Type | Trigger | Audience | Priority |
|------|---------|----------|----------|
| Maintenance window | Scheduled by admin | All users | High |
| Feature announcement | Published by admin | All users | Medium |
| Policy update | Published by admin | All users | High |
| Downtime alert | Automated / admin-triggered | All users | Critical |

### 2. Student Notifications

| Type | Trigger | Audience | Priority |
|------|---------|----------|----------|
| Assessment available | Backend event | Individual student | Medium |
| Placement complete | Backend event | Individual student | High |
| Course enrollment confirmed | Backend event | Individual student | Low |
| Progress milestone | Backend-computed | Individual student | Low |
| Weakness detected | AIM Engine | Individual student | Medium |

### 3. Admin Notifications

| Type | Trigger | Audience | Priority |
|------|---------|----------|----------|
| New student registration | Backend event | Admins | Low |
| Assessment completion spike | Backend analytics | Admins | Medium |
| System error threshold | Backend monitoring | Admins | High |
| Export ready | Backend job completion | Requesting admin | Medium |

## Admin Management Capabilities Needed

### Notification Composer
- Create and schedule system-wide announcements
- Target by user role, enrollment status, or CEFR level
- Set expiry date for time-sensitive notifications
- Preview before publish

### Notification Templates
- Predefined templates for common notifications
- Variable substitution (student name, course title, etc.)
- Multi-language support (English, Arabic)

### Notification History
- View sent notifications with delivery status
- Filter by type, audience, date range
- Audit trail for who sent what

### Notification Preferences (Admin View)
- View per-student notification preferences
- Override preferences for critical notifications only
- Respect user opt-out for non-critical notifications

## Delivery Channels

| Channel | Phase 13 | Notes |
|---------|----------|-------|
| In-app | Yes | Primary channel |
| Email | Yes | For critical and digest notifications |
| Push (mobile) | Future | Requires mobile app (Phase 14+) |
| SMS | Future | Requires SMS provider integration |

## Backend Requirements

1. **Notification service:** Backend must provide CRUD endpoints for notification management
2. **Delivery queue:** Async processing for bulk notifications
3. **Read receipts:** Track which users have seen/dismissed notifications
4. **Rate limiting:** Prevent notification spam
5. **Deduplication:** Avoid sending duplicate notifications

## API Endpoints Needed (Phase 13)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/admin/notifications` | GET | List notifications with filters |
| `/admin/notifications` | POST | Create new notification |
| `/admin/notifications/:id` | GET | Get notification detail |
| `/admin/notifications/:id` | PUT | Update draft notification |
| `/admin/notifications/:id/publish` | POST | Publish/send notification |
| `/admin/notifications/:id/cancel` | POST | Cancel scheduled notification |
| `/admin/notifications/templates` | GET | List notification templates |

## Safety Restrictions

### Must Do
1. All notification content must be admin-authored or template-based
2. Notification targeting must use backend-resolved audience lists
3. Delivery status must be backend-tracked
4. All notification actions must be audit-logged

### Must Not Do
1. No client-side audience resolution
2. No direct email/SMS sending from the admin UI
3. No notification content from AI providers without admin review
4. No PII in notification logs beyond user IDs

## Phase 11 Status

**No notification system is implemented in Phase 11.** This document
defines requirements for Phase 13 implementation. The current admin
dashboard has no notification management UI or API clients.

## Dependencies for Phase 13

- Backend notification service and database schema
- Email delivery provider integration
- Notification preferences API
- Template engine for variable substitution
