# Phase 7 — Student Web AI/Notifications/Billing E2E Check

## Review Date
2026-06-21

## Scope
End-to-end verification of AI teacher chat, notification center, and billing surfaces.

## Test Scenarios

### 1. AI Teacher Entry
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 1.1 | Navigate to `/ai-teacher` | Suggested topics and recent conversations from API | PASS |
| 1.2 | Click suggested topic | New conversation created via API, navigate to chat | PASS |
| 1.3 | Click recent conversation | Navigate to `/ai-teacher/:conversationId` | PASS |

### 2. AI Chat
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 2.1 | Load chat page | Message history loaded from API | PASS |
| 2.2 | Send message | Message submitted via API, typing indicator shown | PASS |
| 2.3 | Receive AI response | Response displayed from backend (no direct AI provider call) | PASS |
| 2.4 | Empty conversation | Welcome message displayed | PASS |

### 3. AI History
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 3.1 | Navigate to `/ai-teacher/history` | Conversation list from API | PASS |
| 3.2 | Rate conversation | Feedback submitted via API | PASS |
| 3.3 | No history | EmptyState displayed | PASS |

### 4. Notification Center
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 4.1 | Navigate to `/notifications` | Notification inbox from API | PASS |
| 4.2 | Mark as read | Read status updated via API | PASS |
| 4.3 | Dismiss notification | Dismissed via API | PASS |
| 4.4 | No notifications | EmptyState displayed | PASS |

### 5. Notification Preferences
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 5.1 | Navigate to `/notifications/preferences` | Preference toggles from API | PASS |
| 5.2 | Toggle preference | Updated via API | PASS |

### 6. Billing
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 6.1 | Navigate to `/billing` | Plans grid, subscription info, invoices from API | PASS |
| 6.2 | Click upgrade plan | Navigate to `/billing/checkout/:planId` | PASS |
| 6.3 | No subscription | Free tier info displayed from API | PASS |

### 7. Checkout
| Step | Action | Expected Result | Status |
|------|--------|-----------------|--------|
| 7.1 | View checkout | Plan details and confirmation from API | PASS |
| 7.2 | Confirm checkout | Payment initiated via backend API, redirect to provider | PASS |
| 7.3 | Cancel checkout | Return to billing page | PASS |

## Authority Verification
- No direct AI provider SDK (OpenAI/Anthropic) — all AI via backend
- No local notification delivery or scheduling — read/dismiss via API only
- No local entitlement checks — plan status from backend
- No local payment processing — checkout via backend API to payment provider
- No API keys or provider credentials in client code

## Verdict
PASS — AI teacher, notifications, and billing correctly delegate all authority to backend services.
