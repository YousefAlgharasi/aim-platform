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
// Pre-conversation (no history yet, not recording/processing/erroring) shows
// a full-bleed gradient hero with a status pill, "Tap to speak" heading, the
// centered record button, and a static subtitle — matching the design
// screenshot. Once real history exists, or while an error/fallback is
// showing, the screen keeps the functional transcript-list layout (a
// full-bleed gradient behind a scrolling chat history would not read well),
// with just a shorter gradient header bar for visual continuity.
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
// Bugfix: microphone capture is now wired to a real recorder plugin (the
// `record` package) — see _startRecordingAsync/_onStopRecording below. Audio
// is captured as WAV (audio/wav is in the backend's ALLOWED_AUDIO_TYPES
// allow-list, voice-audio-submit.controller.ts), read into memory, and the
// temp file is deleted immediately after. Permission is requested via the
// recorder's own hasPermission(); denial drives the existing microphone
// error state (VoiceErrorState) rather than failing silently.

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
  }

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

  Future<void> _onStopRecording() async {
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

class _VoiceTutorContent extends StatefulWidget {
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
  State<_VoiceTutorContent> createState() => _VoiceTutorContentState();
}

class _VoiceTutorContentState extends State<_VoiceTutorContent> {
  // P21-017: the opening greeting (P21-008/P21-009) is ready to play the
  // instant this screen loads — per the agreed "ready immediately, plays
  // on first tap" behavior (never true autoplay, to avoid OS/browser
  // autoplay-with-sound restrictions and not starting audio without any
  // user gesture). Tracks whether the student has already dismissed/heard
  // it, so the ready state only ever shows once per session.
  bool _greetingDismissed = false;

  void _onPlayGreeting(String audioRef) {
    setState(() => _greetingDismissed = true);
    widget.onPlayReply(audioRef);
  }

  void _onSkipGreeting() {
    setState(() => _greetingDismissed = true);
  }

  @override
  Widget build(BuildContext context) {
    final sessionState = widget.sessionState;
    final recordState = widget.recordState;
    final playbackState = widget.playbackState;
    final onStartRecording = widget.onStartRecording;
    final onStopRecording = widget.onStopRecording;
    final onPlayReply = widget.onPlayReply;
    final onFeedback = widget.onFeedback;
    final onRetry = widget.onRetry;

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

    // P21-017: the session starts with exactly one message — the
    // auto-generated greeting (P21-008) — before the student has said
    // anything. Offer a "ready to hear your teacher" state instead of
    // silently dropping straight into the transcript view with no audio
    // ever played, which is what happened before this fix (the greeting
    // text rendered, but nothing ever surfaced its audio).
    final unplayedGreeting = !_greetingDismissed &&
            sessionState.history.length == 1 &&
            sessionState.history.first.isGreeting
        ? sessionState.history.first
        : null;

    if (unplayedGreeting != null) {
      return _VoiceHeroGreetingReady(
        hasAudio: unplayedGreeting.hasAudio,
        onPlay: () => _onPlayGreeting(unplayedGreeting.audioRef!),
        onSkip: _onSkipGreeting,
      );
    }

    // Pre-conversation hero: no history yet and nothing currently in
    // progress (recording/processing/erroring/fallback) — matches the
    // design screenshot's full-bleed gradient "Tap to speak" treatment.
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

/// P21-017: shown once, the instant a new voice session loads, when the
/// auto-generated opening greeting (P21-008) hasn't been heard yet. Mirrors
/// `_VoiceHeroIdle`'s full-bleed gradient treatment so the transition
/// between the two feels like one continuous hero rather than a jump cut.
///
/// "Ready immediately, plays on first tap" — never true autoplay (avoids
/// OS/browser autoplay-with-sound restrictions and starting audio without
/// a user gesture). If eager TTS synthesis failed for this greeting
/// (`hasAudio == false`), there's nothing to play — go straight to the
/// normal record flow instead of showing a play button with nothing behind
/// it.
class _VoiceHeroGreetingReady extends StatelessWidget {
  const _VoiceHeroGreetingReady({
    required this.hasAudio,
    required this.onPlay,
    required this.onSkip,
  });

  final bool hasAudio;
  final VoidCallback onPlay;
  final VoidCallback onSkip;

  @override
  Widget build(BuildContext context) {
    if (!hasAudio) {
      // Nothing to play (TTS synthesis failed or is still pending) — the
      // greeting's text already rendered via the transcript once we fall
      // through, so just dismiss straight into the normal record flow
      // rather than showing a dead play button.
      WidgetsBinding.instance.addPostFrameCallback((_) => onSkip());
      return const AIMFullScreenLoading(
        semanticLabel: 'Starting Voice Teacher session',
      );
    }

    return Center(
      child: Padding(
        padding: const EdgeInsetsDirectional.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const _VoiceStatusPill(label: 'Ready'),
            const SizedBox(height: AimSpacing.sectionGap),
            Text(
              'Tap to hear your teacher',
              style: AimTextStyles.h2.copyWith(color: AimColors.neutral0),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.sectionGap),
            Semantics(
              button: true,
              label: 'Play greeting',
              child: InkWell(
                onTap: onPlay,
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(AimSpacing.space24),
                    child: Icon(
                      Icons.play_arrow_rounded,
                      size: AimSizes.iconLg,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
            TextButton(
              onPressed: onSkip,
              child: Text(
                'Skip',
                style: AimTextStyles.bodySm.copyWith(
                  color: AimColors.neutral0.withValues(alpha: 0.85),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Pre-conversation idle hero — full-bleed gradient background, status
/// pill, heading, centered record button, and static subtitle. Matches
/// `docs/design/ui-for-all-system-mobile/screenshots/{light,dark}/36-screen.png`.
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
      VoiceRecordState.recording => ('Recording', 'Listening...'),
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
