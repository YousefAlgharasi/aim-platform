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
// Live conversation flow: the microphone stays open (LiveVoiceController). It hears when the student starts and stops
// talking, sends each finished sentence on its own, and the AI's reply plays the instant it is ready. The student can
// talk over the teacher to interrupt, mute the mic with one tap, or type instead — typed and spoken turns share one
// conversation. Audio is captured as 16 kHz PCM and sent as WAV (audio/wav is in the backend's ALLOWED_AUDIO_TYPES
// allow-list, voice-audio-submit.controller.ts); nothing is written to disk.
import 'package:aim_mobile/features/practice_topics/ui/practice_session_bar.dart';
import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_message.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_teacher_session_state.dart';
import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_playback_notifier.dart';
import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_record_submit_notifier.dart';
import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_teacher_provider.dart';
import 'package:aim_mobile/features/voice_teacher/data/datasources/live_voice_client_impl.dart';
import 'package:aim_mobile/features/voice_teacher/logic/live_voice_client.dart';
import 'package:aim_mobile/features/voice_teacher/logic/live_voice_controller.dart';
import '../widgets/aim_robot.dart';
import '../widgets/live_dock.dart';
import '../widgets/voice_error_state.dart';
import '../widgets/voice_teacher_avatar.dart';
import '../widgets/voice_text_fallback.dart';
import '../widgets/voice_transcript_list.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class VoiceTeacherPage extends ConsumerStatefulWidget {
  const VoiceTeacherPage({required this.contextRef, this.liveClient, this.practice, super.key});

  final String contextRef;

  /// Set when opened from Practice Speaking: shows the timer + Finish (XP) bar under the call view.
  final PracticeSessionInfo? practice;

  /// Injectable for widget tests, which have no real platform channel to
  /// back the `record` package's `AudioRecorder` (its own constructor
  /// already calls into one) — production always uses
  /// [RealLiveVoiceClient] when this is left null.
  final LiveVoiceClient? liveClient;

  @override
  ConsumerState<VoiceTeacherPage> createState() => _VoiceTeacherPageState();
}

class _VoiceTeacherPageState extends ConsumerState<VoiceTeacherPage> {
  late final LiveVoiceController _live = LiveVoiceController(
    client: widget.liveClient ?? RealLiveVoiceClient(),
    onUtterance: (wav, durationMs) => unawaited(_onUtterance(wav)),
    onBargeIn: _onBargeIn,
    isAiSpeaking: _aiIsSpeaking,
  );

  bool _stoppingTurn = false;
  bool _greetingHandled = false;

  // Live-lesson controls: the teacher's voice can be muted (replies stay on screen), and the student can type instead
  // of talking. Typed and spoken turns share one conversation.
  bool _muted = false;
  bool _sendingText = false;
  final TextEditingController _draft = TextEditingController();

  /// The call view (avatar, status text, caption and the text/mic bar) is the
  /// default surface — the transcript is opt-in via a button, not shown
  /// automatically every time the student re-enters an in-progress session.
  bool _showTranscript = false;

  void _toggleTranscript() => setState(() => _showTranscript = !_showTranscript);

  @override
  void initState() {
    super.initState();
    _live.addListener(_onLiveChanged);
    WidgetsBinding.instance.addPostFrameCallback((_) => _start());
  }

  @override
  void dispose() {
    _draft.dispose();
    _live
      ..removeListener(_onLiveChanged)
      ..dispose();
    super.dispose();
  }

  String? get _token => ref.read(authFlowProvider).accessToken;

  void _onLiveChanged() {
    if (mounted) setState(() {});
  }

  bool _aiIsSpeaking() {
    final playback = ref.read(voicePlaybackProvider);
    return playback.state == PlaybackState.playing ||
        playback.state == PlaybackState.loading;
  }

  /// The student started talking over the teacher: stop the teacher's audio right away.
  void _onBargeIn() => ref.read(voicePlaybackProvider).stop();

  /// Retry after a microphone problem (or a failed spoken turn).
  Future<void> _retryMic() async {
    ref.read(voiceRecordSubmitProvider).reset();
    _live.setMuted(false);
    await _live.start();
  }

