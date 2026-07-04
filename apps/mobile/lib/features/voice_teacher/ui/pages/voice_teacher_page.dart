// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Voice"
//   docs/design/ui-for-all-system-mobile/screenshots/light/36-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/36-screen.png
// Endpoints: POST /voice-teacher/sessions
//   GET /voice-teacher/sessions/:id/audio
// Widgets: bespoke transparent header (see _VoiceTeacherHeader — AIMTopAppBar
//   has no foreground-color override, so it can't render a white title/back
//   icon over the gradient; same bespoke-when-shared-doesn't-fit precedent
//   used elsewhere, e.g. register_page.dart's gradient header), bespoke
//   status pill (see _VoiceHeroIdle — AIMBadge's neutral tone resolves its
//   background/dot from theme colors with no override, only its own child
//   text style is overridable, so a translucent-white pill is built
//   directly here instead), VoiceRecordButton, VoiceTranscriptList,
//   VoiceWaveformIndicator, VoiceErrorState, VoiceTextFallback
//
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
// Bugfix: microphone capture is wired to a real recorder plugin (the
// `record` package) — see _startRecordingAsync/_onStopRecording below. Audio
// is captured as WAV (audio/wav is in the backend's ALLOWED_AUDIO_TYPES
// allow-list, voice-audio-submit.controller.ts), read into memory, and the
// temp file is deleted immediately after. Permission is requested via the
// recorder's own hasPermission(); denial drives the existing microphone
// error state (VoiceErrorState) rather than failing silently.
//
// Hands-free conversation flow: every AI reply (the opening greeting and
// every subsequent turn) plays automatically the instant it's ready — no
// tap required. Once the AI finishes speaking, the mic starts listening
// automatically too: recording begins right away, a simple amplitude-based
// voice-activity check detects when the student starts talking, and once
// they go quiet again for a short pause, the turn is stopped and submitted
// automatically. The manual record button stays available the whole time
// as a fallback/override — tap it to stop early, or to (re)start manually
// if auto-listening didn't kick in for some reason.
import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_teacher_session_state.dart';
import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_playback_notifier.dart';
import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_record_submit_notifier.dart';
import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_teacher_provider.dart';
import 'package:aim_mobile/features/voice_teacher/logic/voice_recorder_client.dart';
import '../widgets/voice_error_state.dart';
import '../widgets/voice_record_button.dart';
import '../widgets/voice_text_fallback.dart';
import '../widgets/voice_transcript_list.dart';
import '../widgets/voice_waveform_indicator.dart';

class VoiceTeacherPage extends ConsumerStatefulWidget {
  const VoiceTeacherPage({required this.contextRef, this.recorder, super.key});

  final String contextRef;

  /// Injectable for widget tests, which have no real platform channel to
  /// back the `record` package's `AudioRecorder` (its own constructor
  /// already calls into one) — production always uses
  /// [RealVoiceRecorderClient] when this is left null.
  final VoiceRecorderClient? recorder;

  @override
  ConsumerState<VoiceTeacherPage> createState() => _VoiceTeacherPageState();
}

class _VoiceTeacherPageState extends ConsumerState<VoiceTeacherPage> {
  late final VoiceRecorderClient _audioRecorder =
      widget.recorder ?? RealVoiceRecorderClient();

  // ── Voice-activity detection (hands-free auto-record) ─────────────────
  //
  // Heuristic thresholds — dBFS amplitude (very negative = silence, closer
  // to 0 = louder). These are a starting point, not calibrated against real
  // devices/environments; they may need tuning once tested for real.
  static const _speechOnsetDb = -35.0;
  static const _silenceDb = -42.0;
  static const _silenceDuration = Duration(milliseconds: 1400);
  static const _maxListenDuration = Duration(seconds: 25);

