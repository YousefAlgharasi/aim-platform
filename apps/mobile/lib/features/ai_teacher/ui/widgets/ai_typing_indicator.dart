// Phase 8 — P8-088
// AiTypingIndicator — "AI Teacher is typing" loading state for the chat
// screen, shown while the backend is generating a reply.
//
// This widget is purely presentational. It does not call an AI provider, an
// AIM Engine endpoint, or compute any mastery/level/weakness/difficulty/
// recommendation/review-schedule value
// (docs/phase-8/no-aim-replacement-rule.md). It only renders a generic
// "waiting for the backend" animation — it never implies a specific reply,
// score, or learning decision.
//
// RTL/Arabic rules:
// - Mirrors AiChatMessageBubble's ai_teacher layout: leading avatar then
//   bubble, aligned to MainAxisAlignment.start, which is direction-aware in
//   Flutter (renders on the visual "start" side under both LTR and RTL).
// - The animated dots are a Row of equally-spaced children with no
//   hard-coded TextDirection or Alignment.left/right.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';

/// Animated "AI Teacher is typing" bubble, styled like an ai_teacher chat
/// message bubble so it appears inline with the message history.
class AiTypingIndicator extends StatefulWidget {
  const AiTypingIndicator({super.key});

  @override
  State<AiTypingIndicator> createState() => _AiTypingIndicatorState();
}

class _AiTypingIndicatorState extends State<AiTypingIndicator>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    const avatar = DecoratedBox(
      decoration: BoxDecoration(
        color: AimColors.primary50,
        shape: BoxShape.circle,
      ),
      child: Padding(
        padding: EdgeInsets.all(AimSpacing.space8),
        child: Icon(
          Icons.auto_awesome_rounded,
          size: AimSizes.iconSm,
          color: AimColors.primary500,
        ),
      ),
    );

    final dots = AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (index) {
            final delay = index * 0.2;
            final t = ((_controller.value - delay) % 1.0).clamp(0.0, 1.0);
            final opacity = 0.3 + 0.7 * (t < 0.5 ? t * 2 : (1 - t) * 2);
            return Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AimSpacing.space2,
              ),
              child: Opacity(
                opacity: opacity,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: surfaces.textSecondary,
                    shape: BoxShape.circle,
                  ),
                  child: const SizedBox(width: 6, height: 6),
                ),
              ),
            );
          }),
        );
      },
    );

    final bubble = AIMCard(
      variant: AIMCardVariant.ai,
      semanticLabel: 'AI Teacher is typing',
      child: dots,
    );

    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        avatar,
        const SizedBox(width: AimSpacing.space8),
        bubble,
      ],
    );
  }
}
