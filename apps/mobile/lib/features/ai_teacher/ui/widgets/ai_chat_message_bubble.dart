// Phase 8 — P8-086
// AiChatMessageBubble — renders a single AI Teacher chat message (student or
// ai_teacher) as a role-aligned bubble using AIM Mobile Design System tokens.
//
// This widget is purely presentational. It does not call an AI provider, an
// AIM Engine endpoint, or compute any mastery/level/weakness/difficulty/
// recommendation/review-schedule value — it only displays the backend-
// persisted [AiChatMessageModel.text] and [AiChatMessageModel.role] exactly
// as returned by GET /ai-teacher/sessions/:id/messages.
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
import 'package:aim_mobile/features/ai_teacher/data/models/ai_teacher_chat_models.dart';

/// Role-aligned chat bubble for one [AiChatMessageModel].
///
/// Student messages align to the trailing edge using
/// [AIMCardVariant.standard]; AI Teacher messages align to the leading edge
/// using [AIMCardVariant.ai].
class AiChatMessageBubble extends StatelessWidget {
  const AiChatMessageBubble({
    required this.message,
    super.key,
  });

  final AiChatMessageModel message;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final isStudent = message.isFromStudent;

    final avatar = DecoratedBox(
      decoration: BoxDecoration(
        color: isStudent ? surfaces.surfaceSunken : AimColors.primary50,
        shape: BoxShape.circle,
      ),
      child: Padding(
        padding: const EdgeInsets.all(AimSpacing.space8),
        child: Icon(
          isStudent ? Icons.person_outline_rounded : Icons.auto_awesome_rounded,
          size: AimSizes.iconSm,
          color: isStudent ? surfaces.textSecondary : AimColors.primary500,
        ),
      ),
    );

    final bubble = ConstrainedBox(
      constraints: BoxConstraints(
        maxWidth: MediaQuery.of(context).size.width * 0.72,
      ),
      child: AIMCard(
        variant: isStudent ? AIMCardVariant.standard : AIMCardVariant.ai,
        semanticLabel: isStudent
            ? 'Your message: ${message.text}'
            : 'AI Teacher: ${message.text}',
        child: Text(message.text),
      ),
    );

    final rowChildren = isStudent
        ? [bubble, const SizedBox(width: AimSpacing.space8), avatar]
        : [avatar, const SizedBox(width: AimSpacing.space8), bubble];

    return Row(
      mainAxisAlignment:
          isStudent ? MainAxisAlignment.end : MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: rowChildren,
    );
  }
}
