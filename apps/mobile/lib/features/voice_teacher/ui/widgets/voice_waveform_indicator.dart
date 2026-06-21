import 'dart:math';

import 'package:flutter/material.dart';
import 'package:aim_mobile/core/design_tokens/aim_colors.dart';
import 'package:aim_mobile/core/design_tokens/aim_spacing.dart';

class VoiceWaveformIndicator extends StatefulWidget {
  final bool active;
  final Color? color;
  final double height;
  final int barCount;

  const VoiceWaveformIndicator({
    super.key,
    this.active = false,
    this.color,
    this.height = 32,
    this.barCount = 5,
  });

  @override
  State<VoiceWaveformIndicator> createState() => _VoiceWaveformIndicatorState();
}

class _VoiceWaveformIndicatorState extends State<VoiceWaveformIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final _random = Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    if (widget.active) _controller.repeat();
  }

  @override
  void didUpdateWidget(VoiceWaveformIndicator oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.active && !_controller.isAnimating) {
      _controller.repeat();
    } else if (!widget.active && _controller.isAnimating) {
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
    final barColor = widget.color ?? AimColors.primary;
    final reducedMotion = MediaQuery.of(context).disableAnimations;

    return SizedBox(
      height: widget.height,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: List.generate(widget.barCount, (index) {
          return Padding(
            padding: EdgeInsets.symmetric(horizontal: AimSpacing.xs / 2),
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                final fraction = widget.active && !reducedMotion
                    ? 0.3 +
                        0.7 *
                            sin((_controller.value * 2 * pi) +
                                (index * pi / widget.barCount))
                                .abs()
                    : (widget.active ? 0.5 : 0.15);

                return Container(
                  width: 4,
                  height: widget.height * fraction,
                  decoration: BoxDecoration(
                    color: barColor.withOpacity(widget.active ? 1.0 : 0.4),
                    borderRadius: BorderRadius.circular(2),
                  ),
                );
              },
            ),
          );
        }),
      ),
    );
  }
}
