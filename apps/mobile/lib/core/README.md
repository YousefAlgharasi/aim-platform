# Flutter Core Architecture

This folder contains shared Flutter Mobile foundations for Phase 1.

## Scope

P1-039 creates core architecture folders only. Logic must stay minimal.

Included areas:

- `config`
- `networking`
- `errors`
- `routing`
- `theme`
- `localization`

## Boundary Rules

Flutter Mobile must not:

- calculate mastery
- calculate learner level
- detect weakness
- adapt difficulty
- schedule retention
- generate recommendations
- call AIM Engine directly
- call AI providers directly
- store privileged backend credentials

Flutter Mobile renders backend-approved outputs only.
