// VoicePushToTalkButton — press-and-hold-to-record mic button.
//
// Deliberately built on raw GestureDetector onTapDown/onTapUp/onTapCancel
// rather than onLongPress* — long-press recognition has a ~500ms delay
// before it fires, which would make a quick "press, say one word, release"
// turn feel laggy/unresponsive. Tap-down/up has zero recognition delay:
// press starts recording immediately, lifting the finger stops and submits
// immediately, matching a walkie-talkie / WhatsApp-voice-note feel.
//
// This intentionally replaces the previous tap-to-toggle record button for
// the main call screen — the student now holds to talk instead of tapping
// once to start and again to stop.

import 'dart:async';

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/design_tokens/design_tokens.dart';

class VoicePushToTalkButton extends StatefulWidget {
  const VoicePushToTalkButton({
    required this.recording,
    required this.processing,
    required this.onPressStart,
    required this.onPressEnd,
    super.key,
  });

  final bool recording;
  final bool processing;
  final VoidCallback onPressStart;
  final VoidCallback onPressEnd;

  @override
  State<VoicePushToTalkButton> createState() => _VoicePushToTalkButtonState();
}

class _VoicePushToTalkButtonState extends State<VoicePushToTalkButton>
    with SingleTickerProviderStateMixin {
  // Created eagerly in initState (not a lazy `late final` field initializer)
  // — if the button is disposed before ever entering the `recording` state,
  // a lazy initializer would construct the AnimationController for the
  // first time inside dispose(), which crashes: creating a ticker needs to
  // look up TickerMode from the widget tree, and by the time dispose() runs
  // the element has already been deactivated.
  late final AnimationController _pulseController;

  Timer? _elapsedTimer;
  int _elapsedSeconds = 0;

  static const _size = 88.0;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
  }

  @override
  void didUpdateWidget(VoicePushToTalkButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.recording && !oldWidget.recording) {
      _elapsedSeconds = 0;
      _elapsedTimer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (mounted) setState(() => _elapsedSeconds++);
      });
      if (!MediaQuery.of(context).disableAnimations) _pulseController.repeat();
    } else if (!widget.recording && oldWidget.recording) {
      _elapsedTimer?.cancel();
      _elapsedTimer = null;
      _pulseController.stop();
      _pulseController.reset();
    }
  }

  @override
  void dispose() {
    _elapsedTimer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  String _formatDuration(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '$m:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final isEnabled = !widget.processing;
    final caption = widget.processing
        ? 'Processing...'
        : widget.recording
            ? _formatDuration(_elapsedSeconds)
            : 'Press and hold to speak';

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Semantics(
          button: true,
          enabled: isEnabled,
          toggled: widget.recording,
          label: widget.recording ? 'Recording — release to send' : 'Press and hold to speak',
          child: GestureDetector(
            onTapDown: isEnabled ? (_) => widget.onPressStart() : null,
            onTapUp: isEnabled ? (_) => widget.onPressEnd() : null,
            onTapCancel: isEnabled ? widget.onPressEnd : null,
            child: SizedBox(
              width: _size * 1.5,
              height: _size * 1.5,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  if (widget.recording)
                    AnimatedBuilder(
                      animation: _pulseController,
                      builder: (context, _) {
                        final t = _pulseController.value;
                        return Container(
                          width: _size * (1.0 + t * 0.5),
                          height: _size * (1.0 + t * 0.5),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: AimColors.error500.withValues(alpha: 0.5 * (1 - t)),
                              width: 2,
                            ),
                          ),
                        );
                      },
                    ),
                  AnimatedContainer(
                    duration: AimMotion.durationFast,
                    curve: AimMotion.easeStandard,
                    width: widget.recording ? _size * 1.1 : _size,
                    height: widget.recording ? _size * 1.1 : _size,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isEnabled
                          ? (widget.recording ? AimColors.error500 : AimColors.neutral0)
                          : AimColors.neutral0.withValues(alpha: 0.4),
                      boxShadow: [
                        BoxShadow(
                          color: (widget.recording ? AimColors.error500 : AimColors.neutral900)
                              .withValues(alpha: 0.3),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    alignment: Alignment.center,
                    child: AnimatedSwitcher(
                      duration: AimMotion.durationFast,
                      child: widget.processing
                          ? const SizedBox(
                              key: ValueKey('processing'),
                              width: 28,
                              height: 28,
                              child: CircularProgressIndicator(
                                strokeWidth: 3,
                                color: AimColors.primary600,
                              ),
                            )
                          : Icon(
                              Icons.mic_rounded,
                              key: const ValueKey('mic'),
                              color: widget.recording
                                  ? AimColors.neutral0
                                  : AimColors.primary600,
                              size: 34,
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: AimSpacing.space8),
        AnimatedDefaultTextStyle(
          duration: AimMotion.durationFast,
          style: AimTextStyles.caption.copyWith(
            color: AimColors.neutral0,
            fontWeight: widget.recording ? AimFontWeights.bold : AimFontWeights.medium,
            fontFeatures: const [FontFeature.tabularFigures()],
          ),
          child: Text(caption, textAlign: TextAlign.center),
        ),
      ],
    );
  }
}
