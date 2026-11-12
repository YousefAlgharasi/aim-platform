// The cards of the lesson player. Lesson text (titles, bodies, examples) is English course content and always reads
// left-to-right, like the rest of the lesson content in the app; the app's own labels follow the UI language.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_asset.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson.dart';
import 'package:aim_mobile/features/lessons/ui/widgets/light_markdown.dart';
import 'package:aim_mobile/features/lessons/ui/widgets/lessons_widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import 'dialogue_scene.dart';
import 'lesson_dialogue.dart';
import 'lesson_presenter.dart';
import 'student_characters.dart';

/// Wraps English lesson text so it keeps reading left-to-right inside an Arabic layout.
class _LessonText extends StatelessWidget {
  const _LessonText({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) =>
      Directionality(textDirection: TextDirection.ltr, child: child);
}

TextStyle _heading(BuildContext context) => TextStyle(
      fontSize: 24,
      height: 1.2,
      fontWeight: FontWeight.w800,
      color: aimSurfacesOf(context).textPrimary,
    );

class SaySlideView extends StatelessWidget {
  const SaySlideView({
    required this.guide,
    required this.body,
    this.title,
    this.examples = const [],
    super.key,
  });

  final StudentCharacter guide;
  final String? title;
  final String body;
  final List<LessonExample> examples;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LessonPresenter(
          guide: guide,
          child: _LessonText(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (title != null && title!.isNotEmpty) ...[
                  Text(title!, style: _heading(context)),
                  const SizedBox(height: 10),
                ],
                LightMarkdown(
                  text: body,
                  style: TextStyle(
                    fontSize: 17,
                    height: 1.5,
                    color: surfaces.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
        for (final e in examples) ...[
          const SizedBox(height: 12),
          _ExampleCard(example: e),
        ],
      ],
    );
  }
}

class _ExampleCard extends StatelessWidget {
  const _ExampleCard({required this.example});

