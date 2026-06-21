import 'dart:async';

import 'package:flutter/material.dart';
import 'package:aim_mobile/core/widgets/learning/aim_record_button.dart';

enum VoiceRecordState { idle, recording, processing }

class VoiceRecordButton extends StatefulWidget {
  final VoiceRecordState state;
  final VoidCallback? onStartRecording;
  final VoidCallback? onStopRecording;

  const VoiceRecordButton({
    super.key,
    required this.state,
    this.onStartRecording,
    this.onStopRecording,
  });

  @override
  State<VoiceRecordButton> createState() => _VoiceRecordButtonState();
}

class _VoiceRecordButtonState extends State<VoiceRecordButton> {
  Timer? _timer;
  int _elapsedSeconds = 0;

  @override
  void didUpdateWidget(VoiceRecordButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.state == VoiceRecordState.recording &&
        oldWidget.state != VoiceRecordState.recording) {
      _startTimer();
    } else if (widget.state != VoiceRecordState.recording) {
      _stopTimer();
    }
  }

  void _startTimer() {
    _elapsedSeconds = 0;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _elapsedSeconds++);
    });
  }

  void _stopTimer() {
    _timer?.cancel();
    _timer = null;
    _elapsedSeconds = 0;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _formatDuration(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '$m:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;
    final isRecording = widget.state == VoiceRecordState.recording;
    final isProcessing = widget.state == VoiceRecordState.processing;

    String? caption;
    if (isRecording) {
      caption = _formatDuration(_elapsedSeconds);
    } else if (isProcessing) {
      caption = isRtl ? 'جارٍ المعالجة...' : 'Processing...';
    }

    return AIMRecordButton(
      recording: isRecording,
      disabled: isProcessing,
      caption: caption,
      onToggle: isProcessing
          ? null
          : () {
              if (isRecording) {
                widget.onStopRecording?.call();
              } else {
                widget.onStartRecording?.call();
              }
            },
    );
  }
}
