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
// Push-to-talk conversation flow: every AI reply (the opening greeting and
// every subsequent turn) plays automatically the instant it's ready — no
// tap required for that half of the turn. For the student's half, there is
// no automatic voice-activity detection anymore — the student presses and
// holds the mic to record, and releasing it stops and submits immediately
// (see VoicePushToTalkButton). This is a deliberate UX choice over the
// previous hands-free auto-listen loop: the student controls exactly when
// their turn starts and ends instead of the app guessing from amplitude.
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
import '../widgets/voice_push_to_talk_button.dart';
import '../widgets/voice_record_button.dart';
import '../widgets/voice_teacher_avatar.dart';
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

  bool _stoppingTurn = false;
  bool _greetingHandled = false;

  /// The call view (avatar, status text, push-to-talk button) is the
  /// default surface — the transcript is opt-in via a button, not shown
  /// automatically every time the student re-enters an in-progress session.
  bool _showTranscript = false;

  void _toggleTranscript() => setState(() => _showTranscript = !_showTranscript);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _start());
  }

  @override
  void dispose() {
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
  /// automatically (no tap). Once it finishes, the student is prompted to
  /// press-and-hold the mic themselves — no auto-listening.
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
  }

  // ── Recording (push-to-talk: press starts, release stops+submits) ─────

  // P21-018: barge-in. Pressing the mic while AI audio is still playing is
  // allowed — stop local playback immediately before starting to record.
  // The backend already accepts overlapping submissions for the same
  // session with no in-flight lock (P21-014), so no extra backend call is
  // needed beyond the existing submit flow.
  void _onPressStart() {
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
  }

  void _onPressEnd() {
    unawaited(_onStopRecording());
  }

  Future<void> _onStopRecording() async {
    if (_stoppingTurn) return;
    // Only a real in-progress recording can be stopped — a stray
    // onTapCancel/onTapUp with nothing recording (e.g. the button was
    // disabled mid-gesture) should no-op rather than submit empty audio.
    if (ref.read(voiceRecordSubmitProvider).state != RecordSubmitState.recording) {
      return;
    }
    _stoppingTurn = true;

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

      // Auto-play the AI's reply. The student presses-and-holds the mic
      // themselves for their next turn — no auto-listening afterward.
      final latest = ref.read(voiceTeacherSessionProvider);
      final replyAudioRef = latest is AppAsyncSuccess<VoiceTeacherSessionState>
          ? latest.data.lastTurn?.audioRef
          : null;
      if (replyAudioRef != null) {
        unawaited(_onPlayReply(replyAudioRef));
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
                showTranscript: _showTranscript,
                onToggleTranscript: _toggleTranscript,
                onPressStart: _onPressStart,
                onPressEnd: _onPressEnd,
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
    required this.showTranscript,
    required this.onToggleTranscript,
    required this.onPressStart,
    required this.onPressEnd,
    required this.onPlayReply,
    required this.onFeedback,
    required this.onRetry,
  });

  final VoiceTeacherSessionState sessionState;
  final VoiceRecordSubmitNotifier recordState;
  final VoicePlaybackNotifier playbackState;
  final bool greetingHandled;

  /// The call view (avatar, status text, push-to-talk button) is the
  /// default surface every time this session is opened — the transcript is
  /// opt-in via [onToggleTranscript], not shown automatically.
  final bool showTranscript;
  final VoidCallback onToggleTranscript;
  final VoidCallback onPressStart;
  final VoidCallback onPressEnd;
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

    final mood = showGreetingSpeaking || isPlaying
        ? VoiceAvatarMood.speaking
        : isSubmitting
            ? VoiceAvatarMood.processing
            : isRecording
                ? VoiceAvatarMood.recording
                : VoiceAvatarMood.listening;

    if (showTranscript) {
      final surfaces = aimSurfacesOf(context);
      return Column(
        children: [
          // Shorter gradient header bar for visual continuity with the call
          // view, instead of a jarring gradient→plain-white cut.
          SizedBox(
            width: double.infinity,
            height: AimSpacing.space32,
            child: DecoratedBox(
              decoration: const BoxDecoration(gradient: AimGradients.gzHero),
              child: Align(
                alignment: AlignmentDirectional.centerEnd,
                child: Padding(
                  padding: const EdgeInsetsDirectional.only(end: AimSpacing.space8),
                  child: _VoiceTranscriptToggleButton(
                    label: 'Back to call',
                    icon: Icons.mic_none_rounded,
                    onTap: onToggleTranscript,
                  ),
                ),
              ),
            ),
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
                      onStartRecording: onPressStart,
                      onStopRecording: onPressEnd,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    }

    // Default surface every time the session is (re)opened: the avatar call
    // view, never the transcript list — the student opts into seeing the
    // message history via the button below instead.
    return _VoiceAvatarStage(
      mood: mood,
      recording: isRecording,
      processing: isSubmitting,
      onPressStart: onPressStart,
      onPressEnd: onPressEnd,
      onViewMessages: sessionState.history.isEmpty ? null : onToggleTranscript,
      errorOrFallback: isError
          ? VoiceErrorState(
              errorType: VoiceErrorType.microphoneError,
              onRetry: () => onRetry(),
            )
          : hasFallback
              ? VoiceTextFallback(
                  fallbackText: lastTurn.text,
                  originalAudioError: 'audio_unavailable',
                )
              : null,
    );
  }
}

/// Full-page avatar call view: the illustrated AI-teacher avatar reacts to
/// [mood] (speaking/listening/recording/processing), with a status pill,
/// heading, the push-to-talk mic button, and static subtitle beneath.
/// Matches the "full page with a character that changes state" reference
/// the redesign was requested against, using an abstract brand-gradient
/// avatar (VoiceTeacherAvatar) instead of a stock photo.
class _VoiceAvatarStage extends StatelessWidget {
  const _VoiceAvatarStage({
    required this.mood,
    required this.recording,
    required this.processing,
    required this.onPressStart,
    required this.onPressEnd,
    this.onViewMessages,
    this.errorOrFallback,
  });

  final VoiceAvatarMood mood;
  final bool recording;
  final bool processing;
  final VoidCallback onPressStart;
  final VoidCallback onPressEnd;

  /// Null when there's no history yet to view (nothing to show). Non-null
  /// once at least one turn exists — tapping it reveals the transcript,
  /// which is opt-in rather than shown automatically every time this
  /// session is (re)opened.
  final VoidCallback? onViewMessages;

  /// The microphone-error or TTS-fallback strip, when present — surfaced
  /// here too so it's visible without needing to open the transcript.
  final Widget? errorOrFallback;

  @override
  Widget build(BuildContext context) {
    final (label, heading) = switch (mood) {
      VoiceAvatarMood.speaking => ('Speaking', 'Your teacher is speaking…'),
      VoiceAvatarMood.recording => ('Recording', 'Listening to you…'),
      VoiceAvatarMood.processing => ('Processing', 'Processing your answer…'),
      VoiceAvatarMood.listening => ('Ready', 'Your turn — press and hold to speak'),
    };

    // The mic is only for the student's turn — disabled while the AI is
    // speaking or a submitted turn is still processing, so a stray press
    // can't barge in mid-sentence or double-submit while a turn is in
    // flight (barge-in remains possible by design once the AI is actually
    // mid-speech and the student wants to interrupt — see onPressStart).
    final micEnabled = mood != VoiceAvatarMood.processing;

    return Stack(
      children: [
        Center(
          child: SingleChildScrollView(
            padding: const EdgeInsetsDirectional.symmetric(
              horizontal: AimSpacing.screenPaddingMobile,
              vertical: AimSpacing.componentGap,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _VoiceStatusPill(label: label),
                const SizedBox(height: AimSpacing.componentGap),
                VoiceTeacherAvatar(mood: mood, size: 144),
                const SizedBox(height: AimSpacing.componentGap),
                Text(
                  heading,
                  style: AimTextStyles.h2.copyWith(color: AimColors.neutral0),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AimSpacing.componentGap),
                VoicePushToTalkButton(
                  recording: recording,
                  processing: !micEnabled,
                  onPressStart: onPressStart,
                  onPressEnd: onPressEnd,
                ),
                const SizedBox(height: AimSpacing.componentGap),
                if (errorOrFallback != null)
                  errorOrFallback!
                else
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
        ),
        if (onViewMessages != null)
          PositionedDirectional(
            bottom: AimSpacing.screenPaddingMobile,
            end: AimSpacing.screenPaddingMobile,
            child: _VoiceTranscriptToggleButton(
              label: 'Messages',
              icon: Icons.chat_bubble_outline_rounded,
              onTap: onViewMessages!,
            ),
          ),
      ],
    );
  }
}

/// Translucent-white pill button used to move between the hands-free call
/// view and the text transcript — shown over the gradient hero in the call
/// view ("Messages") and over the shorter gradient bar in the transcript
/// view ("Back to call").
class _VoiceTranscriptToggleButton extends StatelessWidget {
  const _VoiceTranscriptToggleButton({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      child: InkWell(
        onTap: onTap,
        borderRadius: AimRadius.borderPill,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: AimColors.neutral0.withValues(alpha: 0.18),
            border: Border.all(color: AimColors.neutral0.withValues(alpha: 0.3)),
            borderRadius: AimRadius.borderPill,
          ),
          child: Padding(
            padding: const EdgeInsetsDirectional.symmetric(
              horizontal: AimSpacing.space12,
              vertical: AimSpacing.space8,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: AimSizes.iconSm, color: AimColors.neutral0),
                const SizedBox(width: AimSpacing.space4),
                Text(
                  label,
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