  StreamSubscription<double>? _amplitudeSub;
  Timer? _silenceTimer;
  Timer? _maxListenTimer;
  bool _voiceDetected = false;
  bool _stoppingTurn = false;
  bool _greetingHandled = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _start());
  }

  @override
  void dispose() {
    _teardownVoiceActivityDetection();
    _audioRecorder.dispose();
    super.dispose();
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

    _handleInitialGreeting();
  }

  /// The session starts with exactly one message — the auto-generated
  /// greeting — before the student has said anything. Play it
  /// automatically (no tap), then start listening automatically once it
  /// finishes. If this is a resumed conversation (more than just the
  /// greeting already present), skip straight to listening.
  void _handleInitialGreeting() {
    if (!mounted) return;
    final state = ref.read(voiceTeacherSessionProvider);
    if (state is! AppAsyncSuccess<VoiceTeacherSessionState>) return;

    final history = state.data.history;
    if (history.length == 1 && history.first.isGreeting) {
      final greeting = history.first;
      if (greeting.audioRef != null) {
        unawaited(_onPlayReply(greeting.audioRef!, onFinished: _onGreetingFinished));
        return;
      }
    }
    _onGreetingFinished();
  }

  void _onGreetingFinished() {
    if (!mounted) return;
    if (!_greetingHandled) {
      setState(() => _greetingHandled = true);
    }
    unawaited(_beginHandsFreeListening());
  }

  // ── Recording (manual tap and hands-free auto-start share this) ───────

  // P21-018: barge-in. The record button stays tappable while AI audio is
  // playing (VoiceRecordButton only disables during `processing`), so a tap
  // here can arrive mid-playback. Stop local playback immediately before
  // starting to record — the backend already accepts overlapping
  // submissions for the same session with no in-flight lock (P21-014), so
  // no extra backend call is needed beyond the existing submit flow.
  //
  // VoiceRecordButton's onStartRecording slot is a plain VoidCallback, so
  // the real (async) permission-check-then-start work runs fire-and-forget
  // via _startRecordingAsync — the UI only flips to the "recording" state
  // once the native recorder has actually started successfully (see below).
  void _onStartRecording() {
    unawaited(_startRecordingAsync());
  }

  Future<void> _startRecordingAsync() async {
    final playback = ref.read(voicePlaybackProvider);
    if (playback.state == PlaybackState.playing ||
        playback.state == PlaybackState.loading) {
      playback.stop();
    }

    final recordNotifier = ref.read(voiceRecordSubmitProvider);
    if (recordNotifier.state == RecordSubmitState.recording ||
        recordNotifier.state == RecordSubmitState.submitting) {
      return;
    }

    final hasPermission = await _audioRecorder.hasPermission();
    if (!hasPermission) {
      recordNotifier.reportError(
        'Microphone permission was denied. Please allow microphone access '
        'to speak with the AI teacher.',
      );
      return;
    }

    final tempPath =
        '${Directory.systemTemp.path}/voice_turn_${DateTime.now().microsecondsSinceEpoch}.wav';

    try {
      await _audioRecorder.start(tempPath);
    } catch (error) {
      recordNotifier.reportError('Could not start recording: $error');
      return;
    }

    // Only flip the UI to "recording" once the native recorder has actually
    // started — never optimistically, or a start() failure above would
    // leave the button showing "recording" with nothing actually happening.
    recordNotifier.startRecording();
    _armVoiceActivityDetection();
  }

  /// Starts listening for the student's next turn without requiring a tap —
  /// called once the AI's current reply finishes speaking. No-ops if
  /// already recording/submitting (avoids double-starts if triggered twice
  /// in quick succession).
  Future<void> _beginHandsFreeListening() async {
    if (!mounted) return;
    await _startRecordingAsync();
  }

  void _armVoiceActivityDetection() {
    _teardownVoiceActivityDetection();
    _voiceDetected = false;

    _amplitudeSub = _audioRecorder
        .onAmplitudeChanged(const Duration(milliseconds: 200))
        .listen(_onAmplitudeSample);

    // Safety net: if nobody ever speaks, don't record forever — discard and
    // start listening again instead of submitting silence or hanging.
    _maxListenTimer = Timer(_maxListenDuration, () {
      if (!_voiceDetected) {
        _cancelListeningAndRestart();
      }
    });
  }

  void _onAmplitudeSample(double db) {
    if (!_voiceDetected) {
      if (db > _speechOnsetDb) {
        _voiceDetected = true;
        _maxListenTimer?.cancel();
        _maxListenTimer = null;
      }
      return;
    }

    if (db <= _silenceDb) {
      _silenceTimer ??= Timer(_silenceDuration, () {
        unawaited(_onStopRecording());
      });
    } else {
      _silenceTimer?.cancel();
      _silenceTimer = null;
    }
  }

  void _cancelListeningAndRestart() {
    _teardownVoiceActivityDetection();
    unawaited(_audioRecorder.stop());
    ref.read(voiceRecordSubmitProvider).cancelRecording();
    unawaited(_beginHandsFreeListening());
  }

  void _teardownVoiceActivityDetection() {
    unawaited(_amplitudeSub?.cancel());
    _amplitudeSub = null;
    _silenceTimer?.cancel();
    _silenceTimer = null;
    _maxListenTimer?.cancel();
    _maxListenTimer = null;
  }

  Future<void> _onStopRecording() async {
    if (_stoppingTurn) return;
    _stoppingTurn = true;
    _teardownVoiceActivityDetection();

    try {
      final recordNotifier = ref.read(voiceRecordSubmitProvider);

      Uint8List audioBytes = Uint8List(0);
      const mimeType = 'audio/wav';

      try {
        final path = await _audioRecorder.stop();
        if (path != null) {
          final file = File(path);
          if (await file.exists()) {
            audioBytes = await file.readAsBytes();
            unawaited(file.delete());
          }
        }
      } catch (error) {
        recordNotifier.reportError('Could not read recorded audio: $error');
        return;
      }

      if (audioBytes.isEmpty) {
        recordNotifier.reportError(
          'No audio was recorded. Please try again.',
        );
        return;
      }

      recordNotifier.stopRecording(audioBytes, mimeType: mimeType);

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

      // Auto-play the AI's reply, then automatically start listening again
      // for the student's next turn once it finishes — no taps anywhere in
      // this loop. If there's no audio (TTS failed), just start listening
      // right away instead of waiting on nothing.
      final latest = ref.read(voiceTeacherSessionProvider);
      final replyAudioRef = latest is AppAsyncSuccess<VoiceTeacherSessionState>
          ? latest.data.lastTurn?.audioRef
          : null;
      if (replyAudioRef != null) {
        unawaited(_onPlayReply(replyAudioRef, onFinished: () {
          unawaited(_beginHandsFreeListening());
        }));
      } else {
        unawaited(_beginHandsFreeListening());
      }
    } finally {
      _stoppingTurn = false;
    }
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

  Future<void> _onPlayReply(String audioRef, {VoidCallback? onFinished}) async {
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
          onFinished: onFinished,
        );
  }

  @override
  Widget build(BuildContext context) {
    final sessionState = ref.watch(voiceTeacherSessionProvider);
    final recordState = ref.watch(voiceRecordSubmitProvider);
    final playbackState = ref.watch(voicePlaybackProvider);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: const _VoiceTeacherHeader(),
      body: DecoratedBox(
        decoration: const BoxDecoration(gradient: AimGradients.gzHero),
        child: SafeArea(
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
                greetingHandled: _greetingHandled,
                onStartRecording: _onStartRecording,
                onStopRecording: _onStopRecording,
                onPlayReply: _onPlayReply,
                onFeedback: _onFeedback,
                onRetry: _onStopRecording,
              ),
          },
        ),
      ),
    );
  }
}

