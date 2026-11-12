// LessonStartView — what the student sees when they open a lesson: two ways to learn it.
//  1. (main) Start the lesson with the AI teacher: a live voice conversation where the teacher talks the lesson through.
//  2. (secondary) Read it with a student character, one card at a time, then start practice.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/voice_teacher/ui/widgets/aim_robot.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import 'lesson_slide_views.dart';
import 'student_characters.dart';

class LessonStartView extends StatelessWidget {
  const LessonStartView({
    required this.title,
    required this.guide,
    required this.completed,
    required this.onBack,
    required this.onStartLive,
    required this.onRead,
    super.key,
  });

  final String title;

  /// The student character who presents the reading mode.
  final StudentCharacter guide;
  final bool completed;
  final VoidCallback onBack;
  final VoidCallback onStartLive;
  final VoidCallback onRead;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 640),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    IconButton(
                      onPressed: onBack,
                      tooltip: l10n.commonBack,
                      icon: const Icon(Icons.arrow_back_rounded),
                      color: surfaces.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Directionality(
                              textDirection: TextDirection.ltr,
                              child: Text(
                                title,
                                style: TextStyle(
                                  fontSize: 26,
                                  height: 1.15,
                                  fontWeight: FontWeight.w800,
                                  color: surfaces.textPrimary,
                                ),
                              ),
                            ),
                            if (completed) ...[
                              const SizedBox(height: 6),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.check_circle_rounded, size: 18, color: AimColors.success600),
                                  const SizedBox(width: 6),
                                  Text(
                                    l10n.lessonPlayerCompleted,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: AimColors.success600,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Main: live lesson with the AI teacher.
                Container(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
                  decoration: BoxDecoration(
                    gradient: AimGradients.gzHero,
                    borderRadius: BorderRadius.circular(28),
                  ),
                  child: Column(
                    children: [
                      const AimRobot(mood: RobotMood.speaking, height: 150),
                      const SizedBox(height: 16),
                      Text(
                        l10n.lessonPlayerLiveTitle,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 24,
                          height: 1.2,
                          fontWeight: FontWeight.w800,
                          color: AimColors.neutral0,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        l10n.lessonPlayerLiveHint,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 15,
                          height: 1.4,
                          color: AimColors.neutral0.withValues(alpha: 0.9),
                        ),
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: onStartLive,
                          style: FilledButton.styleFrom(
                            backgroundColor: AimColors.neutral0,
                            foregroundColor: AimColors.primary600,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                          ),
                          child: Text(
                            l10n.lessonPlayerLiveButton,
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                // Secondary: read it with a named student character.
                LessonActionTile(
                  leading: ClipOval(
                    child: Container(
                      width: 52,
                      height: 52,
                      color: AimColors.primary500.withValues(alpha: 0.12),
                      child: Image.asset(guide.avatarAsset, fit: BoxFit.cover, excludeFromSemantics: true),
                    ),
                  ),
                  title: l10n.lessonPlayerReadWith(guide.name),
                  hint: l10n.lessonPlayerReadHint,
                  onTap: onRead,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
