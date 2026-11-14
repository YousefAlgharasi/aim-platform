// A story scene: the place, then each line as narration or as a bubble from one of the four friends.
// The English text always reads left-to-right, even inside an Arabic screen.

import 'package:flutter/material.dart';

import '../../../../core/widgets/widgets.dart';
import '../../../learner_tools/data/learner_tools_api.dart';
import '../../../lessons/ui/player/student_characters.dart';

StudentCharacter? storyCharacter(String speaker) => switch (speaker) {
      'sarah' => StudentCharacters.sarah,
      'adam' => StudentCharacters.adam,
      'yasmin' => StudentCharacters.yasmin,
      'tariq' => StudentCharacters.tariq,
      _ => null,
    };

/// The scene as plain text ("Sarah: ..."), shown above the questions so the student can look back.
String sceneAsText(List<StoryLine> lines) => lines.map((l) {
      final c = storyCharacter(l.speaker);
      return c == null ? l.text : '${c.name}: ${l.text}';
    }).join('\n');

class StorySceneView extends StatelessWidget {
  const StorySceneView({required this.setting, required this.lines, super.key});

  final String setting;
  final List<StoryLine> lines;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsetsDirectional.symmetric(horizontal: 12, vertical: 5),
          decoration: BoxDecoration(color: surfaces.surfaceSunken, borderRadius: BorderRadius.circular(100)),
          child: Text(
            setting,
            style: AimTextStyles.caption.copyWith(color: surfaces.textPrimary, fontWeight: FontWeight.w700),
          ),
        ),
        const SizedBox(height: AimSpacing.componentGap),
        Directionality(
          textDirection: TextDirection.ltr,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (final line in lines) ...[
                _Line(line: line, surfaces: surfaces, dark: dark),
                const SizedBox(height: AimSpacing.componentGap),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _Line extends StatelessWidget {
  const _Line({required this.line, required this.surfaces, required this.dark});

  final StoryLine line;
  final AimSurfaceTheme surfaces;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    final c = storyCharacter(line.speaker);
    if (c == null) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: Text(
          line.text,
          style: AimTextStyles.bodyMd.copyWith(color: surfaces.textMuted, fontStyle: FontStyle.italic, height: 1.5),
        ),
      );
    }
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Container(
          width: 44,
          height: 44,
          clipBehavior: Clip.antiAlias,
          decoration: BoxDecoration(
            color: surfaces.surfaceSunken,
            shape: BoxShape.circle,
            border: Border.all(color: surfaces.border),
          ),
          child: Image.asset(c.avatarAsset, fit: BoxFit.cover, excludeFromSemantics: true),
        ),
        const SizedBox(width: AimSpacing.space8),
        Flexible(
          child: Container(
            padding: const EdgeInsetsDirectional.all(AimSpacing.space12),
            decoration: BoxDecoration(
              color: surfaces.surface,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(18),
                topRight: Radius.circular(18),
                bottomRight: Radius.circular(18),
                bottomLeft: Radius.circular(4),
              ),
              border: Border.all(color: surfaces.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  c.name,
                  style: AimTextStyles.caption.copyWith(color: AimColors.primary500, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 2),
                Text(
                  line.text,
                  style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary, height: 1.45),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// The four friends in a row, for story cards and the intro screen.
class StoryCast extends StatelessWidget {
  const StoryCast({this.size = 34, super.key});

  final double size;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Directionality(
      textDirection: TextDirection.ltr,
      child: SizedBox(
        height: size,
        width: size + (size * 0.65) * 3,
        child: Stack(
          children: [
            for (var i = 0; i < StudentCharacters.presenterOrder.length; i++)
              Positioned(
                left: i * size * 0.65,
                child: Container(
                  width: size,
                  height: size,
                  clipBehavior: Clip.antiAlias,
                  decoration: BoxDecoration(
                    color: surfaces.surfaceSunken,
                    shape: BoxShape.circle,
                    border: Border.all(color: surfaces.surface, width: 2),
                  ),
                  child: Image.asset(StudentCharacters.presenterOrder[i].avatarAsset,
                      fit: BoxFit.cover, excludeFromSemantics: true),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
