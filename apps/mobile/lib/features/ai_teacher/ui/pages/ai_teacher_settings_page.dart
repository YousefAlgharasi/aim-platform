// Phase 18 — P18-067
// AiTeacherSettingsPage — AI Teacher preferences screen.
//
// Only exposes device-local, student-controlled display preferences
// (P18-067). There is no backend AI Teacher settings endpoint
// (docs/phase-18/ai-teacher-api-contracts.md): the AI Teacher's behavior,
// safety filtering, and model/provider selection are backend-owned and not
// user-configurable. This screen never reads/writes mastery/level/
// weakness/difficulty/recommendation/review-schedule data.

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

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'AI Teacher Settings'),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
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
                semanticLabel: 'Reduce animations in AI Teacher and Voice Tutor',
              ),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
            const AIMAlertBanner(
              tone: AIMAlertTone.info,
              title: 'About these settings',
              semanticLabel: 'AI Teacher settings info banner',
              child: Text(
                'These preferences only change how replies are shown on this '
                'device. They never change how the AI Teacher is taught, '
                'filtered, or graded, and never affect your mastery, level, '
                'or recommendations — those stay fully backend-controlled.',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
