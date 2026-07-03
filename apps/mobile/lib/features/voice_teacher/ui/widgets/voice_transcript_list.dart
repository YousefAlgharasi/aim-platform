// Phase 18 — P18-066
// VoiceTranscriptList — renders the Voice Tutor session transcript safely.
//
// Shows only backend-returned student/teacher turns (text + optional audio
// playback) and never computes mastery/level/weakness/difficulty/
// recommendation/review-schedule values.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_message.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

import 'voice_feedback_actions.dart';

class VoiceTranscriptList extends StatelessWidget {
  const VoiceTranscriptList({
    required this.messages,
    this.onPlayAudio,
    this.onFeedback,
    super.key,
  });

  final List<VoiceMessage> messages;
  final void Function(String audioRef)? onPlayAudio;
  final void Function(String messageId, String rating, String? comment)?
      onFeedback;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    if (messages.isEmpty) {
      return AIMEmptyState(
        icon: const Icon(Icons.mic_none_rounded),
        title: l10n.voiceTeacherTranscriptEmptyTitle,
        subtitle: l10n.voiceTeacherTranscriptEmptySubtitle,
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      itemCount: messages.length,
      separatorBuilder: (_, __) => const SizedBox(height: AimSpacing.innerGap),
      itemBuilder: (context, index) {
        final message = messages[index];
        final isTeacher = message.role == VoiceMessageRole.teacher;

        return Align(
          alignment:
              isTeacher ? Alignment.centerLeft : Alignment.centerRight,
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.78,
            ),
            child: Column(
              crossAxisAlignment:
                  isTeacher ? CrossAxisAlignment.start : CrossAxisAlignment.end,
              children: [
                AIMCard(
                  variant: isTeacher ? AIMCardVariant.ai : AIMCardVariant.standard,
                  semanticLabel: isTeacher
                      ? l10n.voiceTeacherTeacherSaidSemantic(message.text)
                      : l10n.voiceTeacherYouSaidSemantic(message.text),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: Text(message.text)),
                      if (isTeacher && message.audioRef != null)
                        IconButton(
                          icon: const Icon(Icons.play_circle_outline),
                          onPressed: () => onPlayAudio?.call(message.audioRef!),
                          tooltip: l10n.voiceTeacherPlayAudioTooltip,
                        ),
                    ],
                  ),
                ),
                if (isTeacher && onFeedback != null)
                  VoiceFeedbackActions(
                    messageId: message.id,
                    onFeedback: onFeedback,
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
