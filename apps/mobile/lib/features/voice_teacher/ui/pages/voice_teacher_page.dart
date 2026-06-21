// Phase 18 — P18-065 / P18-066
// VoiceTeacherPage — main Voice Tutor screen.
//
// Renders the start/listen/speaking/error states for a voice turn using the
// AIM design system, backed by [voiceTeacherSessionProvider] (session +
// history), [voiceRecordSubmitProvider] (record → submit turn) and
// [voicePlaybackProvider] (AI Teacher audio playback).
//
// Security rules:
// - studentId is never supplied by this screen; the backend always resolves
//   it from the verified JWT (see voice-session-start.controller.ts).
// - This screen never calls an STT/TTS/AI provider directly and never
//   computes mastery/level/weakness/difficulty/recommendation/review-schedule
//   values. It only renders backend responses surfaced via
//   [VoiceTeacherSessionNotifier] and [VoiceRecordSubmitNotifier].
// - Bearer token is read from authFlowProvider on demand; never stored here.
//
// Known gap (deferred, mirrors the AI Teacher TTS wiring gap): actual
// microphone capture is not wired to a recorder plugin yet. The state
// machine, network submission, and transcript rendering are real; only the
// raw audio byte source is a placeholder until a recorder dependency is
// added.

import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_teacher_session_state.dart';
import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_playback_notifier.dart';
import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_record_submit_notifier.dart';
import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_teacher_provider.dart';
import '../widgets/voice_error_state.dart';
import '../widgets/voice_record_button.dart';
import '../widgets/voice_text_fallback.dart';
import '../widgets/voice_transcript_list.dart';
import '../widgets/voice_waveform_indicator.dart';

class VoiceTeacherPage extends ConsumerStatefulWidget {
  const VoiceTeacherPage({required this.contextRef, super.key});

  final String contextRef;

  @override
  ConsumerState<VoiceTeacherPage> createState() => _VoiceTeacherPageState();
}

class _VoiceTeacherPageState extends ConsumerState<VoiceTeacherPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _start());
  }

  String? get _token => ref.read(authFlowProvider).accessToken;

  Future<void> _start() async {
    final token = _token;
    if (token == null || token.isEmpty) return;

    final notifier = ref.read(voiceTeacherSessionProvider.notifier);
    await notifier.startSession(
      bearerToken: token,
      contextRef: widget.contextRef,
    );

    final state = ref.read(voiceTeacherSessionProvider);
    if (state is AppAsyncSuccess<VoiceTeacherSessionState>) {
      final sessionId = state.data.sessionId;
      if (sessionId != null) {
        await notifier.loadHistory(bearerToken: token, sessionId: sessionId);
      }
    }
  }

  void _onStartRecording() {
    ref.read(voiceRecordSubmitProvider).startRecording();
  }

  Future<void> _onStopRecording() async {
    final recordNotifier = ref.read(voiceRecordSubmitProvider);
    // Placeholder audio payload until a recorder plugin supplies real bytes
    // (deferred gap — see file header).
    recordNotifier.stopRecording(Uint8List(0), mimeType: 'audio/webm');

    final token = _token;
    final sessionState = ref.read(voiceTeacherSessionProvider);
    if (token == null ||
        token.isEmpty ||
        sessionState is! AppAsyncSuccess<VoiceTeacherSessionState>) {
      return;
    }
    final sessionId = sessionState.data.sessionId;
    if (sessionId == null) return;

    final sessionNotifier = ref.read(voiceTeacherSessionProvider.notifier);
    await recordNotifier.submitToBackend(
      sessionId: sessionId,
      submitFn: (turnSessionId, audio, mimeType) async {
        await sessionNotifier.submitTurn(
          bearerToken: token,
          sessionId: turnSessionId,
          audioBytes: audio,
          mimeType: mimeType,
        );
        final updated = ref.read(voiceTeacherSessionProvider);
        final turn = updated is AppAsyncSuccess<VoiceTeacherSessionState>
            ? updated.data.lastTurn
            : null;
        return (
          transcript: '',
          aiResponseText: turn?.text ?? '',
          audioRef: turn?.audioRef,
          fallbackText: turn?.isFallback == true ? turn?.text : null,
        );
      },
    );
  }

  Future<void> _onFeedback(
    String messageId,
    String rating,
    String? comment,
  ) async {
    final token = _token;
    final sessionState = ref.read(voiceTeacherSessionProvider);
    if (token == null ||
        token.isEmpty ||
        sessionState is! AppAsyncSuccess<VoiceTeacherSessionState>) {
      return;
    }
    final sessionId = sessionState.data.sessionId;
    if (sessionId == null) return;

    await ref.read(voiceTeacherSessionProvider.notifier).submitFeedback(
          bearerToken: token,
          sessionId: sessionId,
          messageId: messageId,
          rating: rating,
          comment: comment,
        );
  }

  Future<void> _onPlayReply(String audioRef) async {
    final token = _token;
    if (token == null || token.isEmpty) return;
    await ref.read(voicePlaybackProvider).loadAndPlay(
          audioRef: audioRef,
          fetchAudioFn: (targetAudioRef) async {
            final bytes = await ref
                .read(voiceTeacherRepositoryProvider)
                .getAudioPlayback(
                  bearerToken: token,
                  audioRef: targetAudioRef,
                );
            return Uint8List.fromList(bytes);
          },
        );
  }

  @override
  Widget build(BuildContext context) {
    final sessionState = ref.watch(voiceTeacherSessionProvider);
    final recordState = ref.watch(voiceRecordSubmitProvider);
    final playbackState = ref.watch(voicePlaybackProvider);

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'Voice Teacher'),
      body: SafeArea(
        child: switch (sessionState) {
          AppAsyncLoading() => const AIMFullScreenLoading(
              semanticLabel: 'Starting Voice Teacher session',
            ),
          AppAsyncIdle() => const AIMFullScreenLoading(
              semanticLabel: 'Starting Voice Teacher session',
            ),
          AppAsyncFailure() => VoiceErrorState(
              errorType: VoiceErrorType.serverError,
              onRetry: _start,
            ),
          AppAsyncSuccess(:final data) => _VoiceTutorContent(
              sessionState: data,
              recordState: recordState,
              playbackState: playbackState,
              onStartRecording: _onStartRecording,
              onStopRecording: _onStopRecording,
              onPlayReply: _onPlayReply,
              onFeedback: _onFeedback,
              onRetry: _onStopRecording,
            ),
        },
      ),
    );
  }
}