  /// Turns the live mic on, or mutes / unmutes it (the conversation itself is hands-free).
  void _toggleMic() {
    final status = _live.status;
    if (status == LiveStatus.off || status == LiveStatus.denied || status == LiveStatus.error) {
      ref.read(voiceRecordSubmitProvider).reset();
      _live.setMuted(false);
      unawaited(_live.start());
      return;
    }
    _live.setMuted(!_live.muted);
  }

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
    // The student chose to start the live lesson, so the microphone opens now (the teacher can be interrupted).
    unawaited(_live.start());
  }

  /// The session starts with exactly one message — the auto-generated
  /// greeting — before the student has said anything. Play it
  /// automatically (no tap). The live mic is already listening, so the student
  /// can answer by simply talking (or interrupt the greeting by talking over it).
  void _handleInitialGreeting() {
    if (!mounted) return;
    final state = ref.read(voiceTeacherSessionProvider);
    if (state is! AppAsyncSuccess<VoiceTeacherSessionState>) return;

    final history = state.data.history;
    if (history.length == 1 && history.first.isGreeting) {
      final greeting = history.first;
      if (greeting.audioRef != null && !_muted) {
        unawaited(_onPlayReply(
          greeting.audioRef!,
          fallbackText: greeting.text,
          onFinished: _onGreetingFinished,
        ));
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

  // ── A spoken turn (the live mic found the end of a sentence) ──────────

  /// One turn at a time: speech that arrives while the teacher is still answering is dropped.
  Future<void> _onUtterance(Uint8List audioBytes) async {
    if (_stoppingTurn || _sendingText || !mounted) return;
    final recordNotifier = ref.read(voiceRecordSubmitProvider);
    if (recordNotifier.state == RecordSubmitState.submitting) return;

    final token = _token;
    final sessionState = ref.read(voiceTeacherSessionProvider);
    if (token == null ||
        token.isEmpty ||
        sessionState is! AppAsyncSuccess<VoiceTeacherSessionState>) {
      return;
    }
    final sessionId = sessionState.data.sessionId;
    if (sessionId == null) return;
    _stoppingTurn = true;

    try {
      recordNotifier.startRecording();
      recordNotifier.stopRecording(audioBytes, mimeType: 'audio/wav');

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
      if (!mounted) return;

      // Auto-play the AI's reply. The mic is still open, so the student can simply answer.
      final latest = ref.read(voiceTeacherSessionProvider);
      final turn = latest is AppAsyncSuccess<VoiceTeacherSessionState>
          ? latest.data.lastTurn
          : null;
      final turnText = turn?.text;
      if (_muted) {
        // Muted: the reply is shown on screen only.
      } else if (turn?.audioRef != null) {
        unawaited(_onPlayReply(turn!.audioRef!, fallbackText: turnText));
      } else if (turnText != null && turnText.isNotEmpty) {
        unawaited(_onPlayText(turnText));
      }
    } finally {
      _stoppingTurn = false;
    }
  }

  void _toggleMute() {
    setState(() => _muted = !_muted);
    if (_muted) ref.read(voicePlaybackProvider).stop();
  }

  /// A typed turn. Same conversation as the voice turns: the teacher answers (and, unless muted, speaks) the same way.
  Future<void> _sendText(String raw) async {
    final message = raw.trim();
    if (message.isEmpty || _sendingText) return;
    final token = _token;
    final sessionState = ref.read(voiceTeacherSessionProvider);
    if (token == null ||
        token.isEmpty ||
        sessionState is! AppAsyncSuccess<VoiceTeacherSessionState>) {
      return;
    }
    final sessionId = sessionState.data.sessionId;
    if (sessionId == null) return;

    ref.read(voicePlaybackProvider).stop();
    setState(() => _sendingText = true);
    _draft.clear();
    final sent = await ref.read(voiceTeacherSessionProvider.notifier).submitTextTurn(
          bearerToken: token,
          sessionId: sessionId,
          message: message,
        );
    if (!mounted) return;
    setState(() => _sendingText = false);
    if (!sent) {
      _draft.text = message;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppLocalizations.of(context).voiceLiveSendFailed)),
      );
      return;
    }
    if (_muted) return;
    final latest = ref.read(voiceTeacherSessionProvider);
    if (latest is! AppAsyncSuccess<VoiceTeacherSessionState>) return;
    // A fallback reply is shown as text on screen; there is no audio for it.
    if (latest.data.lastTurn?.isFallback == true) return;
    VoiceMessage? lastTeacher;
    for (final m in latest.data.history.reversed) {
      if (m.role == VoiceMessageRole.teacher) {
        lastTeacher = m;
        break;
      }
    }
    if (lastTeacher != null) unawaited(_onPlayMessage(lastTeacher));
  }

  /// Plays a teacher message: its stored recording when it has one, otherwise the backend's lazily synthesised audio.
  Future<void> _onPlayMessage(VoiceMessage message) async {
    final audioRef = message.audioRef;
    if (audioRef != null) {
      await _onPlayReply(audioRef, fallbackText: message.text);
      return;
    }
    final token = _token;
    if (token == null || token.isEmpty) return;
    await ref.read(voicePlaybackProvider).loadAndPlay(
          audioRef: 'message:${message.id}',
          fallbackText: message.text,
          fetchAudioFn: (_) async {
            final bytes = await ref
                .read(voiceTeacherRepositoryProvider)
                .getMessageAudio(bearerToken: token, messageId: message.id);
            return Uint8List.fromList(bytes);
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

  Future<void> _onPlayReply(
    String audioRef, {
    String? fallbackText,
    VoidCallback? onFinished,
  }) async {
    final token = _token;
    if (token == null || token.isEmpty) {
      if (fallbackText != null && fallbackText.isNotEmpty) {
        await _onPlayText(fallbackText, onFinished: onFinished);
      }
      return;
    }
    await ref.read(voicePlaybackProvider).loadAndPlay(
          audioRef: audioRef,
          fallbackText: fallbackText,
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

  Future<void> _onPlayText(String text, {VoidCallback? onFinished}) async {
    if (text.trim().isEmpty) {
      onFinished?.call();
      return;
    }
    final encoded = Uri.encodeComponent(text.trim());
    final ttsUrl =
        'https://translate.google.com/translate_tts?ie=UTF-8&q=$encoded&tl=en&client=tw-ob';
    await ref.read(voicePlaybackProvider).loadAndPlayUrl(
          url: ttsUrl,
          onFinished: onFinished,
        );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final sessionState = ref.watch(voiceTeacherSessionProvider);
    final recordState = ref.watch(voiceRecordSubmitProvider);
    final playbackState = ref.watch(voicePlaybackProvider);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: const _VoiceTeacherHeader(),
      bottomNavigationBar:
          widget.practice == null ? null : PracticeSessionBar(practice: widget.practice!),
      body: DecoratedBox(
        decoration: const BoxDecoration(gradient: AimGradients.gzHero),
        child: SafeArea(
          child: switch (sessionState) {
            AppAsyncLoading() => AIMFullScreenLoading(
                semanticLabel: l10n.voiceTeacherStartingSession,
              ),
            AppAsyncIdle() => AIMFullScreenLoading(
                semanticLabel: l10n.voiceTeacherStartingSession,
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
                muted: _muted,
                sendingText: _sendingText,
                draft: _draft,
                onToggleMute: _toggleMute,
                onSendText: _sendText,
                showTranscript: _showTranscript,
                onToggleTranscript: _toggleTranscript,
                liveStatus: _live.status,
                liveMuted: _live.muted,
                onToggleMic: _toggleMic,
                onPlayReply: _onPlayReply,
                onFeedback: _onFeedback,
                onRetry: _retryMic,
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
    final l10n = AppLocalizations.of(context);
    final isRtl = Directionality.of(context) == TextDirection.rtl;

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
                label: l10n.voiceTeacherBackSemantic,
                child: InkWell(
                  onTap: () {
                  if (context.canPop()) {
                    context.pop();
                  } else {
                    context.go(AppRoutePaths.mainShell);
                  }
                },
                  customBorder: const CircleBorder(),
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: AimColors.neutral0.withValues(alpha: 0.18),
                      shape: BoxShape.circle,
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(AimSpacing.space12),
                      child: Icon(
                        isRtl
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
                  l10n.voiceTeacherTitle,
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
    required this.muted,
    required this.sendingText,
    required this.draft,
    required this.onToggleMute,
    required this.onSendText,
    required this.showTranscript,
    required this.onToggleTranscript,
    required this.liveStatus,
    required this.liveMuted,
    required this.onToggleMic,
    required this.onPlayReply,
    required this.onFeedback,
    required this.onRetry,
  });

  final VoiceTeacherSessionState sessionState;
  final VoiceRecordSubmitNotifier recordState;
  final VoicePlaybackNotifier playbackState;
  final bool greetingHandled;

  /// The teacher's voice is muted: replies are shown as text only.
  final bool muted;

  /// A typed message is being answered.
  final bool sendingText;
  final TextEditingController draft;
  final VoidCallback onToggleMute;
  final Future<void> Function(String message) onSendText;

  /// The call view (avatar, status text, push-to-talk button) is the
  /// default surface every time this session is opened — the transcript is
  /// opt-in via [onToggleTranscript], not shown automatically.
  final bool showTranscript;
  final VoidCallback onToggleTranscript;

  /// The live microphone: its status, whether it is muted, and the toggle (turn on / mute / unmute).
  final LiveStatus liveStatus;
  final bool liveMuted;
  final VoidCallback onToggleMic;
  final Future<void> Function(String audioRef, {VoidCallback? onFinished}) onPlayReply;
  final void Function(String messageId, String rating, String? comment)
      onFeedback;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    final isHearing = liveStatus == LiveStatus.hearing;
    final isRecording = recordState.state == RecordSubmitState.recording || isHearing;
    final isSubmitting = recordState.state == RecordSubmitState.submitting;
    final isError = recordState.state == RecordSubmitState.error ||
        liveStatus == LiveStatus.denied ||
        liveStatus == LiveStatus.error;
    final micMode = switch (liveStatus) {
      LiveStatus.listening || LiveStatus.hearing =>
        liveMuted ? MicMode.muted : (isHearing ? MicMode.hearing : MicMode.live),
      _ => MicMode.off,
    };
    final isPlaying = playbackState.state == PlaybackState.playing ||
        playbackState.state == PlaybackState.loading;
    final lastTurn = sessionState.lastTurn;
    final hasFallback = lastTurn != null && lastTurn.isFallback;

    // The session starts with exactly one message — the auto-generated
    // greeting — before the student has said anything. It plays
    // automatically (VoiceTeacherPage._handleInitialGreeting), so this is a
    // passive "your teacher is speaking" state, not a tap target.
    final showGreetingSpeaking = !greetingHandled &&
        sessionState.history.length == 1 &&
        sessionState.history.first.isGreeting;

    final processing = isSubmitting || sendingText;
    final mood = showGreetingSpeaking || isPlaying
        ? VoiceAvatarMood.speaking
        : processing
            ? VoiceAvatarMood.processing
            : isRecording
                ? VoiceAvatarMood.recording
                : VoiceAvatarMood.listening;

    final onlyGreeting =
        sessionState.history.length == 1 && sessionState.history.first.isGreeting;
    final l10n = AppLocalizations.of(context);

    // The robot says the teacher's latest message.
    VoiceMessage? latestTeacher;
    for (final m in sessionState.history.reversed) {
      if (m.role == VoiceMessageRole.teacher) {
        latestTeacher = m;
        break;
      }
    }
    final robotMood = switch (mood) {
      VoiceAvatarMood.speaking => RobotMood.speaking,
      VoiceAvatarMood.processing => RobotMood.thinking,
      VoiceAvatarMood.recording => RobotMood.listening,
      VoiceAvatarMood.listening => RobotMood.idle,
    };
    // The robot and its bubble say it on screen; this is the same status for screen readers.
    final (statusLabel, statusHeading) = switch (mood) {
      VoiceAvatarMood.speaking => (l10n.voiceTeacherStatusSpeaking, l10n.voiceTeacherHeadingSpeaking),
      VoiceAvatarMood.recording => (l10n.voiceTeacherStatusRecording, l10n.voiceTeacherHeadingRecording),
      VoiceAvatarMood.processing => (l10n.voiceTeacherStatusProcessing, l10n.voiceTeacherHeadingProcessing),
      VoiceAvatarMood.listening => (
          l10n.voiceTeacherStatusReady,
          switch (micMode) {
            MicMode.live || MicMode.hearing => l10n.voiceLiveHeadingListening,
            MicMode.muted => l10n.voiceLiveHeadingMuted,
            MicMode.off => l10n.voiceLiveHeadingOff,
          },
        ),
    };

    final notice = isError
        ? VoiceErrorState(
            errorType: VoiceErrorType.microphoneError,
            onRetry: () => onRetry(),
          )
        : hasFallback
            ? VoiceTextFallback(
                fallbackText: lastTurn.text,
                originalAudioError: 'audio_unavailable',
              )
            : null;

    return LayoutBuilder(
      builder: (context, box) {
        final sheetHeight = (box.maxHeight * 0.52).clamp(0.0, 480.0);
        return Column(
          children: [
            // Room above the robot: the notices and the one-tap "yes, let's start".
            Expanded(
              child: Semantics(
                container: true,
                liveRegion: true,
                label: '${l10n.voiceTeacherStatusSemantic(statusLabel)}. $statusHeading',
                child: SingleChildScrollView(
                  padding: const EdgeInsetsDirectional.symmetric(horizontal: AimSpacing.screenPaddingMobile, vertical: AimSpacing.space8),
                  reverse: true,
                  child: ConstrainedBox(
                    constraints: BoxConstraints(minHeight: box.maxHeight * 0.1),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (notice != null) notice,
                        if (onlyGreeting && !processing && !isRecording) ...[
                          const SizedBox(height: AimSpacing.componentGap),
                          FilledButton(
                            onPressed: () => onSendText(l10n.voiceLiveYesStartMessage),
                            style: FilledButton.styleFrom(
                              backgroundColor: AimColors.neutral0,
                              foregroundColor: AimColors.primary600,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                            ),
                            child: Text(
                              l10n.voiceLiveYesStart,
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
            LiveDock(
              controller: draft,
              muted: muted,
              busy: processing || isRecording,
              micMode: micMode,
              mood: robotMood,
              thoughtId: latestTeacher?.id,
              thoughtText: latestTeacher?.text,
              thoughtTyping: true,
              showThought: !showTranscript,
              messageCount: sessionState.history.length,
              messagesOpen: showTranscript,
              onToggleMessages: onToggleTranscript,
              onToggleMute: onToggleMute,
              onToggleMic: onToggleMic,
              onSend: onSendText,
            ),
            // The conversation slides up from the bottom; the robot and the text box rise with it.
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOutCubic,
              height: showTranscript ? sheetHeight : 0,
              clipBehavior: Clip.hardEdge,
              decoration: BoxDecoration(
                color: aimSurfacesOf(context).background,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              ),
              // The conversation is always laid out at its full height; the slide only reveals it.
              child: showTranscript
                  ? OverflowBox(
                      alignment: Alignment.topCenter,
                      minHeight: sheetHeight,
                      maxHeight: sheetHeight,
                      child: _ConversationSheet(
                        messages: sessionState.history,
                        onClose: onToggleTranscript,
                        onPlayAudio: (audioRef) => onPlayReply(audioRef),
                        onFeedback: onFeedback,
                      ),
                    )
                  : null,
            ),
          ],
        );
      },
    );
  }
}

/// The conversation, newest message at the bottom, scrolled to it.
class _ConversationSheet extends StatefulWidget {
  const _ConversationSheet({
    required this.messages,
    required this.onClose,
    required this.onPlayAudio,
    required this.onFeedback,
  });

  final List<VoiceMessage> messages;
  final VoidCallback onClose;
  final void Function(String audioRef) onPlayAudio;
  final void Function(String messageId, String rating, String? comment) onFeedback;

  @override
  State<_ConversationSheet> createState() => _ConversationSheetState();
}

class _ConversationSheetState extends State<_ConversationSheet> {
  final ScrollController _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    _toEnd();
  }

  @override
  void didUpdateWidget(_ConversationSheet old) {
    super.didUpdateWidget(old);
    if (old.messages.length != widget.messages.length) _toEnd();
  }

  void _toEnd() => WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scroll.hasClients) _scroll.jumpTo(_scroll.position.maxScrollExtent);
      });

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    return Column(
      children: [
        Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(AimSpacing.screenPaddingMobile, AimSpacing.space12, AimSpacing.space8, AimSpacing.space8),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  l10n.voiceLiveConversation,
                  style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
                ),
              ),
              IconButton(
                onPressed: widget.onClose,
                tooltip: l10n.voiceLiveHideMessages,
                icon: const Icon(Icons.keyboard_arrow_down_rounded),
              ),
            ],
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: VoiceTranscriptList(
            controller: _scroll,
            messages: widget.messages,
            onPlayAudio: widget.onPlayAudio,
            onFeedback: widget.onFeedback,
          ),
        ),
      ],
    );
  }
}
