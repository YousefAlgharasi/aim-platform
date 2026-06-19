# Phase 8 — System Prompt Contract

**Task:** P8-042
**Branch:** `phase8/P8-042-system-prompt-contract`
**Dependency:** P8-041 (Create AI Teacher Prompt Builder Skeleton — Done)
**Output:** `docs/phase-8/system-prompt-contract.md`

---

## Purpose

`services/backend-api/src/features/ai-teacher/prompt-builder/` (P8-041)
assembles a structured `AiTeacherPrompt` from a budgeted, backend-approved
context snapshot. This document is the stable policy contract behind the
`systemInstructions` field that prompt builder always emits: what it must
say, what it must never say, and how later prompt-builder tasks
(P8-043..P8-049) must extend it without weakening it.

---

## The Contract

Every AI Teacher prompt sent to the AI Provider Gateway (Group F) carries
exactly one system instructions block, defined in
`prompt-builder.constants.ts` as `AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS`.
This block is fixed text, not generated or modified per request. It is
prepended before any context section and before the student's message.

The system instructions block must always state:

1. **Role** — AI Teacher is a text-based tutor for Arabic-speaking A1-level
   English learners, restricted to the AIM Platform's text chat surface.
2. **Allowed actions** — explain, guide, hint, tutor, and answer learning
   questions, using only the backend-approved context provided in the
   prompt's sections.
3. **AIM Engine authority** — AIM Engine is the sole authority for
   mastery, level, weakness, difficulty, recommendations, and review
   scheduling. AI Teacher must never state, imply, or invent a different
   value for any of these than what the context sections contain.
4. **Tone bound** — responses must stay short, encouraging, and
   appropriate for an A1 learner.

This list of four statements is the minimum required content. It mirrors
`docs/phase-8/ai-teacher-authority-rule.md` and
`docs/phase-8/no-aim-replacement-rule.md` so the same authority boundary
that governs the codebase is also stated to the AI provider itself.

---

## What the System Instructions Must Never Do

| Prohibited content | Reason |
|---|---|
| Asking the AI provider to compute, infer, or guess a mastery/level/weakness/difficulty/recommendation/review-schedule value | Would turn the AI provider into a second, unaudited learning-decision authority (`docs/phase-8/no-aim-replacement-rule.md`). |
| Instructing the AI to ignore, override, or contradict context values | Context values are AIM Engine's already-computed output; instructions must never tell the model to second-guess them. |
| Embedding secrets, provider keys, Supabase service-role keys, database credentials, or production tokens | System instructions are sent to a third-party AI provider; no credential-shaped value may ever appear in this text. |
| Voice, speech-to-text, text-to-speech, or realtime-voice behavior instructions | Out of scope for Phase 8 Text Mode. |
| Clinical, diagnostic, or therapeutic framing (e.g. instructing the model to diagnose learning disabilities or mental health conditions) | AI Teacher is an educational tutor, not a clinical tool; prompts must stay educational, safe, and non-clinical. |
| Per-request dynamic instructions that change the role, authority statement, or tone bound based on student input | The contract is fixed; student input only supplies the student message and backend-approved context, never the instructions themselves. |

---

## Extension Rules for Later Prompt Builder Tasks

P8-043 through P8-049 add structured rendering for individual context
sections (e.g. student profile, current lesson, skill state, weakness,
recent mistakes, recommendation, review schedule). Each of these tasks
must follow these rules:

- Section content is rendered **after** the fixed system instructions
  block, never merged into it or used to replace any of its four required
  statements.
- Section content may only restate values already present in the
  backend-approved context snapshot (`AiTeacherContextSnapshot`,
  `docs/phase-8/context-sources.md`); it must never compute a new value.
- Section content must not introduce secrets, raw database identifiers
  unrelated to tutoring, or any other sensitive data not needed for the
  tutoring response (`docs/phase-8/privacy-policy.md`).
- If a context field is `null` or empty, the corresponding section is
  omitted entirely rather than rendered with a placeholder value, so the
  AI provider never receives an instruction to "invent" missing data.

---

## Where This Contract Applies

- **Prompt Builder (Group E):** `PromptBuilderService.buildPrompt` always
  emits `AI_TEACHER_PROMPT_SYSTEM_INSTRUCTIONS` as the `systemInstructions`
  field of every `AiTeacherPrompt`, unmodified per request.
- **AI Provider Gateway (Group F):** sends the prompt's
  `systemInstructions` as the model's system/instructions input; it must
  not strip, summarize, or rephrase this block before sending it.
- **Safety Filtering (Group E/F):** response-side safety checks
  (`docs/phase-8/ai-teacher-output-contract.md`) are a separate, later
  enforcement layer; they do not replace the need for this contract to
  hold on the input side.

---

## Relationship to Other Phase 8 Documents

- `docs/phase-8/ai-teacher-authority-rule.md` — defines the authority
  boundary at the architecture level; this document operationalizes it
  inside the literal text sent to the AI provider.
- `docs/phase-8/no-aim-replacement-rule.md` — lists prohibited code
  patterns; the "must never do" table above is the prompt-text analogue.
- `docs/phase-8/privacy-policy.md` — governs what data may appear in
  context sections; this document governs what the surrounding
  instructions may say about that data.
