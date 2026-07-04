// P21-020: Distinct, non-chat-bubble rendering for the session's
// `focusRecap` (P21-012) and `lastSessionRecap` (P21-013) fields.
//
// Both are ephemeral, derived fields on the session/history response (see
// chat-session-start.types.ts / chat-history-read.types.ts) — never
// persisted `ai_chat_messages` rows — so they must never be rendered as an
// AiChatMessageBubble (which would make them look like part of the
// permanent transcript). Styling follows this codebase's existing
// AIMBadge callout conventions.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

/// Small "Today we're focusing on: ..." callout, shown at the top of the
/// chat when [focusRecap] is present.
class AiFocusRecapCallout extends StatelessWidget {
  const AiFocusRecapCallout({required this.focusRecap, super.key});

  final String focusRecap;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: AlignmentDirectional.centerStart,
      child: AIMBadge(
        tone: AIMBadgeTone.info,
        variant: AIMBadgeVariant.soft,
        icon: const Icon(Icons.flag_rounded),
        semanticLabel: focusRecap,
        child: Text(focusRecap),
      ),
    );
  }
}

/// Distinctly-styled "Welcome back" card, shown when [lastSessionRecap] is
/// present — never rendered as an ordinary AI chat bubble.
class AiWelcomeBackCard extends StatelessWidget {
  const AiWelcomeBackCard({required this.lastSessionRecap, super.key});

  final String lastSessionRecap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);

    return Semantics(
      label: 'Welcome back: $lastSessionRecap',
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(AimSpacing.space12),
        decoration: BoxDecoration(
          color: soft.accent,
          borderRadius: AimRadius.borderMd,
          border: Border.all(color: surfaces.border),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              Icons.waving_hand_rounded,
              color: soft.onAccent,
              size: AimSizes.iconMd,
            ),
            const SizedBox(width: AimSpacing.space8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome back',
                    style: AimTextStyles.label.copyWith(
                      color: soft.onAccent,
                      fontWeight: AimFontWeights.semibold,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    lastSessionRecap,
                    style: AimTextStyles.bodySm.copyWith(color: soft.onAccent),
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