class _VoiceTutorContent extends StatelessWidget {
  const _VoiceTutorContent({
    required this.sessionState,
    required this.recordState,
    required this.playbackState,
    required this.onStartRecording,
    required this.onStopRecording,
    required this.onPlayReply,
    required this.onFeedback,
    required this.onRetry,
  });

  final VoiceTeacherSessionState sessionState;
  final VoiceRecordSubmitNotifier recordState;
  final VoicePlaybackNotifier playbackState;
  final VoidCallback onStartRecording;
  final Future<void> Function() onStopRecording;
  final Future<void> Function(String audioRef) onPlayReply;
  final void Function(String messageId, String rating, String? comment)
      onFeedback;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    final isRecording = recordState.state == RecordSubmitState.recording;
    final isSubmitting = recordState.state == RecordSubmitState.submitting;
    final isPlaying = playbackState.state == PlaybackState.playing ||
        playbackState.state == PlaybackState.loading;
    final lastTurn = sessionState.lastTurn;

    return Column(
      children: [
        Expanded(
          child: VoiceTranscriptList(
            messages: sessionState.history,
            onPlayAudio: (audioRef) => onPlayReply(audioRef),
            onFeedback: onFeedback,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.screenPaddingMobile,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              VoiceWaveformIndicator(active: isRecording || isPlaying),
              const SizedBox(height: AimSpacing.innerGap),
              if (recordState.state == RecordSubmitState.error)
                VoiceErrorState(
                  errorType: VoiceErrorType.microphoneError,
                  onRetry: () => onRetry(),
                )
              else if (lastTurn != null && lastTurn.isFallback)
                VoiceTextFallback(
                  fallbackText: lastTurn.text,
                  originalAudioError: 'audio_unavailable',
                ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
          child: VoiceRecordButton(
            state: isSubmitting
                ? VoiceRecordState.processing
                : isRecording
                    ? VoiceRecordState.recording
                    : VoiceRecordState.idle,
            onStartRecording: onStartRecording,
            onStopRecording: () => onStopRecording(),
          ),
        ),
      ],
    );
  }
}
