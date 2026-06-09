# AIM Platform — AI Teacher Plan

> **Status:** Stub — to be completed in a dedicated planning task.

## Purpose

The AI Teacher provides:
1. **Hints** — context-sensitive nudges when a learner is stuck.
2. **Feedback** — natural language explanation of why an answer was incorrect.
3. **Encouragement** — motivational messages calibrated to learner progress.

## Core Constraint

> **All AI calls are proxied through the AIM Engine backend. No AI provider keys ever reach a client.**

The AI Teacher is a backend service, not a client feature.

## Interaction Model

```
Learner struggles → Client sends "hint request" to AIM Engine
                 → AIM Engine calls AI Teacher service
                 → AI Teacher calls LLM (Anthropic Claude)
                 → Response returned to client as plain text hint
```

## Design Principles

- Hints must be in the learner's level (A1 English).
- No medical, diagnostic, or clinical language.
- Feedback must explain, not just tell the learner they are wrong.
- All prompts stored server-side and versioned.

## Sections To Complete

- [ ] Prompt templates per skill category
- [ ] Hint throttling policy (prevent dependency on hints)
- [ ] LLM provider and model selection
- [ ] Cost estimation and budget guardrails
- [ ] A/B testing framework for hint quality

---
*Last updated: 2026-06-09*
