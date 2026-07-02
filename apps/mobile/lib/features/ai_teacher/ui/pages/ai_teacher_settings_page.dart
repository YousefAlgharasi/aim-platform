// Phase 18 — P18-067
// AiTeacherSettingsPage — AI Teacher preferences screen.
//
// Only exposes device-local, student-controlled display preferences
// (P18-067). There is no backend AI Teacher settings endpoint
// (docs/phase-18/ai-teacher-api-contracts.md): the AI Teacher's behavior,
// safety filtering, and model/provider selection are backend-owned and not
// user-configurable. This screen never reads/writes mastery/level/
// weakness/difficulty/recommendation/review-schedule data.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "AI Teacher settings" (35)
//   docs/design/ui-for-all-system-mobile/screenshots/light/35-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/35-screen.png
//
// TASK-30: restyled with the gradient header used across the rest of the
// app to match screen 35's chrome.
//
// Deviation from the mockup (never fabricate non-functional UI): the design
// shows three toggles — "Show typing indicator", "Render markdown",
// "Auto-scroll to newest" — none of which have any backing implementation
// anywhere in the AI Teacher chat feature (no typing-indicator widget, no
// markdown renderer, no auto-scroll behavior exists to toggle). Rendering
// those switches would be non-functional decoration. Only the two real,
// working preferences (`AiTeacherPreferencesStore`) are shown:
// prefer-text-replies and reduced-motion.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/ai_teacher/logic/provider/ai_teacher_preferences_provider.dart';

class AiTeacherSettingsPage extends ConsumerWidget {
  const AiTeacherSettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final preferences = ref.watch(aiTeacherPreferencesProvider);
    final notifier = ref.read(aiTeacherPreferencesProvider.notifier);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _AiTeacherSettingsHeader(),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.screenPaddingMobile,
                vertical: AimSpacing.sectionGap,
              ),
              children: [
                AIMCard(
                  variant: AIMCardVariant.standard,
                  semanticLabel: 'Prefer text replies setting',
                  child: AIMSwitch(
                    label: 'Prefer text replies over voice',
                    value: preferences.preferTextReplies,
                    onChanged: notifier.setPreferTextReplies,
                    semanticLabel: 'Prefer text replies over voice',
                  ),
                ),
                const SizedBox(height: AimSpacing.innerGap),
                AIMCard(
                  variant: AIMCardVariant.standard,
                  semanticLabel: 'Reduced motion setting',
                  child: AIMSwitch(
                    label: 'Reduce animations in AI Teacher and Voice Tutor',
                    value: preferences.reducedMotion,
                    onChanged: notifier.setReducedMotion,
                    semanticLabel:
                        'Reduce animations in AI Teacher and Voice Tutor',
                  ),
                ),
                const SizedBox(height: AimSpacing.sectionGap),
                const AIMAlertBanner(
                  tone: AIMAlertTone.info,
                  title: 'About these settings',
                  semanticLabel: 'AI Teacher settings info banner',
                  child: Text(
                    'These preferences only change how replies are shown on '
                    'this device. They never change how the AI Teacher is '
                    'taught, filtered, or graded, and never affect your '
                    'learning progress or backend-generated suggestions — '
                    'those stay fully backend-controlled.',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AiTeacherSettingsHeader extends StatelessWidget {
  const _AiTeacherSettingsHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Semantics(
              button: true,
              label: 'Back',
              child: InkWell(
                onTap: () => Navigator.of(context).maybePop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.arrow_back,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Text(
              'AI Teacher settings',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
