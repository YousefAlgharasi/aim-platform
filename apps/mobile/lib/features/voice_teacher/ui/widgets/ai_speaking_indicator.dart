import 'dart:math';

import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';
import 'package:aim_mobile/core/design_tokens/aim_radius.dart';

enum AiVoiceState { thinking, speaking, idle }

class AiSpeakingIndicator extends StatefulWidget {
  final AiVoiceState state;

  const AiSpeakingIndicator({super.key, required this.state});

  @override
  State<AiSpeakingIndicator> createState() => _AiSpeakingIndicatorState();
}

class _AiSpeakingIndicatorState extends State<AiSpeakingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _updateAnimation();
  }

  @override
  void didUpdateWidget(AiSpeakingIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    _updateAnimation();
  }

  void _updateAnimation() {
    if (widget.state != AiVoiceState.idle) {
      if (!_controller.isAnimating) _controller.repeat();
    } else {
      _controller.stop();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.state == AiVoiceState.idle) return const SizedBox.shrink();

    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final theme = Theme.of(context);
    final isSpeaking = widget.state == AiVoiceState.speaking;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: AIMSpacing.md,
        vertical: AIMSpacing.sm,
      ),
      margin: EdgeInsets.symmetric(horizontal: AIMSpacing.md),
      decoration: BoxDecoration(
        color: AIMColors.primary.withOpacity(0.06),
        borderRadius: BorderRadius.circular(AIMRadius.lg),
        border: Border.all(color: AIMColors.primary.withOpacity(0.15)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AIMColors.primary.withOpacity(0.1),
            ),
            child: Icon(
              isSpeaking ? Icons.volume_up : Icons.smart_toy,
              size: 18,
              color: AIMColors.primary,
            ),
          ),
          SizedBox(width: AIMSpacing.sm),
          if (isSpeaking)
            _SpeakingBars(controller: _controller)
          else
            _ThinkingDots(controller: _controller),
          SizedBox(width: AIMSpacing.sm),
          Text(
            isSpeaking
                ? (isRtl ? 'المعلم يتحدث...' : 'Teacher speaking...')
                : (isRtl ? 'المعلم يفكر...' : 'Teacher thinking...'),
            style: theme.textTheme.bodySmall?.copyWith(
              color: AIMColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ThinkingDots extends StatelessWidget {
  final AnimationController controller;

  const _ThinkingDots({required this.controller});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (i) {
            final offset = (controller.value + i * 0.33) % 1.0;
            final scale = 0.5 + 0.5 * sin(offset * pi);
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: Transform.scale(
                scale: scale,
                child: Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AIMColors.primary.withOpacity(0.6),
                  ),
                ),
              ),
            );
          }),
        );
      },
    );
  }
}

class _SpeakingBars extends StatelessWidget {
  final AnimationController controller;

  const _SpeakingBars({required this.controller});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: List.generate(4, (i) {
            final height = 8.0 +
                12.0 *
                    sin((controller.value * 2 * pi) + (i * pi / 3)).abs();
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 1.5),
              child: Container(
                width: 3,
                height: height,
                decoration: BoxDecoration(
                  color: AIMColors.primary,
                  borderRadius: BorderRadius.circular(1.5),
                ),
              ),
            );
          }),
        );
      },
    );
  }
}
