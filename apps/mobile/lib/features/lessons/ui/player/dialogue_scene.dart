// A conversation shown as a small scene: the speakers stand on a stage facing each other and every line is a chat
// bubble with the speaker's avatar. "Show/Hide text" turns it into a listening exercise. The audio is the lesson
// asset's own recording (synthesised by the backend), played with the app's standard audio button.

import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_asset.dart';
import 'package:aim_mobile/features/question_answer/logic/provider/question_answer_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import 'lesson_dialogue.dart';
import 'lesson_presenter.dart';
import 'student_characters.dart';

class DialogueScene extends ConsumerStatefulWidget {
  const DialogueScene({required this.asset, required this.lines, super.key});

  final LessonAsset asset;
  final List<DialogueLine> lines;

  @override
  ConsumerState<DialogueScene> createState() => _DialogueSceneState();
}

class _DialogueSceneState extends ConsumerState<DialogueScene> {
  bool _showText = true;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final speakers = uniqueSpeakers(widget.lines);
    final cast = assignCharacters(speakers, widget.asset.id);
    final rtl = Directionality.of(context) == TextDirection.rtl;

    // Slot i of n looks toward the middle of the group (physical direction, mirrored in RTL where slot 0 is on the right).
    bool lookRight(int i) {
      final towardEnd = i <= (speakers.length - 1) / 2;
      return rtl ? !towardEnd : towardEnd;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          widget.asset.title,
          textDirection: TextDirection.ltr,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: surfaces.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        // Stage
        Container(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
          decoration: BoxDecoration(
            color: AimColors.primary500.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              for (var i = 0; i < cast.length; i++) ...[
                if (i > 0) const SizedBox(width: 28),
                ExcludeSemantics(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CharacterImage(
                        character: cast[i],
                        height: 120,
                        lookTowardRight: lookRight(i),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                        decoration: BoxDecoration(
                          color: surfaces.surface,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          speakers[i],
                          textDirection: TextDirection.ltr,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: surfaces.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 12),
        if (widget.asset.metadata?['script'] is String)
          Consumer(
            builder: (context, ref, _) => QuestionAudioPlayButton(
              fetchAudioBytes: () async {
                final token = ref.read(authFlowProvider).accessToken ?? '';
                final bytes = await ref
                    .read(questionAnswerRepositoryProvider)
                    .getLessonAssetAudio(
                      bearerToken: token,
                      assetId: widget.asset.id,
                    );
                return Uint8List.fromList(bytes);
              },
            ),
          ),
        Align(
          alignment: AlignmentDirectional.centerStart,
          child: TextButton(
            onPressed: () => setState(() => _showText = !_showText),
            child: Text(_showText ? l10n.lessonPlayerHideText : l10n.lessonPlayerShowText),
          ),
        ),
        if (_showText)
          Semantics(
            label: l10n.lessonPlayerConversation,
            container: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (final line in widget.lines)
                  _ChatLine(
                    line: line,
                    character: cast[speakers.indexOf(line.speaker)],
                    mine: speakers.indexOf(line.speaker).isOdd,
                  ),
              ],
            ),
          ),
      ],
    );
  }
}

class _ChatLine extends StatelessWidget {
  const _ChatLine({required this.line, required this.character, required this.mine});

  final DialogueLine line;
  final StudentCharacter character;

  /// Odd speakers sit on the opposite side, like a chat.
  final bool mine;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final ambient = Directionality.of(context);
    final reversed = ambient == TextDirection.ltr ? TextDirection.rtl : TextDirection.ltr;
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        textDirection: mine ? reversed : ambient,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          ExcludeSemantics(
            child: ClipOval(
              child: Container(
                width: 40,
                height: 40,
                color: AimColors.primary500.withValues(alpha: 0.12),
                child: Image.asset(character.avatarAsset, fit: BoxFit.cover),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Text(
                    line.speaker,
                    textDirection: TextDirection.ltr,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: surfaces.textMuted,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: mine
                        ? AimColors.primary500.withValues(alpha: 0.14)
                        : surfaces.surfaceSunken,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(
                      color: mine ? AimColors.primary200 : surfaces.border,
                    ),
                  ),
                  child: Text(
                    line.text,
                    textDirection: TextDirection.ltr,
                    style: TextStyle(
                      fontSize: 16,
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
    );
  }
}
