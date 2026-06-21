// Phase 18 — P18-066
// VoiceTranscriptList — renders the Voice Tutor session transcript safely.
//
// Shows only backend-returned student/teacher turns (text + optional audio
// playback) and never computes mastery/level/weakness/difficulty/
// recommendation/review-schedule values.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_message.dart';

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
    if (messages.isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.mic_none_rounded),
        title: 'Start talking with your Voice Teacher',
        subtitle: 'Your transcript will appear here.',
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
                      ? 'Voice Teacher said: ${message.text}'
                      : 'You said: ${message.text}',
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: Text(message.text)),
                      if (isTeacher && message.audioRef != null)
                        IconButton(
                          icon: const Icon(Icons.play_circle_outline),
                          onPressed: () => onPlayAudio?.call(message.audioRef!),
                          tooltip: 'Play audio',
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
