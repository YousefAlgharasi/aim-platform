import 'package:flutter/material.dart';

import '../../design_tokens/design_tokens.dart';
import '../../theme/theme.dart';

/// Speaking-practice record button.
///
/// Pulses while [recording]; switches from a microphone icon to a stop icon.
/// Provide [caption] to show a timer string (e.g. `"0:12"`) during recording.
/// Respects the OS reduced-motion accessibility setting — the pulse animation
/// is skipped when the user has opted in to reduced motion.
///
/// ```dart
/// AIMRecordButton(
///   recording: _isRecording,
///   onToggle: _handleToggle,
///   caption: _isRecording ? '0:12' : null,
/// )
/// ```
class AIMRecordButton extends StatefulWidget {
  const AIMRecordButton({
    super.key,
    this.recording = false,
    this.caption,
    this.disabled = false,
    this.onToggle,
  });

  /// Whether recording is active. The button pulses and shows a stop icon.
  final bool recording;

  /// Caption under the button. Defaults to `'Tap to speak'` / `'Tap to stop'`.
  final String? caption;

  /// Disables the button when true.
  final bool disabled;

  /// Called when the button is tapped (start/stop toggle).
  final VoidCallback? onToggle;

  @override
  State<AIMRecordButton> createState() => _AIMRecordButtonState();
}

class _AIMRecordButtonState extends State<AIMRecordButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  bool _reduceMotion = false;

  static const _btnSize = 72.0;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    );
    _syncPulse();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final newReduce = MediaQuery.of(context).disableAnimations;
    if (newReduce != _reduceMotion) {
      _reduceMotion = newReduce;
      _syncPulse();
    }
  }

  @override
  void didUpdateWidget(AIMRecordButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.recording != widget.recording) {
      _syncPulse();
    }
  }

  void _syncPulse() {
    if (widget.recording && !_reduceMotion) {
      if (!_pulseController.isAnimating) {
        _pulseController.repeat();
      }
    } else {
      _pulseController.stop();
      _pulseController.reset();
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final gradients = aimGradientsOf(context);
    final shadows = aimShadowsOf(context);
    final surfaces = aimSurfacesOf(context);

    final isEnabled = !widget.disabled;
    final isRecording = widget.recording;

    final caption = widget.caption ??
        (isRecording ? 'Tap to stop' : 'Tap to speak');

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Semantics(
          button: true,
          enabled: isEnabled,
          toggled: isRecording,
          label: isRecording ? 'Stop recording' : 'Start recording',
          child: SizedBox(
            width: _btnSize,
            height: _btnSize,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Pulse rings (recording only, reduced-motion respects off)
                if (isRecording && !_reduceMotion) ...[
                  _PulseRing(
                    controller: _pulseController,
                    delay: 0,
                    buttonSize: _btnSize,
                    color: AimColors.error500,
                  ),
                  _PulseRing(
                    controller: _pulseController,
                    delay: 0.5,
                    buttonSize: _btnSize,
                    color: AimColors.error500,
                  ),
                ],
                // Button
                GestureDetector(
                  onTap: isEnabled ? widget.onToggle : null,
                  child: AnimatedContainer(
                    duration: AimMotion.durationFast,
                    curve: AimMotion.easeStandard,
                    width: _btnSize,
                    height: _btnSize,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: isEnabled && !isRecording
                          ? gradients.ai
                          : null,
                      color: isEnabled
                          ? (isRecording ? AimColors.error500 : null)
                          : surfaces.disabledBg,
                      boxShadow: isEnabled
                          ? (isRecording
                              ? [
                                  const BoxShadow(
                                    color: Color(0x4DE5484D),
                                    blurRadius: 10,
                                    offset: Offset(0, 4),
                                  ),
                                ]
                              : shadows.fab)
                          : null,
                    ),
                    alignment: Alignment.center,
                    child: AnimatedSwitcher(
                      duration: AimMotion.durationFast,
                      child: isRecording
                          ? Icon(
                              Icons.stop_rounded,
                              key: const ValueKey('stop'),
                              color: isEnabled
                                  ? AimColors.neutral0
                                  : surfaces.disabledFg,
                              size: 30,
                            )
                          : Icon(
                              Icons.mic,
                              key: const ValueKey('mic'),
                              color: isEnabled
                                  ? AimColors.neutral0
                                  : surfaces.disabledFg,
                              size: 30,
                            ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: AimSpacing.space8),
        AnimatedDefaultTextStyle(
          duration: AimMotion.durationFast,
          style: AimTextStyles.caption.copyWith(
            color: isRecording ? AimColors.error600 : surfaces.textSecondary,
            fontWeight: isRecording
                ? AimFontWeights.semibold
                : AimFontWeights.medium,
            fontFeatures: const [FontFeature.tabularFigures()],
          ),
          child: Text(caption),
        ),
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Animated pulse ring
// ---------------------------------------------------------------------------

class _PulseRing extends AnimatedWidget {
  const _PulseRing({
    required AnimationController controller,
    required this.delay,
    required this.buttonSize,
    required this.color,
  }) : super(listenable: controller);

  final double delay;
  final double buttonSize;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final animation = listenable as AnimationController;
    final t = ((animation.value - delay) % 1.0).clamp(0.0, 1.0);

    // Scale: 1 → 1.7; Opacity: 0.6 → 0
    final scale = 1.0 + t * 0.7;
    final opacity = (0.6 * (1 - t)).clamp(0.0, 1.0);

    return IgnorePointer(
      child: Container(
        width: buttonSize * scale,
        height: buttonSize * scale,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: color.withValues(alpha: opacity), width: 2),
        ),
      ),
    );
  }
}