  final LessonExample example;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return _LessonText(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: surfaces.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: surfaces.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              example.text,
              style: TextStyle(
                fontSize: 18,
                height: 1.35,
                fontWeight: FontWeight.w600,
                color: surfaces.textPrimary,
              ),
            ),
            if (example.note != null) ...[
              const SizedBox(height: 4),
              Text(
                example.note!,
                style: TextStyle(fontSize: 13, color: surfaces.textMuted),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class PointsSlideView extends StatelessWidget {
  const PointsSlideView({required this.guide, required this.title, required this.points, super.key});

  final StudentCharacter guide;
  final String title;
  final List<String> points;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return LessonPresenter(
      guide: guide,
      child: _LessonText(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: _heading(context)),
            const SizedBox(height: 14),
            for (final p in points)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 26,
                      height: 26,
                      margin: const EdgeInsets.only(top: 1),
                      decoration: const BoxDecoration(
                        color: AimColors.success500,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check_rounded, size: 17, color: Colors.white),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        p,
                        style: TextStyle(
                          fontSize: 17,
                          height: 1.35,
                          color: surfaces.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class MistakesSlideView extends StatelessWidget {
  const MistakesSlideView({required this.guide, required this.title, required this.items, super.key});

  final StudentCharacter guide;
  final String title;
  final List<LessonMistake> items;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LessonPresenter(
          guide: guide,
          child: _LessonText(child: Text(title, style: _heading(context))),
        ),
        for (final m in items) ...[
          const SizedBox(height: 12),
          _LessonText(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: surfaces.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: surfaces.borderStrong, width: 2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Semantics(
                    label: '${l10n.lessonPlayerWrong}: ${m.wrong}',
                    excludeSemantics: true,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const _MarkBadge(color: AimColors.error500, icon: Icons.close_rounded),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            m.wrong,
                            style: const TextStyle(
                              fontSize: 17,
                              height: 1.3,
                              color: AimColors.error600,
                              decoration: TextDecoration.lineThrough,
                              decorationThickness: 2,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Semantics(
                    label: '${l10n.lessonPlayerRight}: ${m.right}',
                    excludeSemantics: true,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const _MarkBadge(color: AimColors.success500, icon: Icons.check_rounded),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            m.right,
                            style: const TextStyle(
                              fontSize: 17,
                              height: 1.3,
                              fontWeight: FontWeight.w700,
                              color: AimColors.success600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (m.why.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      m.why,
                      style: TextStyle(fontSize: 14, height: 1.35, color: surfaces.textMuted),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }
}

class _MarkBadge extends StatelessWidget {
  const _MarkBadge({required this.color, required this.icon});

  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) => Container(
        width: 24,
        height: 24,
        decoration: BoxDecoration(color: color.withValues(alpha: 0.15), shape: BoxShape.circle),
        child: Icon(icon, size: 16, color: color),
      );
}

/// A card for a lesson step (audio, image, video, vocabulary, exercise…). A listening step whose script is a
/// conversation shows the dialogue scene instead.
class AssetSlideView extends StatelessWidget {
  const AssetSlideView({required this.asset, super.key});

  final LessonAsset asset;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final script = asset.metadata?['script'];
    final lines = asset.type == 'audio' && script is String ? parseDialogue(script) : null;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: surfaces.border),
      ),
      child: lines != null
          ? DialogueScene(asset: asset, lines: lines)
          : LessonContentRenderer(asset: asset),
    );
  }
}

class IntroSlideView extends StatelessWidget {
  const IntroSlideView({
    required this.guide,
    required this.title,
    required this.completed,
    super.key,
  });

  final StudentCharacter guide;
  final String title;
  final bool completed;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LessonPresenter(
          guide: guide,
          large: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.lessonPlayerGreeting(guide.name),
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: surfaces.textMuted,
                ),
              ),
              const SizedBox(height: 8),
              _LessonText(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 30,
                    height: 1.15,
                    fontWeight: FontWeight.w800,
                    color: surfaces.textPrimary,
                  ),
                ),
              ),
              if (completed) ...[
                const SizedBox(height: 10),
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
      ],
    );
  }
}

class FinishSlideView extends StatelessWidget {
  const FinishSlideView({
    required this.guide,
    required this.completed,
    required this.onAskTutor,
    required this.onVoicePractice,
    super.key,
  });

  final StudentCharacter guide;
  final bool completed;
  final VoidCallback onAskTutor;
  final VoidCallback onVoicePractice;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LessonPresenter(
          guide: guide,
          large: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                completed ? l10n.lessonsLessonMasteredTitle : l10n.lessonPlayerReadyToPractice,
                style: _heading(context),
              ),
              const SizedBox(height: 8),
              Text(
                completed
                    ? l10n.lessonsPracticeNowSubtitle
                    : l10n.lessonPlayerFinishHint,
                style: TextStyle(fontSize: 16, height: 1.45, color: surfaces.textSecondary),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        LessonActionTile(
          icon: Icons.auto_awesome_rounded,
          title: l10n.lessonsAskAiTutorHeader,
          hint: l10n.lessonsAskAiTutorSubtitle,
          onTap: onAskTutor,
        ),
        const SizedBox(height: 10),
        LessonActionTile(
          icon: Icons.mic_rounded,
          title: completed ? l10n.lessonsRelearnWithVoice : l10n.lessonsStartLearningNow,
          onTap: onVoicePractice,
        ),
      ],
    );
  }
}

/// A tappable card with an icon, a title and an optional hint.
class LessonActionTile extends StatelessWidget {
  const LessonActionTile({
    required this.title,
    required this.onTap,
    this.icon,
    this.leading,
    this.hint,
    super.key,
  }) : assert(icon != null || leading != null, 'Give the tile an icon or a leading widget');

  /// An icon shown in a soft circle. Ignored when [leading] is given.
  final IconData? icon;

  /// A custom leading widget (e.g. a character avatar).
  final Widget? leading;
  final String title;
  final String? hint;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Material(
      color: surfaces.surface,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: surfaces.border),
          ),
          child: Row(
            children: [
              leading ??
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: AimColors.primary500.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: AimColors.primary600, size: 24),
                  ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textPrimary,
                      ),
                    ),
                    if (hint != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        hint!,
                        style: TextStyle(fontSize: 13, height: 1.3, color: surfaces.textSecondary),
                      ),
                    ],
                  ],
                ),
              ),
              Icon(
                Directionality.of(context) == TextDirection.rtl
                    ? Icons.chevron_left_rounded
                    : Icons.chevron_right_rounded,
                color: surfaces.textMuted,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