/// Transparent header rendered over the gradient background.
///
/// `AIMTopAppBar(transparent: true)` only makes the bar's own background/
/// border transparent — its title and back-icon colors are hard-wired to
/// `surfaces.textPrimary`/theme defaults with no override, so over this
/// screen's purple-to-blue gradient it renders a near-black title and a
/// mid-grey back chevron in light mode (wrong in both light and dark per
/// the design screenshots, which show a white title and a white chevron in
/// a translucent circle). Since `AIMTopAppBar` is a shared widget with no
/// foreground-override escape hatch, this is a small bespoke header instead
/// (mirrors register_page.dart's gradient-header/back-button pattern).
class _VoiceTeacherHeader extends StatelessWidget
    implements PreferredSizeWidget {
  const _VoiceTeacherHeader();

  @override
  Size get preferredSize => const Size.fromHeight(AimSizes.topBarHeight);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: SizedBox(
        height: AimSizes.topBarHeight,
        child: Padding(
          padding: const EdgeInsetsDirectional.symmetric(
            horizontal: AimSpacing.space8,
          ),
          child: Row(
            children: [
              Semantics(
                button: true,
                label: 'Back',
                child: InkWell(
                  onTap: () => context.pop(),
                  customBorder: const CircleBorder(),
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: AimColors.neutral0.withValues(alpha: 0.18),
                      shape: BoxShape.circle,
                    ),
                    child: Padding(
                      padding: EdgeInsets.all(AimSpacing.space12),
                      child: Icon(
                        Directionality.of(context) == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                        size: AimSizes.iconMd,
                        color: AimColors.neutral0,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: AimSpacing.componentGap),
              Expanded(
                child: Text(
                  'Voice Teacher',
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                  style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _VoiceTutorContent extends StatelessWidget {
  const _VoiceTutorContent({
    required this.sessionState,
    required this.recordState,
    required this.playbackState,
    required this.greetingHandled,
    required this.onStartRecording,
    required this.onStopRecording,
    required this.onPlayReply,
    required this.onFeedback,
    required this.onRetry,
  });

  final VoiceTeacherSessionState sessionState;
  final VoiceRecordSubmitNotifier recordState;
  final VoicePlaybackNotifier playbackState;
  final bool greetingHandled;
  final VoidCallback onStartRecording;
  final Future<void> Function() onStopRecording;
  final Future<void> Function(String audioRef, {VoidCallback? onFinished}) onPlayReply;
  final void Function(String messageId, String rating, String? comment)
      onFeedback;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    final isRecording = recordState.state == RecordSubmitState.recording;
    final isSubmitting = recordState.state == RecordSubmitState.submitting;
    final isError = recordState.state == RecordSubmitState.error;
    final isPlaying = playbackState.state == PlaybackState.playing ||
        playbackState.state == PlaybackState.loading;
    final lastTurn = sessionState.lastTurn;
    final hasFallback = lastTurn != null && lastTurn.isFallback;

    final recordButtonState = isSubmitting
        ? VoiceRecordState.processing
        : isRecording
            ? VoiceRecordState.recording
            : VoiceRecordState.idle;

    // The session starts with exactly one message — the auto-generated
    // greeting — before the student has said anything. It plays
    // automatically (VoiceTeacherPage._handleInitialGreeting), so this is a
    // passive "your teacher is speaking" state, not a tap target.
    final showGreetingSpeaking = !greetingHandled &&
        sessionState.history.length == 1 &&
        sessionState.history.first.isGreeting;

    if (showGreetingSpeaking) {
      return const _VoiceHeroGreetingSpeaking();
    }

    // Pre-conversation hero: no history yet and nothing currently in
    // progress (recording/processing/erroring/fallback) — matches the
    // design screenshot's full-bleed gradient treatment. In the normal
    // hands-free flow this is only ever visible for a brief instant before
    // auto-listening kicks in; the manual record button remains a fallback.
    final showHero = sessionState.history.isEmpty &&
        !isRecording &&
        !isSubmitting &&
        !isError &&
        !hasFallback;

    if (showHero) {
      return _VoiceHeroIdle(
        recordButtonState: recordButtonState,
        onStartRecording: onStartRecording,
        onStopRecording: () => onStopRecording(),
      );
    }

    final surfaces = aimSurfacesOf(context);

    return Column(
      children: [
        // Shorter gradient header bar for visual continuity with the hero
        // state, instead of a jarring gradient→plain-white cut once a
        // conversation starts.
        Container(
          width: double.infinity,
          height: AimSpacing.space32,
          decoration: const BoxDecoration(gradient: AimGradients.gzHero),
        ),
        Expanded(
          child: DecoratedBox(
            decoration: BoxDecoration(color: surfaces.background),
            child: Column(
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
                      if (isError)
                        VoiceErrorState(
                          errorType: VoiceErrorType.microphoneError,
                          onRetry: () => onRetry(),
                        )
                      else if (hasFallback)
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
                    state: recordButtonState,
                    onStartRecording: onStartRecording,
                    onStopRecording: () => onStopRecording(),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

/// Passive "your teacher is speaking" hero shown while the auto-played
/// opening greeting is playing — no tap target, since playback and the
/// hands-free listening that follows it are both fully automatic.
class _VoiceHeroGreetingSpeaking extends StatelessWidget {
  const _VoiceHeroGreetingSpeaking();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsetsDirectional.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const _VoiceStatusPill(label: 'Speaking'),
            const SizedBox(height: AimSpacing.sectionGap),
            Text(
              'Your teacher is speaking…',
              style: AimTextStyles.h2.copyWith(color: AimColors.neutral0),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.sectionGap),
            const VoiceWaveformIndicator(active: true),
          ],
        ),
      ),
    );
  }
}

/// Pre-conversation idle hero — full-bleed gradient background, status
/// pill, heading, centered record button, and static subtitle. Matches
/// `docs/design/ui-for-all-system-mobile/screenshots/{light,dark}/36-screen.png`.
/// Only ever briefly visible in the normal hands-free flow (before
/// auto-listening kicks in) — the record button remains a manual fallback.
///
/// The "Tap anywhere to change state" hint visible in the mockup is a
/// Figma/prototyping-tool artifact for whoever is clicking through the
/// prototype's other states — it is intentionally omitted here.
class _VoiceHeroIdle extends StatelessWidget {
  const _VoiceHeroIdle({
    required this.recordButtonState,
    required this.onStartRecording,
    required this.onStopRecording,
  });

  final VoiceRecordState recordButtonState;
  final VoidCallback onStartRecording;
  final VoidCallback onStopRecording;

  @override
  Widget build(BuildContext context) {
    final (label, heading) = switch (recordButtonState) {
      VoiceRecordState.recording => ('Listening', 'Listening...'),
      VoiceRecordState.processing => ('Processing', 'Processing...'),
      VoiceRecordState.idle => ('Ready', 'Tap to speak'),
    };

    return Center(
      child: Padding(
        padding: const EdgeInsetsDirectional.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _VoiceStatusPill(label: label),
            const SizedBox(height: AimSpacing.sectionGap),
            Text(
              heading,
              style: AimTextStyles.h2.copyWith(color: AimColors.neutral0),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.sectionGap),
            VoiceRecordButton(
              state: recordButtonState,
              onStartRecording: onStartRecording,
              onStopRecording: onStopRecording,
            ),
            const SizedBox(height: AimSpacing.sectionGap),
            Text(
              'Practise your pronunciation with the AI teacher',
              style: AimTextStyles.bodySm.copyWith(
                color: AimColors.neutral0.withValues(alpha: 0.85),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

/// Translucent-white status pill ("READY"/"RECORDING"/"PROCESSING") shown
/// over the gradient hero.
///
/// `AIMBadge` resolves its background and status-dot color from `tone` with
/// no override — only the text style of its `child` can be overridden by
/// the caller — so a neutral/soft `AIMBadge` with a white-text override
/// still renders its default near-white background and grey dot in light
/// mode (both driven by theme colors, not the text style), which is
/// low-contrast against a white label and doesn't match the translucent
/// all-white pill in the design screenshots. This bespoke pill overrides
/// background, border, and dot together instead.
class _VoiceStatusPill extends StatelessWidget {
  const _VoiceStatusPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Status: $label',
      child: ExcludeSemantics(
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: AimColors.neutral0.withValues(alpha: 0.18),
            border: Border.all(
              color: AimColors.neutral0.withValues(alpha: 0.3),
            ),
            borderRadius: AimRadius.borderPill,
          ),
          child: Padding(
            padding: const EdgeInsetsDirectional.symmetric(
              horizontal: AimSpacing.space12,
              vertical: AimSpacing.space4,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox.square(
                  dimension: 6,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: AimColors.neutral0,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                const SizedBox(width: AimSpacing.space4),
                Text(
                  label.toUpperCase(),
                  style: AimTextStyles.caption.copyWith(
                    color: AimColors.neutral0,
                    fontWeight: AimFontWeights.semibold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
