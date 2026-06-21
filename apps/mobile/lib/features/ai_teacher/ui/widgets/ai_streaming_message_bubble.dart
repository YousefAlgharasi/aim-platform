// Phase 18 — P18-061
// AiStreamingMessageBubble — renders the in-progress, safety-filtered AI
// Teacher reply text while a stream is active.
//
// This widget is purely presentational. The backend has already applied
// the same response safety filter as the non-streaming endpoint to every
// chunk before it reaches Flutter (docs/phase-18/ai-teacher-api-contracts.md)
// — this widget never receives or renders unfiltered provider output, and
// computes no mastery/level/weakness/difficulty/recommendation value.
//
// Mirrors the AI-teacher side of [AiChatMessageBubble] so a streaming reply
// looks identical to a settled one once the terminal `done` event arrives
// and the bubble is replaced by the persisted message.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

class AiStreamingMessageBubble extends StatelessWidget {
  const AiStreamingMessageBubble({required this.text, super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    final avatar = DecoratedBox(
      decoration: const BoxDecoration(
        color: AimColors.primary50,
        shape: BoxShape.circle,
      ),
      child: Padding(
        padding: const EdgeInsets.all(AimSpacing.space8),
        child: Icon(
          Icons.auto_awesome_rounded,
          size: AimSizes.iconSm,
          color: AimColors.primary500,
        ),
      ),
    );

    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        avatar,
        const SizedBox(width: AimSpacing.space8),
        ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.72,
          ),
          child: AIMCard(
            variant: AIMCardVariant.ai,
            semanticLabel: 'AI Teacher is replying: $text',
            child: Text(text.isEmpty ? '…' : text),
          ),
        ),
      ],
    );
  }
}
