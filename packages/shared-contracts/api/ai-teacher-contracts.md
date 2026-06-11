# AI Teacher Request/Response Contracts

## Purpose

This document defines the AI Teacher request and response contracts for the AIM Platform. These contracts are used exclusively by the Backend API AI Teacher gateway (`services/backend-api/src/features/ai-teacher/`). No client (Flutter Mobile, Admin Dashboard) constructs or receives these contracts directly.

---

## Boundaries

- All AI Teacher requests originate from the Backend API only.
- All AI Teacher responses are validated by the safety validator before any output is returned to a consumer.
- No contract field contains AI provider credentials, internal database IDs beyond what is required for context, or raw AI provider response objects.
- No general chatbot request or response shape is permitted. All requests carry AIM lesson/skill context.

---

## Enums

These values align with `packages/shared-contracts/enums/common-enums.md`.

### `AiTeacherMode`

| Value | Description |
|---|---|
| `EXPLAIN_MORE` | Student requested re-explanation of a concept. |
| `GIVE_EXAMPLE` | Student requested an additional example. |
| `EXPLAIN_WHY` | Post-incorrect-answer explanation of why the answer was wrong. |
| `REMEDIATION` | System-triggered remediation after repeated failure threshold. |

### `AiTeacherValidationStatus`

| Value | Description |
|---|---|
| `PASSED` | Response passed all safety checks. Safe to return to consumer. |
| `FAILED_PROHIBITED_LANGUAGE` | Response contains prohibited language. Must not be returned. |
| `FAILED_OFF_TOPIC` | Response is outside the current lesson/skill scope. Must not be returned. |
| `FAILED_ANSWER_LEAKAGE` | Response reveals the correct answer to an unanswered question. Must not be returned. |
| `FAILED_EXCESSIVE_LENGTH` | Response exceeds the 150-word cap. Must not be returned untruncated. |
| `FALLBACK_USED` | AI provider was unavailable or validation failed — fallback response was served. |

---

## Request Contract

### `AiTeacherRequest`

Sent by the Backend API to the AI Teacher service.

```typescript
{
  mode: AiTeacherMode;
  lesson_context: AiTeacherLessonContext;
  skill_context: AiTeacherSkillContext;
  question_context: AiTeacherQuestionContext | null;
  student_context: AiTeacherStudentContext;
}
```

### `AiTeacherLessonContext`

```typescript
{
  lesson_id: string;
  lesson_type: string;
  current_block_type: string;
  current_explanation_text: string | null;
  existing_examples: string[];
}
```

| Field | Required | Notes |
|---|---|---|
| `lesson_id` | Yes | Backend internal ID. Not exposed to clients. |
| `lesson_type` | Yes | e.g. `PRACTICE`, `REVIEW`, `PLACEMENT`. From `LessonType` enum. |
| `current_block_type` | Yes | Block type from lesson content structure. |
| `current_explanation_text` | Conditional | Required for `EXPLAIN_MORE`. |
| `existing_examples` | Yes | Already-shown examples — AI Teacher must not duplicate. Empty array if none. |

### `AiTeacherSkillContext`

```typescript
{
  skill_id: string;
  skill_name_en: string;
  skill_level: string;
}
```

| Field | Required | Notes |
|---|---|---|
| `skill_id` | Yes | Canonical skill ID from `docs/learning/english-skill-tree.md`. |
| `skill_name_en` | Yes | English skill name. Used to scope AI Teacher output. |
| `skill_level` | Yes | e.g. `A1`. AI Teacher must not introduce vocabulary above this level. |

### `AiTeacherQuestionContext`

```typescript
{
  question_id: string;
  question_text: string;
  question_type: string;
  attempt_count: number;
  was_correct: boolean | null;
}
```

| Field | Required | Notes |
|---|---|---|
| `question_id` | Yes | Backend internal ID. Not exposed to clients. |
| `question_text` | Yes | The question the student saw. |
| `question_type` | Yes | From `QuestionType` enum. |
| `attempt_count` | Yes | Number of attempts made on this question in this session. |
| `was_correct` | Conditional | Required for `EXPLAIN_WHY`. `null` for non-answer-related modes. |

