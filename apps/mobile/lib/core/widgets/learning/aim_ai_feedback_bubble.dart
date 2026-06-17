import 'package:flutter/material.dart';

import '../../design_tokens/design_tokens.dart';
import '../../theme/theme.dart';

/// Bubble tint for [AIMAIFeedbackBubble].
enum AIMAIFeedbackTone {
  /// Default surface background.
  neutral,

  /// Green-tinted success surface.
  praise,

  /// Amber-tinted warning surface.
  correction,
}

/// AI tutor feedback message — a chat bubble with the AIM gradient avatar.
///
/// The signature element for AI-generated guidance. Use [typing] to show a
/// streaming indicator while the model responds. The bubble anchors to the
/// leading edge, so it mirrors correctly in RTL layouts.
///
/// ```dart
/// AIMAIFeedbackBubble(
///   tone: AIMAIFeedbackTone.praise,
///   child: Text('Great sentence!'),
/// )
/// AIMAIFeedbackBubble(typing: true)
/// ```
class AIMAIFeedbackBubble extends StatelessWidget {
  const AIMAIFeedbackBubble({
    super.key,
    this.name = 'AI Tutor',
    this.tone = AIMAIFeedbackTone.neutral,
    this.typing = false,
    this.child,
  });

  /// Sender display name. Defaults to `'AI Tutor'`.
  final String name;

  /// Bubble background tint. Defaults to [AIMAIFeedbackTone.neutral].
  final AIMAIFeedbackTone tone;

  /// Show the animated three-dot typing indicator instead of [child].
  final bool typing;

  /// Bubble content. Ignored when [typing] is true.
  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final gradients = aimGradientsOf(context);
    final shadows = aimShadowsOf(context);
    final isRtl = Directionality.of(context) == TextDirection.rtl;

    final (bubbleBg, bubbleBorder) = switch (tone) {
      AIMAIFeedbackTone.neutral => (surfaces.surface, surfaces.border),
      AIMAIFeedbackTone.praise => (soft.success, AimColors.success100),
      AIMAIFeedbackTone.correction => (soft.warning, AimColors.warning100),
    };

    // The "notch" corner is always on the avatar side (leading edge).
    // border-start-start-radius: xs in the design becomes the top-leading
    // corner in Flutter, which depends on text direction.
    final bubbleRadius = isRtl
        ? const BorderRadius.only(
            topLeft: AimRadius.radiusLg,
            topRight: AimRadius.radiusXs, // leading in RTL
            bottomLeft: AimRadius.radiusLg,
            bottomRight: AimRadius.radiusLg,
          )
        : const BorderRadius.only(
            topLeft: AimRadius.radiusXs, // leading in LTR
            topRight: AimRadius.radiusLg,
            bottomLeft: AimRadius.radiusLg,
            bottomRight: AimRadius.radiusLg,
          );

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Gradient avatar
        Container(
          width: AimSizes.avatarSm,
          height: AimSizes.avatarSm,
          decoration: BoxDecoration(
            gradient: gradients.ai,
            shape: BoxShape.circle,
            boxShadow: shadows.fab,
          ),
          alignment: Alignment.center,
          child: const ExcludeSemantics(
            child: Icon(
              Icons.auto_awesome,
              color: AimColors.neutral0,
              size: AimSizes.iconMd,
            ),
          ),
        ),
        const SizedBox(width: AimSpacing.space12),
        // Bubble
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AimSpacing.space16,
              vertical: AimSpacing.space12,
            ),
            decoration: BoxDecoration(
              color: bubbleBg,
              border: Border.all(color: bubbleBorder),
              borderRadius: bubbleRadius,
              boxShadow: shadows.card,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Sender label
                Text(
                  name,
                  style: AimTextStyles.label.copyWith(
                    color: soft.onSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                // Content or typing dots
                if (typing)
                  const Semantics(
                    label: 'AI is typing',
                    child: ExcludeSemantics(child: _TypingIndicator()),
                  )
                else if (child != null)
                  DefaultTextStyle.merge(
                    style: AimTextStyles.bodyMd
                        .copyWith(color: surfaces.textPrimary),
                    child: child!,
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Animated three-dot typing indicator
// ---------------------------------------------------------------------------

class _TypingIndicator extends StatefulWidget {
  const _TypingIndicator();

  @override
  State<_TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<_TypingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  static const _dotCount = 3;
  static const _dotSize = 7.0;
  static const _dotSpacing = 4.0;
  static const _maxLift = 4.0;
  static const _period = 1.2; // seconds
  static const _stagger = 0.15;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: (_period * 1000).round()),
    );
    // Reduced-motion check runs in didChangeDependencies once MediaQuery is
    // available.
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final reduceMotion = MediaQuery.of(context).disableAnimations;
    if (reduceMotion) {
      _controller.stop();
    } else if (!_controller.isAnimating) {
      _controller.repeat();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  /// Returns a 0→1→0 opacity+lift animation for [dotIndex].
  Animation<double> _liftFor(int dotIndex) {
    final delay = _stagger * dotIndex;
    // Wrap within 0..1
    return TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween(begin: 0, end: 1).chain(CurveTween(curve: Curves.easeIn)),
        weight: 30,
      ),
      TweenSequenceItem(
        tween: Tween(begin: 1, end: 0).chain(CurveTween(curve: Curves.easeOut)),
        weight: 30,
      ),
      TweenSequenceItem(
        tween: ConstantTween(0),
        weight: 40,
      ),
    ]).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Interval(delay, (delay + 0.6).clamp(0, 1)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return SizedBox(
      height: _dotSize + _maxLift,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          return Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: List.generate(_dotCount, (i) {
              final lift = _liftFor(i).value * _maxLift;
              return Padding(
                padding: EdgeInsets.only(
                  right: i < _dotCount - 1 ? _dotSpacing : 0,
                  bottom: lift,
                ),
                child: Container(
                  width: _dotSize,
                  height: _dotSize,
                  decoration: BoxDecoration(
                    color: surfaces.textMuted.withValues(
                      alpha: 0.5 + _liftFor(i).value * 0.5,
                    ),
                    shape: BoxShape.circle,
                  ),
                ),
              );
            }),
          );
        },
      ),
    );
  }
}
