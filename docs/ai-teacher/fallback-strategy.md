# AI Teacher Fallback Response Strategy

## Purpose

This document defines the AI Teacher fallback response strategy for the AIM Platform. It specifies when fallback is triggered, what fallback responses look like, and what is forbidden in any fallback response.

---

## Fallback Triggers

Fallback is triggered in two cases:

### 1. Provider Unavailability

The AI provider is unavailable, times out, or returns an unprocessable response.

- `AiTeacherValidationStatus.FALLBACK_USED` is set.
- The raw provider error is never forwarded to any consumer.
- The fallback message is served instead.

### 2. Validator Block

The safety validator (`AiTeacherSafetyValidator`) returns a non-passing status:

| Validation Status | Fallback Triggered |
|---|---|
| `FAILED_PROHIBITED_LANGUAGE` | Yes |
| `FAILED_ANSWER_LEAKAGE` | Yes |
| `FAILED_EXCESSIVE_LENGTH` | Yes |
| `FAILED_OFF_TOPIC` | Yes |
| `PASSED` | No — real response is returned |

---

## Fallback Messages

Fallback messages are pre-authored, static, and mode-specific. They are student-safe and educationally appropriate.

| Mode | Fallback Message |
|---|---|
| `EXPLAIN_MORE` | "Let's look at this again. Try reading the explanation once more and focus on the key words." |
| `GIVE_EXAMPLE` | "Here is a tip: look for the pattern in the examples you have already seen." |
| `EXPLAIN_WHY` | "That was not quite right. Review the explanation and try again — you are making progress." |
| `REMEDIATION` | "Take your time with this skill. Re-read the lesson and try the practice questions again." |

---

## Fallback Response Shape

```typescript
{
  message: string;
  reason: AiTeacherValidationStatus;
  is_fallback: true;
}
```

- `message` — student-safe, pre-authored text. Appropriate for the mode.
- `reason` — the validation status that triggered fallback. Backend-internal. Never forwarded to Flutter or Admin Dashboard.
- `is_fallback` — always `true`. Consumed by the AI Teacher service to build the `AiTeacherResponse`.

---

## Forbidden in Fallback

- Raw AI provider error messages or response bodies.
- Stack traces or internal exception details.
- The word "error", "exception", "provider", "API key", or any internal system name.
- The correct answer to an unanswered question.
- Any content that would fail the safety validator if it appeared in a real response.

---

## Implementation

- `AiTeacherFallbackService` — injectable NestJS service.
- `getFallback(mode, reason)` — returns `AiTeacherFallbackResult`.
- `AiTeacherSafetyValidator` — calls `getFallback` when validation fails.
- Tests: `tests/ai-teacher-fallback.service.spec.ts` — 4 test cases.

---

## Related Documents

- `packages/shared-contracts/api/ai-teacher-contracts.md` — Full request/response contracts.
- `services/backend-api/src/features/ai-teacher/ai-teacher-safety.validator.ts` — Validator that triggers fallback.
- `docs/ai-teacher/behavior-rules.md` — Behavioral rules and interaction modes.
