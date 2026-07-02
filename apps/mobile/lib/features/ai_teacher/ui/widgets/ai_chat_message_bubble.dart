// Phase 8 — P8-086 / P8-092
// AiChatMessageBubble — renders a single AI Teacher chat message (student or
// ai_teacher) as a role-aligned bubble using AIM Mobile Design System tokens.
//
// This widget is purely presentational. It does not call an AI provider, an
// AIM Engine endpoint, or compute any mastery/level/weakness/difficulty/
// recommendation/review-schedule value — it only displays the backend-
// persisted [AiChatMessage.text] and [AiChatMessage.role] exactly
// as returned by GET /ai-teacher/sessions/:id/messages.
//
// When [onFeedback] is supplied, AI Teacher (non-student) messages render
// [AiReplyFeedbackActions] beneath the bubble so students can mark a reply
// helpful/not helpful (P8-092). Feedback is advisory-only and never read by
// the AIM Engine.
//
// RTL/Arabic rules:
// - The bubble side (student vs. ai_teacher) is expressed via
//   MainAxisAlignment.end/start, which is direction-aware in Flutter: under
//   RTL, "end" renders on the left and "start" on the right automatically.
// - The role icon is a trailing/leading Row element (not absolutely
//   positioned), so it mirrors correctly under RTL.
// - No hard-coded TextDirection, Alignment.left/right, or EdgeInsets.only
//   with fixed left/right values are used — only EdgeInsetsDirectional-safe
//   Row/Column composition and AIMCard.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_chat_message.dart';
import 'ai_reply_feedback_actions.dart';

/// Role-aligned chat bubble for one [AiChatMessage].
///
/// Student messages align to the trailing edge using
/// [AIMCardVariant.standard]; AI Teacher messages align to the leading edge
/// using [AIMCardVariant.ai].
class AiChatMessageBubble extends StatelessWidget {
  const AiChatMessageBubble({
    required this.message,
    super.key,
    this.onFeedback,
  });

  final AiChatMessage message;
  final Future<void> Function(String messageId, String rating)? onFeedback;

  @override
  Widget build(BuildContext context) {
    final isStudent = message.isFromStudent;

    const avatar = DecoratedBox(
      decoration: BoxDecoration(
        color: AimColors.primary500,
        shape: BoxShape.circle,
      ),
      child: Padding(
        padding: EdgeInsets.all(AimSpacing.space8),
        child: Icon(
          Icons.auto_awesome_rounded,
          size: AimSizes.iconSm,
          color: AimColors.neutral0,
        ),
      ),
    );

    final bubbleColumn = Column(
      crossAxisAlignment:
          isStudent ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.72,
          ),
          child: AIMCard(
            variant: isStudent ? AIMCardVariant.gradient : AIMCardVariant.ai,
            semanticLabel: isStudent
                ? 'Your message: ${message.text}'
                : 'AI Teacher: ${message.text}',
            child: Text(message.text),
          ),
        ),
        if (!isStudent && onFeedback != null) ...[
          const SizedBox(height: AimSpacing.space4),
          AiReplyFeedbackActions(
            messageId: message.id,
            onRate: onFeedback!,
          ),
        ],
      ],
    );

    // Design screen 33: only AI Teacher messages carry a leading avatar;
    // student messages are a plain trailing-aligned gradient bubble.
    return isStudent
        ? Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [bubbleColumn],
          )
        : Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              avatar,
              const SizedBox(width: AimSpacing.space8),
              bubbleColumn,
            ],
          );
  }
}
