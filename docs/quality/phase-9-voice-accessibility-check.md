# Phase 9 — Voice UI Accessibility Check

**Task:** P9-098
**Date:** 2026-06-19
**Result:** Accessibility support verified with recommendations

## Scope

Audited all 12 Flutter voice_teacher UI files under
`apps/mobile/lib/features/voice_teacher/ui/` for accessibility compliance.

## Checks Performed

| Category | Check |
|----------|-------|
| Semantic labels | `semanticLabel`, `Semantics`, `tooltip` on interactive elements |
| Touch targets | Minimum 48×48 dp for tappable elements |
| Reduced motion | `MediaQuery.disableAnimations` respected by animated widgets |
| Color contrast | Use of AIM Design System tokens (not hardcoded low-contrast colors) |
| Screen reader | Text alternatives for non-text content |
| RTL/Arabic | Covered in P9-097; confirmed here |

## Results by File

### Semantic Labels & Tooltips

| File | Semantic Support | Details |
|------|-----------------|---------|
| voice_teacher_entry_card.dart | PASS | `semanticLabel` on card (Arabic/English) |
| audio_playback_controls.dart | PASS | Tooltips on all 5 states (Play, Pause, Resume, Replay, Retry) — bilingual |
| voice_feedback_actions.dart | PASS | Tooltip on submit button — bilingual |
| voice_record_button.dart | PASS | Delegates to AIMRecordButton (has built-in semantics) |
| microphone_permission_gate.dart | PASS | Descriptive button labels |
| voice_error_state.dart | PASS | Error titles and messages provide screen reader context |
| recording_state_bar.dart | PASS | Text labels on all action buttons (Cancel, Stop, Discard, Send) |
| voice_teacher_screen.dart | PASS | Back button with icon, titled app bar |
| transcription_preview.dart | PASS | Role labels ("What you said" / "Teacher response") |
| ai_speaking_indicator.dart | PASS | Status text ("Teacher thinking..." / "Teacher speaking...") |
| voice_waveform_indicator.dart | PASS | Decorative — no semantic label needed |
| voice_teacher_page.dart | PASS | Placeholder with text |

### Reduced Motion

| File | Has Animations | Respects Reduced Motion |
|------|---------------|------------------------|
| voice_waveform_indicator.dart | Yes (animated bars) | **YES** — checks `MediaQuery.disableAnimations` |
| ai_speaking_indicator.dart | Yes (thinking dots, speaking bars) | **NO** — does not check `disableAnimations` |
| recording_state_bar.dart | Yes (pulsing dot) | **NO** — does not check `disableAnimations` |

**Recommendation:** `ai_speaking_indicator.dart` and `recording_state_bar.dart` should
check `MediaQuery.of(context).disableAnimations` and show static indicators when
reduced motion is enabled, matching the pattern in `voice_waveform_indicator.dart`.

### Touch Target Sizes

| Widget | Target Size | Meets 48dp Minimum |
|--------|------------|-------------------|
| Voice entry card | Full card tap area | PASS |
| Record button | AIMRecordButton (64dp+) | PASS |
| Playback controls | IconButton (48dp default) | PASS |
| Feedback thumbs | IconButton (48dp default) | PASS |
| Error dismiss button | 28×28dp constraint | **BELOW** — dismiss button uses `minWidth: 28, minHeight: 28` |
| Error retry button | TextButton.icon (48dp default) | PASS |
| Recording action buttons | TextButton (48dp default) | PASS |
| Permission buttons | ElevatedButton (48dp default) | PASS |

**Recommendation:** The dismiss (close) button in `voice_error_state.dart` has
`minWidth: 28, minHeight: 28` which is below the 48dp minimum. Consider increasing
to 48dp or adding padding to ensure the effective touch area meets the guideline.

### Color & Contrast

All widgets use AIM Design System color tokens (`AIMColors.primary`,
`AIMColors.surface`, etc.) which are pre-validated for WCAG AA contrast.
No hardcoded low-contrast color combinations were found.

## Summary of Findings

| Category | Status | Issues |
|----------|--------|--------|
| Semantic labels | PASS | All interactive elements have labels or tooltips |
| Touch targets | MINOR | Error dismiss button below 48dp minimum |
| Reduced motion | MINOR | 2 of 3 animated widgets don't check `disableAnimations` |
| Color contrast | PASS | Uses validated design system tokens |
| Screen reader | PASS | Text alternatives provided throughout |
| Bilingual a11y | PASS | All labels have Arabic variants |

## Conclusion

The Voice Teacher UI has good baseline accessibility. All interactive elements
have semantic labels with bilingual support, and color contrast uses validated
design tokens. Two minor improvements are recommended: (1) check reduced motion
preference in `ai_speaking_indicator` and `recording_state_bar`, and (2) increase
the error dismiss button touch target to 48dp.
