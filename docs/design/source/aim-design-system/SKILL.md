---
name: aim-design
description: Use this skill to generate well-branded interfaces and assets for AIM, an AI-powered English learning platform, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key facts about AIM:
- AI-powered English learning, mobile-first, for Arabic-speaking learners — fully bilingual (English LTR + Arabic RTL). Every component mirrors correctly under `dir="rtl"`.
- Brand encodes three ideas: trust (AIM Blue `primary`), intelligence/AI (purple `secondary` + the `--gradient-ai`, reserved for AI-generated content), growth (teal `accent`).
- Tokens in `tokens/*.css` (all `@import`ed by root `styles.css`). Components are React, read from CSS tokens, exposed on `window.AIMDesignSystem_e594fb` via the compiled `_ds_bundle.js`.
- Component groups: Buttons, Forms, Feedback, Navigation, Learning (the domain layer: Card, ProgressBar, CircularProgress, AnswerOption, AIFeedbackBubble, RecordButton).
- Voice: encouraging, plain, second-person; celebrate effort, correct gently; keep copy short; ship every learner-facing string in English + Arabic.
