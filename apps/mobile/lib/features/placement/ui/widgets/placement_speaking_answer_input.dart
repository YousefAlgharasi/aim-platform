import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/features/voice_teacher/data/datasources/voice_recorder_client_impl.dart';
import 'package:aim_mobile/features/voice_teacher/logic/voice_recorder_client.dart';

const Duration kPlacementSpeakingMaxDuration = Duration(minutes: 1);

/// Speaking question recorder UI matching Figma Screenshot 2.
/// Supports "Press & Hold to Record" pattern (press down to record, release to stop).
class PlacementSpeakingAnswerInput extends StatefulWidget {
  const PlacementSpeakingAnswerInput({
    super.key,
    required this.prompt,
    required this.isSubmitting,
    required this.onRecordingComplete,
    required this.onSelect,
    this.recorder,
  });

  final String prompt;
  final bool isSubmitting;
  final void Function(List<int> audioBytes, String mimeType) onRecordingComplete;
  final ValueChanged<String> onSelect;
  final VoiceRecorderClient? recorder;

  @override
  State<PlacementSpeakingAnswerInput> createState() =>
      _PlacementSpeakingAnswerInputState();
}

class _PlacementSpeakingAnswerInputState
    extends State<PlacementSpeakingAnswerInput>
    with SingleTickerProviderStateMixin {
  late final VoiceRecorderClient _recorder =
      widget.recorder ?? RealVoiceRecorderClient();
  late final AnimationController _pulseCtrl;

  bool _isRecording = false;
  bool _hasRecorded = false;
  bool _recorderStarted = false;
  int _elapsedSeconds = 0;
  Timer? _ticker;
  String? _error;
  Future<void>? _startFuture;

  // Standard WAV header bytes for web & mock audio recording payload
  static const List<int> _dummyWavBytes = [
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
    0x57, 0x41, 0x56, 0x45, 0x66, 0x6D, 0x74, 0x20,
    0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
    0x44, 0xAC, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00,
    0x02, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61,
    0x00, 0x00, 0x00, 0x00,
  ];

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _pulseCtrl.dispose();
    _recorder.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    if (_isRecording || widget.isSubmitting) return;

    setState(() {
      _error = null;
      _isRecording = true;
      _elapsedSeconds = 0;
    });

    _pulseCtrl.repeat();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() => _elapsedSeconds++);
        if (_elapsedSeconds >= kPlacementSpeakingMaxDuration.inSeconds) {
          _stopRecording();
        }
      }
    });

    if (!kIsWeb) {
      // Recorder init (permission check, path resolution, native start) is
      // async, but the mic button fires start/stop from raw pointer down/up
      // events with no minimum hold time. Without tracking this future,
      // a quick tap can call recorder.stop() before recorder.start() has
      // actually begun capturing, producing a near-empty audio file that
      // the STT provider rejects as "too short". _stopRecording awaits
      // this future before stopping so start always completes first.
      _startFuture = () async {
        try {
          final hasPermission = await _recorder.hasPermission();
          if (hasPermission) {
            final dir = await getTemporaryDirectory();
            final path = '${dir.path}/speaking_answer.wav';
            await _recorder.start(path);
            _recorderStarted = true;
          }
        } catch (_) {
          // Fallback simulation when platform recorder is unsupported
        }
      }();
      await _startFuture;
    }
  }

  Future<void> _stopRecording() async {
    if (!_isRecording) return;

    // Never stop before start has actually reached the native recorder —
    // otherwise recorder.stop() either no-ops or captures ~0 audio.
    await _startFuture;

    _ticker?.cancel();
    _pulseCtrl.stop();
    _pulseCtrl.reset();

    setState(() {
      _isRecording = false;
      _hasRecorded = true;
    });

    List<int> bytes = _dummyWavBytes;

    if (!kIsWeb && _recorderStarted) {
      _recorderStarted = false;
      try {
        final path = await _recorder.stop();
        if (path != null) {
          final file = File(path);
          if (await file.exists()) {
            bytes = await file.readAsBytes();
          }
        }
      } catch (_) {
        bytes = _dummyWavBytes;
      }
    }

    widget.onSelect('recorded_audio_answer');
    widget.onRecordingComplete(bytes, 'audio/wav');
  }

  String _formatTimer(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s / 01:00';
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const SizedBox(height: AimSpacing.space24),

        // ── Pulsing Mic Button (Fixed 140x140 Bounds for Layout Stability) ──
        SizedBox(
          width: 140,
          height: 140,
          child: Center(
            child: Listener(
              onPointerDown: (_) => _startRecording(),
              onPointerUp: (_) => _stopRecording(),
              onPointerCancel: (_) => _stopRecording(),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  if (_isRecording) ...[
                    _PulseCircle(controller: _pulseCtrl, delay: 0.0, size: 130),
                    _PulseCircle(controller: _pulseCtrl, delay: 0.5, size: 130),
                  ],
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _isRecording ? AimColors.error500 : AimColors.primary500,
                      boxShadow: [
                        BoxShadow(
                          color: (_isRecording ? AimColors.error500 : AimColors.primary500)
                              .withValues(alpha: 0.3),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Icon(
                      _isRecording ? Icons.mic : Icons.mic_none_rounded,
                      color: AimColors.neutral0,
                      size: 40,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: AimSpacing.space16),

        // ── Fixed Height Text Box (Prevents Layout Shifting) ────────────────
        SizedBox(
          height: 60,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_isRecording) ...[
                Text(
                  'Recording in progress...',
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                    fontWeight: AimFontWeights.medium,
                  ),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  _formatTimer(_elapsedSeconds),
                  style: AimTextStyles.label.copyWith(
                    color: AimColors.primary500,
                    fontWeight: AimFontWeights.semibold,
                    fontFeatures: const [FontFeature.tabularFigures()],
                  ),
                ),
              ] else if (_hasRecorded) ...[
                Text(
                  'Recording completed!',
                  style: AimTextStyles.bodySm.copyWith(
                    color: AimColors.success500,
                    fontWeight: AimFontWeights.semibold,
                  ),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  'Tap Submit below to submit your recording.',
                  style: AimTextStyles.caption.copyWith(
                    color: surfaces.textMuted,
                  ),
                ),
              ] else ...[
                Text(
                  'Press & hold the mic to record',
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                    fontWeight: AimFontWeights.medium,
                  ),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  'Release when finished',
                  style: AimTextStyles.caption.copyWith(
                    color: surfaces.textMuted,
                  ),
                ),
              ],
            ],
          ),
        ),

        if (_error != null) ...[
          const SizedBox(height: AimSpacing.space12),
          Text(
            _error!,
            style: AimTextStyles.caption.copyWith(
              color: AimColors.error500,
            ),
          ),
        ],
      ],
    );
  }
}

class _PulseCircle extends AnimatedWidget {
  const _PulseCircle({
    required AnimationController controller,
    required this.delay,
    required this.size,
  }) : super(listenable: controller);

  final double delay;
  final double size;

  @override
  Widget build(BuildContext context) {
    final animation = listenable as AnimationController;
    final t = ((animation.value - delay) % 1.0).clamp(0.0, 1.0);
    final scale = 1.0 + t * 0.45;
    final opacity = (0.5 * (1 - t)).clamp(0.0, 1.0);

    return IgnorePointer(
      child: Container(
        width: size * scale,
        height: size * scale,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: AimColors.primary500.withValues(alpha: opacity),
            width: 2.5,
          ),
        ),
      ),
    );
  }
}
