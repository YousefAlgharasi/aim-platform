// P4-052: PlacementSpeakingAnswerInput.
//
// Scope: Placement Test SPEAKING question recording UI only.
//
// Mirrors voice_teacher's recording pattern (VoiceRecorderClient +
// VoiceRecordButton — same widgets/interfaces, so this reuses their audio
// capture + button UI instead of reinventing it): mic permission check,
// start/stop via the `record` package, read the recorded WAV bytes, then
// hand them to the caller (PlacementQuestionPage._submitSpeakingAnswer),
// which uploads via PlacementRepository.submitSpeakingAnswer.
//
// A 3-minute countdown auto-stops the recording (matching "Talk about
// yourself for up to 3 minutes" style prompts) — students can also stop
// earlier by tapping the record button again.
//
// Security rules:
// - Flutter never transcribes or grades the recording — the backend does,
//   via the same STT/AI pipeline used for voice teacher.
// - Raw audio bytes are only ever sent to the backend endpoint.

import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/theme/theme.dart';
import 'package:aim_mobile/features/voice_teacher/logic/voice_recorder_client.dart';
import 'package:aim_mobile/features/voice_teacher/ui/widgets/voice_record_button.dart';

const Duration kPlacementSpeakingMaxDuration = Duration(minutes: 3);

class PlacementSpeakingAnswerInput extends StatefulWidget {
  const PlacementSpeakingAnswerInput({
    super.key,
    required this.prompt,
    required this.isSubmitting,
    required this.onRecordingComplete,
    this.recorder,
  });

  final String prompt;
  final bool isSubmitting;

  /// Called once the student stops (or the 3-minute cap is hit) with the
  /// recorded WAV bytes and its mime type.
  final void Function(List<int> audioBytes, String mimeType) onRecordingComplete;

  /// Injectable for widget tests; defaults to the real `record`-backed client.
  final VoiceRecorderClient? recorder;

  @override
  State<PlacementSpeakingAnswerInput> createState() => _PlacementSpeakingAnswerInputState();
}

class _PlacementSpeakingAnswerInputState extends State<PlacementSpeakingAnswerInput> {
  late final VoiceRecorderClient _recorder = widget.recorder ?? RealVoiceRecorderClient();
  VoiceRecordState _state = VoiceRecordState.idle;
  String? _error;
  Timer? _maxDurationTimer;
  bool _hasRecorded = false;

  @override
  void dispose() {
    _maxDurationTimer?.cancel();
    _recorder.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    setState(() => _error = null);

    final hasPermission = await _recorder.hasPermission();
    if (!hasPermission) {
      setState(() {
        _error = 'Microphone permission was denied. Please allow microphone '
            'access to record your answer.';
      });
      return;
    }

    final tempPath =
        '${Directory.systemTemp.path}/placement_speaking_${DateTime.now().microsecondsSinceEpoch}.wav';

    try {
      await _recorder.start(tempPath);
    } catch (error) {
      setState(() => _error = 'Could not start recording: $error');
      return;
    }

    setState(() => _state = VoiceRecordState.recording);
    _maxDurationTimer = Timer(kPlacementSpeakingMaxDuration, _stopRecording);
  }

  Future<void> _stopRecording() async {
    if (_state != VoiceRecordState.recording || _hasRecorded) return;
    _hasRecorded = true;
    _maxDurationTimer?.cancel();

    setState(() => _state = VoiceRecordState.processing);

    try {
      final path = await _recorder.stop();
      List<int> audioBytes = const [];

      if (path != null) {
        final file = File(path);
        if (await file.exists()) {
          audioBytes = await file.readAsBytes();
          unawaited(file.delete());
        }
      }

      if (audioBytes.isEmpty) {
        setState(() {
          _error = 'No audio was recorded. Please try again.';
          _state = VoiceRecordState.idle;
          _hasRecorded = false;
        });
        return;
      }

      widget.onRecordingComplete(audioBytes, 'audio/wav');
    } catch (error) {
      setState(() {
        _error = 'Could not read recorded audio: $error';
        _state = VoiceRecordState.idle;
        _hasRecorded = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          padding: const EdgeInsets.all(AimSpacing.componentGap),
          decoration: BoxDecoration(
            color: surfaces.surface,
            borderRadius: AimRadius.borderMd,
          ),
          child: Text(
            widget.prompt,
            style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary),
          ),
        ),
        const SizedBox(height: AimSpacing.sectionGap),
        Center(
          child: VoiceRecordButton(
            state: _state,
            onStartRecording: widget.isSubmitting ? null : _startRecording,
            onStopRecording: widget.isSubmitting ? null : _stopRecording,
          ),
        ),
        const SizedBox(height: AimSpacing.componentGap),
        Text(
          'You can record up to 3 minutes. Tap the mic to start, tap again to stop.',
          textAlign: TextAlign.center,
          style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
        ),
        if (_error != null) ...[
          const SizedBox(height: AimSpacing.componentGap),
          Text(
            _error!,
            textAlign: TextAlign.center,
            style: AimTextStyles.bodySm.copyWith(color: AimColors.error500),
          ),
        ],
      ],
    );
  }
}
