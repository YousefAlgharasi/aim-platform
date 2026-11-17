// LessonStartView — what the student sees when they open a lesson: two ways to learn it.
//  1. (main) Start the lesson with the AI teacher: a live voice conversation where the teacher talks the lesson through.
//  2. (secondary) Read it with a student character, one card at a time, then start practice.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/localization/inline_tr.dart';
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
    required this.onStartPractice,
    super.key,
  });

  final String title;

  /// The student character who presents the reading mode.
  final StudentCharacter guide;
  final bool completed;
  final VoidCallback onBack;
  final VoidCallback onStartLive;
  final VoidCallback onRead;

  /// Starts the question practice that finishes the lesson.
  final VoidCallback onStartPractice;

  /// "Study with the AI first" pop-up: the student picks the live lesson or goes straight to the practice.
  Future<void> _askBeforePractice(BuildContext context) async {
    final startLesson = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        icon: const Icon(Icons.school_rounded, color: AimColors.primary600, size: 32),
        title: Text(
          context.tr('Study with the AI first', 'ذاكر مع المعلم الذكي أولًا'),
          textAlign: TextAlign.center,
        ),
        content: Text(
          context.tr(
            'Make sure you study this lesson with your AI teacher before you start the practice. It helps you answer more questions correctly.',
            'تأكد من أنك تذاكر هذا الدرس مع المعلم الذكي قبل أن تبدأ التدريب. فهذا يساعدك على الإجابة عن أسئلة أكثر بشكل صحيح.',
          ),
          textAlign: TextAlign.center,
        ),
        actionsAlignment: MainAxisAlignment.center,
        actionsOverflowDirection: VerticalDirection.down,
        actionsOverflowAlignment: OverflowBarAlignment.center,
        actions: [
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () => Navigator.of(dialogContext).pop(true),
              child: Text(context.tr('Start the lesson with AI', 'ابدأ الدرس مع المعلم الذكي')),
            ),
          ),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => Navigator.of(dialogContext).pop(false),
              child: Text(context.tr('Start the practice to finish the lesson', 'ابدأ التدريب لإنهاء الدرس')),
            ),
          ),
        ],
      ),
    );
    // Tapping outside the pop-up (null) just closes it.
    if (startLesson == true) {
      onStartLive();
    } else if (startLesson == false) {
      onStartPractice();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    // The live-lesson card is the soft brand tint with a brand line around it, exactly like the web lesson start
    // (light: brand-50 / brand-200, dark: the dark soft / line brand shades), instead of a bold gradient.
    final dark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = dark ? const Color(0xFF25335B) : const Color(0xFFE9EEFE);
    final cardLine = dark ? const Color(0xFF3A4E9A) : const Color(0xFFC5D1FC);
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
                    color: cardColor,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: cardLine),
                  ),
                  child: Column(
                    children: [
                      const AimRobot(mood: RobotMood.speaking, height: 150),
                      const SizedBox(height: 16),
                      Text(
                        l10n.lessonPlayerLiveTitle,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 24,
                          height: 1.2,
                          fontWeight: FontWeight.w800,
                          color: surfaces.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        l10n.lessonPlayerLiveHint,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 15,
                          height: 1.4,
                          color: surfaces.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: onStartLive,
                          style: FilledButton.styleFrom(
                            backgroundColor: AimColors.primary600,
                            foregroundColor: AimColors.neutral0,
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
                const SizedBox(height: 12),
                // Finish the lesson with questions; a pop-up first suggests studying with the AI teacher.
                LessonActionTile(
                  icon: Icons.fact_check_rounded,
                  title: context.tr('Start practice', 'ابدأ التدريب'),
                  hint: context.tr('Answer questions to finish the lesson.', 'أجب عن الأسئلة لإنهاء الدرس.'),
                  onTap: () => _askBeforePractice(context),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