### `AiTeacherStudentContext`

```typescript
{
  student_id: string;
  mastery_band: string | null;
  attempt_count_for_skill: number;
}
```

| Field | Required | Notes |
|---|---|---|
| `student_id` | Yes | Backend internal ID. Not exposed in response. Never logged at AI provider. |
| `mastery_band` | No | Current mastery band label for context. May be `null` for new students. |
| `attempt_count_for_skill` | Yes | Cumulative attempts on this skill in the current session. |

---

## Response Contract

### `AiTeacherResponse`

Returned by the AI Teacher service to its backend caller after validation.

```typescript
{
  mode: AiTeacherMode;
  validation_status: AiTeacherValidationStatus;
  content: AiTeacherResponseContent | null;
  fallback: AiTeacherFallbackContent | null;
  is_fallback: boolean;
}
```

| Field | Type | Notes |
|---|---|---|
| `mode` | `AiTeacherMode` | Echo of the requested mode. |
| `validation_status` | `AiTeacherValidationStatus` | Result of safety validation. |
| `content` | `AiTeacherResponseContent \| null` | Present when validation passes. `null` when fallback is used. |
| `fallback` | `AiTeacherFallbackContent \| null` | Present only when `is_fallback` is `true`. |
| `is_fallback` | `boolean` | `true` when AI provider was unavailable or validation failed. |

### `AiTeacherResponseContent`

```typescript
{
  explanation: string;
  example: string | null;
  word_count: number;
}
```

| Field | Notes |
|---|---|
| `explanation` | The validated AI Teacher explanation. Max 150 words. |
| `example` | Present only when mode is `GIVE_EXAMPLE`. Null otherwise. |
| `word_count` | Word count of the explanation. Must be ≤ 150. |

### `AiTeacherFallbackContent`

```typescript
{
  message: string;
  reason: AiTeacherValidationStatus;
}
```

| Field | Notes |
|---|---|
| `message` | Safe, pre-authored fallback message. Student-displayable. |
| `reason` | Why fallback was used. Backend-internal — not forwarded to client. |

---

## Safe Response Rules

The following rules apply to every `AiTeacherResponseContent` before it is returned:

1. Word count must not exceed 150.
2. Response must not contain the correct answer to an unanswered question.
3. Response must not contain prohibited language (profanity, hate speech, culturally insensitive content).
4. Response must not introduce vocabulary above the student's skill level.
5. Response must not deviate from the current lesson skill scope.
6. Response must not expose internal IDs, backend internals, or AI provider details.

If any rule is violated, `validation_status` is set to the appropriate failure code and `is_fallback` is set to `true`.

---

## Fallback Response Rules

1. Fallback is triggered when AI provider is unavailable, times out, or returns a response that fails validation.
2. Fallback messages are pre-authored, static, and student-safe.
3. Fallback messages do not expose the reason for the fallback to the student.
4. Fallback content must still be appropriate for the requested mode.

---

## Forbidden Fields

The following must never appear in any AI Teacher request or response:

| Field | Reason |
|---|---|
| `AI_PROVIDER_API_KEY` | Never passed in any request or response. |
| Raw AI provider response object | Validated and transformed before use. |
| Student password, email, or PII beyond `student_id` | Not required for AI Teacher context. |
| Answer to an unanswered question | Leakage violation. |
| Stack traces or internal error messages | Never forwarded to consumer. |

---

## Related Documents

- `packages/shared-contracts/enums/common-enums.md` — Enum values reference.
- `docs/ai-teacher/behavior-rules.md` — Behavioral rules and interaction mode details.
- `services/backend-api/src/features/ai-teacher/README.md` — Gateway boundary module rules.
- `packages/shared-contracts/api/errors.md` — Error contract if AI Teacher returns an error envelope.
