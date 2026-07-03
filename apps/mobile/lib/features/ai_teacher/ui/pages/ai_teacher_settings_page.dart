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
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/ai_teacher/logic/provider/ai_teacher_preferences_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class AiTeacherSettingsPage extends ConsumerWidget {
  const AiTeacherSettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final preferences = ref.watch(aiTeacherPreferencesProvider);
    final notifier = ref.read(aiTeacherPreferencesProvider.notifier);
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

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
                  semanticLabel: l10n.aiTeacherPreferTextSettingSemantic,
                  child: AIMSwitch(
                    label: l10n.aiTeacherPreferTextLabel,
                    value: preferences.preferTextReplies,
                    onChanged: notifier.setPreferTextReplies,
                    semanticLabel: l10n.aiTeacherPreferTextLabel,
                  ),
                ),
                const SizedBox(height: AimSpacing.innerGap),
                AIMCard(
                  variant: AIMCardVariant.standard,
                  semanticLabel: l10n.aiTeacherReducedMotionSettingSemantic,
                  child: AIMSwitch(
                    label: l10n.aiTeacherReducedMotionLabel,
                    value: preferences.reducedMotion,
                    onChanged: notifier.setReducedMotion,
                    semanticLabel: l10n.aiTeacherReducedMotionLabel,
                  ),
                ),
                const SizedBox(height: AimSpacing.sectionGap),
                AIMAlertBanner(
                  tone: AIMAlertTone.info,
                  title: l10n.aiTeacherSettingsInfoTitle,
                  semanticLabel: l10n.aiTeacherSettingsInfoBannerSemantic,
                  child: Text(l10n.aiTeacherSettingsInfoBody),
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
    final l10n = AppLocalizations.of(context);

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
              label: l10n.commonBack,
              child: InkWell(
                onTap: () {
                  if (context.canPop()) context.pop();
                },
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Directionality.of(context) == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Text(
              l10n.aiTeacherSettingsTitle,
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
    );
  }
}
