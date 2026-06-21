# Phase 18 — AI Teacher UI Design System Rules

**Task:** P18-010
**Date:** 2026-06-21
**Dependencies:** P18-001 (`docs/phase-18/ai-teacher-voice-charter.md`), DES-001 (`docs/design/source/aim-design-system`)

## Purpose

Document how all AI Teacher and Voice Tutor UI (mobile student, admin, parent) must follow the approved AIM design system, to prevent one-off styling in this phase.

## Mandatory Rules

1. **Tokens only.** All colors, spacing, radius, elevation, and typography must come from `docs/design/source/aim-design-system/tokens` (`colors.css`, `spacing.css`, `radius.css`, `shadows.css`, `typography.css`, `sizes.css`). No hard-coded hex values, px spacing, or ad-hoc shadows in AI Teacher/voice UI code.
2. **Semantic color aliases.** Use semantic aliases (`--surface`, `--text-primary`, `--border`, `--primary-soft`, etc.) rather than raw color scale steps, so dark mode and theming work automatically.
3. **The AI gradient is reserved.** `--gradient-ai` may be used for the AI Teacher avatar, AI-generated message bubbles (`AIFeedbackBubble`), and the voice record entry point — and nowhere else in this phase's UI. Do not apply it to ordinary buttons, admin tables, or parent cards.
4. **Reuse shared components before creating new ones.** Required component reuse for Phase 18:
   - Chat messages → `components/learning/AIFeedbackBubble`
   - Voice mic control → `components/learning/RecordButton`
   - Safety/quota/error notices → `components/feedback/AlertBanner`
   - Status indicators → `components/feedback/Badge`, `components/feedback/Chip`
   - Loading states → `components/feedback/Skeleton`
   - Screen headers → `components/navigation/TopAppBar`
   - Summary/list cards → `components/learning/Card`
   - Usage indicators → `components/learning/ProgressBar`, `components/learning/CircularProgress`
   A new component may only be introduced if no existing component in the design system covers the need, and it must be built using existing tokens.
5. **Responsive layout.** Use flex/grid with `gap` per the 8-point grid (`--space-8` … `--space-64`); mobile screen padding `--space-16`; cards `--space-16`/`--space-20`. No manual margin-based spacing between inline elements.
6. **Arabic / RTL readiness.** Every AI Teacher/voice screen must render correctly under `dir="rtl"` without layout breakage. Directional icons (back chevron, send arrow) must flip in RTL using the existing mirroring pattern (e.g., `TopAppBar`'s back button `scaleX(-1)`). Arabic text blocks use the `--ar-line-scale` looser line-height token. Numbers and timestamps remain LTR even inside RTL text.
7. **Bilingual copy.** All learner-facing strings (chat placeholders, button labels, banners, empty states) ship in English and Arabic, written naturally — not literal translation.
8. **Accessibility.**
   - Minimum touch target 44px (`--touch-target`) for record button, send button, and bubble action icons.
   - Icon-only buttons (mic, send, thumbs up/down) require an `ariaLabel`.
   - Visible focus ring (`--shadow-focus`) on every interactive element.
   - Respect `prefers-reduced-motion` for the record pulse, typing-dots, and skeleton shimmer.
   - Body text minimum 16px on mobile; never ship learner-facing AI content below 14px.
9. **Consistent state coverage.** Every AI Teacher/voice screen must define, using existing patterns:
   - Loading state (`Skeleton`)
   - Empty state (friendly first-use prompt)
   - Error state (`AlertBanner`, error tone)
   - Blocked-content state (`AlertBanner`, warning tone, distinct from a normal AI reply)
   - Forbidden/consent-not-granted state (for parent summaries) — explanatory empty state, not a generic error.
10. **No one-off styling.** Do not introduce custom CSS classes that duplicate token values, custom color literals, or component variants that bypass the shared component contracts (`.d.ts` prop interfaces) defined in the design system.

## Review Checklist for Any Phase 18 UI PR

- [ ] Uses only design-system tokens (no hard-coded colors/spacing/radius/shadow)
- [ ] Reuses `AIFeedbackBubble`/`RecordButton`/`AlertBanner`/`Badge`/`Chip`/`Skeleton`/`TopAppBar`/`Card` where applicable
- [ ] `--gradient-ai` used only for AI-generated/voice entry surfaces
- [ ] Verified under `dir="rtl"` with mirrored icons
- [ ] English + Arabic copy provided
- [ ] Touch targets ≥ 44px, icon-only buttons have `ariaLabel`s
- [ ] Loading/empty/error/blocked/forbidden states all covered
- [ ] `prefers-reduced-motion` respected for animated elements
- [ ] No new one-off component created when an existing one covers the need

## Stop Condition

If a Phase 18 UI task cannot be implemented using existing design-system tokens and components without introducing one-off styling, implementation must stop and the gap must be reported rather than worked around with custom styling.
