# AIM Design System

A complete design system for **AIM** — an AI-powered English learning platform. AIM helps Arabic-speaking learners build English skills through adaptive lessons, quizzes, speaking practice, and a personal AI tutor. The system is **mobile-first** and **fully bilingual (English LTR + Arabic RTL)**.

> This project defines the reusable system: tokens, typography, components, and usage rules. It deliberately contains **no full app screens or user flows** — consuming projects assemble screens from these parts.

---

## 1 · Brand & product context

**Personality:** smart, encouraging, modern, calm. AIM should feel like a knowledgeable tutor who celebrates progress — never noisy or childish, never sterile.

**Three signature ideas the visual language encodes:**
- **Trust** → AIM Blue (`primary`). The backbone color: primary actions, focus, progress.
- **Intelligence / AI** → Purple (`secondary`) + the **AI gradient** (`--gradient-ai`). Reserve the gradient for things the AI generates or adapts: the tutor avatar, AI cards, the record/ask-AI entry points.
- **Growth** → Teal (`accent`). Progress, streaks, mastery, "you improved" moments.

**Audience & locale:** primarily Arabic-speaking learners. Every component is direction-agnostic — it mirrors correctly when an ancestor sets `dir="rtl"`. Treat Arabic as a first-class language, not an afterthought.

---

## 2 · Content fundamentals (voice & copy)

- **Encouraging, plain, second person.** "Great progress!" not "User progress nominal." Speak _to_ the learner.
- **Short.** Mobile screens are small. Prefer 1 short sentence to 2 medium ones. Buttons are verbs: "Continue", "Check answer", "Start lesson".
- **Celebrate effort, correct gently.** Praise = warm and specific ("Your past perfect is spot on"). Corrections = supportive, never red-penned ("Try _have_ instead of _has_ with _I_").
- **Bilingual parity.** Any learner-facing string ships in English and Arabic. Keep Arabic natural, not literally translated. Numbers, OTP codes and timers stay LTR even inside RTL text.
- **No jargon, no filler.** Don't add stats, badges or microcopy that don't help the learner act.

---

## 3 · Visual foundations

### Color
Semantic aliases first — build with `--surface`, `--text-primary`, `--border`, `--primary-soft`, etc., not raw scale steps, so dark mode (`[data-theme="dark"]`) and theming just work. Reach for raw steps (`--color-primary-500`) only inside component internals.
- **Status mapping:** success=completed/correct · primary=in-progress/recommended · warning=needs-review/weak · neutral=locked/not-started · error=wrong/destructive.
- **Soft fills** (`--primary-soft` + `--primary-soft-fg`, etc.) for badges, tonal buttons, alert backgrounds. They're contrast-paired and dark-mode-aware.
- **AI gradient is precious.** Don't paint random buttons with it. It signals "the AI did this."

### Typography
- **English:** Inter. **Arabic:** IBM Plex Sans Arabic (set automatically under `[dir="rtl"]`).
- Use the role shorthands: `font: var(--type-h1)`, `var(--type-body-md)`, `var(--type-button)`, etc. Don't hand-pick px sizes.
- **Arabic runs looser** — Arabic script needs more leading. Add ~18% to line-height for Arabic-set blocks (token `--ar-line-scale`). Avoid all-caps and tight tracking in Arabic.
- Body text minimum **16px** on mobile; never ship learner content below 14px.

### Spacing & layout
- **8-point grid** (`--space-8 … --space-64`) with 4px half-steps. Mobile screen padding = `--space-16`; cards = `--space-16`/`--space-20`.
- Lay rows/groups out with **flex/grid + `gap`**, not margins between inline elements.

### Radius & elevation
- Soft, friendly rounding: inputs `--radius-sm`, buttons/cards `--radius-md`/`--radius-lg`, sheets `--radius-xl`, pills `--radius-pill`.
- Shadows are **soft and cool-tinted**, used sparingly: `--shadow-card` at rest, `--shadow-card-hover` on lift, `--shadow-modal`/`--shadow-sheet` for overlays, `--shadow-fab` for floating AI actions.

### Motion
- Quick and physical: `--duration-fast/base/slow` with `--ease-standard`. Buttons scale down slightly on press. Progress animates in. **Always honor `prefers-reduced-motion`** (the record pulse, skeleton shimmer, and typing dots already do).

### Accessibility
- Min touch target **44px** (`--touch-target`) — all controls meet it.
- Every interactive element has a visible focus ring (`--shadow-focus`). Icon-only buttons require an `ariaLabel`.

---

## 4 · Iconography

- **Style:** outline (stroke) icons, **2px** stroke, round caps/joins, on a 24px grid. Match the line weight of Lucide / Feather. Use `currentColor` so icons inherit text color.
- **Sizes:** `--icon-sm 16` · `--icon-md 20` · `--icon-lg 24`. Inline icons sit on the text baseline with `--space-8` gap.
- **Directional icons** (back chevron, arrows) must flip in RTL — `TopAppBar`'s back button already does via `scaleX(-1)`.
- Don't draw illustrations in SVG by hand; use real assets or placeholders. Emoji are allowed only where the brand already uses them (e.g. the streak 🔥) — keep it rare.

---

## 5 · Using the system

Consuming projects link the compiled CSS and JS:

```html
<link rel="stylesheet" href="styles.css" />
<script src="_ds_bundle.js"></script>
<script>
  const { Button, Card, AnswerOption, AIFeedbackBubble } = window.AIMDesignSystem_e594fb;
</script>
```

All components are React (UMD-friendly) and read every value from CSS tokens, so theming and RTL come for free. For Arabic, wrap a subtree in `<div dir="rtl">…</div>`.

---

## 6 · Component index

**Buttons** — `Button` · `IconButton` · `Fab`
**Forms** — `Input` · `Textarea` · `Select` · `Checkbox` · `Radio` · `Switch` · `OTPInput`
**Feedback** — `Badge` · `Chip` · `AlertBanner` · `Skeleton`
**Navigation** — `Tabs` · `SegmentedControl` · `TopAppBar` · `BottomNav`
**Learning** — `Card` · `ProgressBar` · `CircularProgress` · `AnswerOption` · `AIFeedbackBubble` · `RecordButton`

Each component folder has a `.prompt.md` with copy-paste examples and a `.d.ts` with the full prop contract. Token specimens live in `foundations/`.
