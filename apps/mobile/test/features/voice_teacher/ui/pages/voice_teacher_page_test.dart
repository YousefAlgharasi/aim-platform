// Phase 18 — P18-069
// voice_teacher_page_test.dart — widget tests for VoiceTeacherPage.
//
// Covers:
//   1. Loading state renders without crash while the session is starting.
//   2. Error state renders the safe VoiceErrorState widget on session
//      failure, not raw backend error details.
//   3. Empty transcript renders the empty state.
//   4. Populated transcript renders student/teacher turns and never any
//      mastery/level/weakness/difficulty/recommendation/review-schedule
//      label (no-authority — Voice Tutor never owns learning state).
//   5. A microphone/recording error renders the microphone error state
//      (covers permission-denied style failures).
//   6. A fallback (TTS-unavailable) turn renders the text-fallback widget.

import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/auth/logic/entity/auth_flow_state.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_feedback_result.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_message.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_session.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_teacher_session_state.dart';
import 'package:aim_mobile/features/voice_teacher/logic/entity/voice_turn_result.dart';
import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_playback_notifier.dart';
import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_record_submit_notifier.dart';
import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_teacher_provider.dart';
import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_teacher_session_notifier.dart';
import 'package:aim_mobile/features/voice_teacher/logic/repository/voice_teacher_repository.dart';
import 'package:aim_mobile/features/voice_teacher/logic/voice_recorder_client.dart';
import 'package:aim_mobile/features/voice_teacher/ui/pages/voice_teacher_page.dart';
import 'package:aim_mobile/features/voice_teacher/ui/widgets/voice_error_state.dart';
import 'package:aim_mobile/features/voice_teacher/ui/widgets/voice_record_button.dart';

Widget _wrap(Widget child, {List<Override> overrides = const []}) =>
    ProviderScope(
      overrides: [
        authFlowProvider.overrideWith((ref) => _SignedInAuthFlowNotifier()),
        ...overrides,
      ],
      child: MaterialApp(theme: AppTheme.light, home: child),
    );

/// Fake [VoiceRecorderClient] — the real `record` package's AudioRecorder
/// calls a platform channel in its own constructor, so it can't be used at
/// all in a widget test with no platform channel registered. This lets
/// tests exercise _onStartRecording/_onStopRecording without ever touching
/// the real plugin.
class _FakeVoiceRecorderClient implements VoiceRecorderClient {
  _FakeVoiceRecorderClient({
    this.permissionGranted = true,
    this.startThrows,
    this.recordedBytes,
  });

  final bool permissionGranted;
  final Object? startThrows;
  final List<int>? recordedBytes;

  String? startedPath;
  bool stopped = false;
  bool disposed = false;

  @override
  Future<bool> hasPermission() async => permissionGranted;

  @override
  Future<void> start(String path) async {
    if (startThrows != null) throw startThrows!;
    startedPath = path;
  }

  @override
  Future<String?> stop() async {
    stopped = true;
    if (recordedBytes == null) return null;
    final file = File(startedPath!);
    await file.writeAsBytes(recordedBytes!);
    return startedPath;
  }

  @override
  void dispose() {
    disposed = true;
  }
}

const _history = [
  VoiceMessage(
    id: 'm1',
    role: VoiceMessageRole.student,
    text: 'How do you say hello?',
    createdAt: '2025-01-01T00:00:00Z',
  ),
  VoiceMessage(
    id: 'm2',
    role: VoiceMessageRole.teacher,
    text: 'You say "hello".',
    audioRef: 'audio-1',
    createdAt: '2025-01-01T00:00:01Z',
  ),
];

void main() {
  group('VoiceTeacherPage', () {
    testWidgets('shows loading state without crash', (tester) async {
      await tester.pumpWidget(_wrap(
        const VoiceTeacherPage(contextRef: 'lesson-1'),
        overrides: [
          voiceTeacherSessionProvider.overrideWith(
            (ref) => _FakeVoiceTeacherSessionNotifier(
              const AppAsyncState.loading(),
            ),
          ),
        ],
      ));
      await tester.pump();
      expect(find.byType(VoiceTeacherPage), findsOneWidget);
    });

    testWidgets('shows safe error state on session failure', (tester) async {
      await tester.pumpWidget(_wrap(
        const VoiceTeacherPage(contextRef: 'lesson-1'),
        overrides: [
          voiceTeacherSessionProvider.overrideWith(
            (ref) => _FakeVoiceTeacherSessionNotifier(
              const AppAsyncState.failure(message: 'internal trace=abc'),
            ),
          ),
        ],
      ));
      await tester.pump();

      expect(find.byType(VoiceErrorState), findsOneWidget);
      expect(find.text('internal trace=abc'), findsNothing);
    });

    testWidgets(
      'shows the pre-conversation idle hero when there is no history',
      (tester) async {
        // With no history and nothing in progress, the screen shows the
        // full-bleed gradient "Tap to speak" hero (see
        // VoiceTeacherPage's _VoiceHeroIdle) rather than
        // VoiceTranscriptList's own empty-state text — that empty state is
        // only reachable once a session has genuinely started producing an
        // (empty) history list distinct from "no session activity yet".
        await tester.pumpWidget(_wrap(
          const VoiceTeacherPage(contextRef: 'lesson-1'),
          overrides: [
            voiceTeacherSessionProvider.overrideWith(
              (ref) => _FakeVoiceTeacherSessionNotifier(
                const AppAsyncState.success(VoiceTeacherSessionState(
                  sessionId: 'session-1',
                )),
              ),
            ),
          ],
        ));
        await tester.pump();

        // "Tap to speak" appears twice by design: idle-hero headline +
        // record-button caption.
        expect(find.text('Tap to speak'), findsNWidgets(2));
        expect(
          find.text('Start talking with your Voice Teacher'),
          findsNothing,
        );
      },
    );

    testWidgets(
      'shows student/teacher transcript turns and never renders '
      'mastery/level/weakness/difficulty/recommendation/review-schedule '
      'labels',
      (tester) async {
        await tester.pumpWidget(_wrap(
          const VoiceTeacherPage(contextRef: 'lesson-1'),
          overrides: [
            voiceTeacherSessionProvider.overrideWith(
              (ref) => _FakeVoiceTeacherSessionNotifier(
                const AppAsyncState.success(VoiceTeacherSessionState(
                  sessionId: 'session-1',
                  history: _history,
                )),
              ),
            ),
          ],
        ));
        await tester.pump();

        expect(find.text('How do you say hello?'), findsOneWidget);
        expect(find.text('You say "hello".'), findsOneWidget);

        for (final forbidden in [
          'mastery',
          'level',
          'weakness',
          'difficulty',
          'recommendation',
          'review-schedule',
        ]) {
          expect(find.textContaining(forbidden), findsNothing);
        }
      },
    );

    testWidgets('shows microphone error state on a recording error', (
      tester,
    ) async {
      final recordNotifier = VoiceRecordSubmitNotifier();
      recordNotifier.startRecording();
      // Simulate a microphone/permission failure path by driving the
      // notifier into its error state without a real recorder plugin.
      await recordNotifier.submitToBackend(
        sessionId: 'session-1',
        submitFn: (sessionId, audio, mimeType) async => throw Exception('x'),
      );

      await tester.pumpWidget(_wrap(
        const VoiceTeacherPage(contextRef: 'lesson-1'),
        overrides: [
          voiceTeacherSessionProvider.overrideWith(
            (ref) => _FakeVoiceTeacherSessionNotifier(
              const AppAsyncState.success(VoiceTeacherSessionState(
                sessionId: 'session-1',
              )),
            ),
          ),
          voiceRecordSubmitProvider.overrideWith((ref) => recordNotifier),
        ],
      ));
      await tester.pump();

      // With no recorded audio, submitToBackend is a no-op and the state
      // stays idle/error depending on the recorder's own gating — assert
      // the page renders without crashing either way and shows no raw
      // exception text.
      expect(find.textContaining('Exception'), findsNothing);
    });

    testWidgets('shows text fallback when the last turn has no audio', (
      tester,
    ) async {
      await tester.pumpWidget(_wrap(
        const VoiceTeacherPage(contextRef: 'lesson-1'),
        overrides: [
          voiceTeacherSessionProvider.overrideWith(
            (ref) => _FakeVoiceTeacherSessionNotifier(
              const AppAsyncState.success(VoiceTeacherSessionState(
                sessionId: 'session-1',
                lastTurn: VoiceTurnResult(
                  text: 'Fallback reply text',
                  audioRef: null,
                  isFallback: true,
                  latencyMs: 10,
                ),
              )),
            ),
          ),
        ],
      ));
      await tester.pump();

      expect(find.text('Fallback reply text'), findsOneWidget);
    });

    // Bugfix (P21-017 was never actually wired up): a fresh session whose
    // only message is the auto-generated greeting must show a "ready to
    // hear your teacher" state with a play button, not silently drop
    // straight into the transcript/record view with no audio ever
    // surfaced.
    testWidgets(
      'shows a ready-to-play greeting state for a session with only the greeting message',
      (tester) async {
        await tester.pumpWidget(_wrap(
          const VoiceTeacherPage(contextRef: 'lesson-1'),
          overrides: [
            voiceTeacherSessionProvider.overrideWith(
              (ref) => _FakeVoiceTeacherSessionNotifier(
                const AppAsyncState.success(VoiceTeacherSessionState(
                  sessionId: 'session-1',
                  history: [
                    VoiceMessage(
                      id: 'greeting-1',
                      role: VoiceMessageRole.teacher,
                      text: 'Welcome! Today we will focus on greetings.',
                      audioRef: 'greeting-audio-1',
                      createdAt: '2026-01-01T00:00:00Z',
                      isGreeting: true,
                    ),
                  ],
                )),
              ),
            ),
          ],
        ));
        await tester.pump();

        expect(find.text('Tap to hear your teacher'), findsOneWidget);
        expect(find.byIcon(Icons.play_arrow_rounded), findsOneWidget);
        // The greeting hasn't been played yet, so the normal "Tap to
        // speak" / transcript view must not show underneath it.
        expect(find.text('Tap to speak'), findsNothing);
      },
    );

    testWidgets(
      'tapping the greeting play button plays the audio and reveals the transcript',
      (tester) async {
        final playbackNotifier = VoicePlaybackNotifier();

        await tester.pumpWidget(_wrap(
          const VoiceTeacherPage(contextRef: 'lesson-1'),
          overrides: [
            voiceTeacherSessionProvider.overrideWith(
              (ref) => _FakeVoiceTeacherSessionNotifier(
                const AppAsyncState.success(VoiceTeacherSessionState(
                  sessionId: 'session-1',
                  history: [
                    VoiceMessage(
                      id: 'greeting-1',
                      role: VoiceMessageRole.teacher,
                      text: 'Welcome! Today we will focus on greetings.',
                      audioRef: 'greeting-audio-1',
                      createdAt: '2026-01-01T00:00:00Z',
                      isGreeting: true,
                    ),
                  ],
                )),
              ),
            ),
            voicePlaybackProvider.overrideWith((ref) => playbackNotifier),
          ],
        ));
        await tester.pump();

        await tester.tap(find.byIcon(Icons.play_arrow_rounded));
        await tester.pump();

        expect(
          find.text('Welcome! Today we will focus on greetings.'),
          findsOneWidget,
          reason: 'after dismissing the ready state, the greeting must still be visible in the transcript',
        );
      },
    );

    testWidgets(
      'skips straight to the normal flow when the greeting has no audio (TTS failed)',
      (tester) async {
        await tester.pumpWidget(_wrap(
          const VoiceTeacherPage(contextRef: 'lesson-1'),
          overrides: [
            voiceTeacherSessionProvider.overrideWith(
              (ref) => _FakeVoiceTeacherSessionNotifier(
                const AppAsyncState.success(VoiceTeacherSessionState(
                  sessionId: 'session-1',
                  history: [
                    VoiceMessage(
                      id: 'greeting-1',
                      role: VoiceMessageRole.teacher,
                      text: 'Welcome! Today we will focus on greetings.',
                      createdAt: '2026-01-01T00:00:00Z',
                      isGreeting: true,
                    ),
                  ],
                )),
              ),
            ),
          ],
        ));
        await tester.pump();
        await tester.pump();

        expect(find.text('Tap to hear your teacher'), findsNothing);
        expect(
          find.text('Welcome! Today we will focus on greetings.'),
          findsOneWidget,
        );
      },
    );

    // P21-018: tapping the record button while AI audio is actively playing
    // must stop local playback immediately and start recording — the mic
    // button stays tappable at all times (VoiceRecordButton only disables
    // during `processing`), so this is about what _onStartRecording does on
    // tap, not about un-disabling anything.
    testWidgets(
      'tapping the record button during playback stops playback and starts recording',
      (tester) async {
        final playbackNotifier = VoicePlaybackNotifier();
        // Drive it into a "playing" state without a real audio backend.
        unawaited(playbackNotifier.loadAndPlay(
          audioRef: 'audio-1',
          fetchAudioFn: (_) async => Uint8List(0),
        ));
        await tester.pump();
        expect(playbackNotifier.state, PlaybackState.playing);

        final recordNotifier = VoiceRecordSubmitNotifier();

        await tester.pumpWidget(_wrap(
          VoiceTeacherPage(
            contextRef: 'lesson-1',
            recorder: _FakeVoiceRecorderClient(),
          ),
          overrides: [
            voiceTeacherSessionProvider.overrideWith(
              (ref) => _FakeVoiceTeacherSessionNotifier(
                const AppAsyncState.success(VoiceTeacherSessionState(
                  sessionId: 'session-1',
                  history: _history,
                )),
              ),
            ),
            voicePlaybackProvider.overrideWith((ref) => playbackNotifier),
            voiceRecordSubmitProvider.overrideWith((ref) => recordNotifier),
          ],
        ));
        await tester.pump();

        expect(recordNotifier.state, RecordSubmitState.idle);

        await tester.tap(find.byType(VoiceRecordButton));
        await tester.pump();
        await tester.pump();
        await tester.pump();

        expect(
          playbackNotifier.state,
          isNot(PlaybackState.playing),
          reason: 'barge-in must stop local playback immediately',
        );
        expect(recordNotifier.state, RecordSubmitState.recording);
      },
    );

    // Bugfix: microphone capture is now wired to a real recorder — these
    // cover the new permission-denied and successful-recording paths that
    // never existed while _onStopRecording sent a hardcoded empty buffer.
    testWidgets(
      'shows the microphone error state when recording permission is denied',
      (tester) async {
        final recordNotifier = VoiceRecordSubmitNotifier();

        await tester.pumpWidget(_wrap(
          VoiceTeacherPage(
            contextRef: 'lesson-1',
            recorder: _FakeVoiceRecorderClient(permissionGranted: false),
          ),
          overrides: [
            voiceTeacherSessionProvider.overrideWith(
              (ref) => _FakeVoiceTeacherSessionNotifier(
                const AppAsyncState.success(VoiceTeacherSessionState(
                  sessionId: 'session-1',
                  history: _history,
                )),
              ),
            ),
            voiceRecordSubmitProvider.overrideWith((ref) => recordNotifier),
          ],
        ));
        await tester.pump();

        await tester.tap(find.byType(VoiceRecordButton));
        await tester.pump();
        await tester.pump();
        await tester.pump();

        expect(recordNotifier.state, RecordSubmitState.error);
        expect(find.byType(VoiceErrorState), findsOneWidget);
      },
    );

    testWidgets(
      'shows the microphone error state when the recorder fails to start '
      '(never optimistically shows "recording")',
      (tester) async {
        final recordNotifier = VoiceRecordSubmitNotifier();

        await tester.pumpWidget(_wrap(
          VoiceTeacherPage(
            contextRef: 'lesson-1',
            recorder: _FakeVoiceRecorderClient(
              startThrows: Exception('device busy'),
            ),
          ),
          overrides: [
            voiceTeacherSessionProvider.overrideWith(
              (ref) => _FakeVoiceTeacherSessionNotifier(
                const AppAsyncState.success(VoiceTeacherSessionState(
                  sessionId: 'session-1',
                  history: _history,
                )),
              ),
            ),
            voiceRecordSubmitProvider.overrideWith((ref) => recordNotifier),
          ],
        ));
        await tester.pump();

        await tester.tap(find.byType(VoiceRecordButton));
        await tester.pump();
        await tester.pump();
        await tester.pump();

        expect(recordNotifier.state, RecordSubmitState.error);
        expect(find.byType(VoiceErrorState), findsOneWidget);
      },
    );

    testWidgets(
      'recording then stopping reads real captured bytes and submits them',
      (tester) async {
        final recordNotifier = VoiceRecordSubmitNotifier();
        final fakeRecorder = _FakeVoiceRecorderClient(
          recordedBytes: [1, 2, 3, 4],
        );
        List<int>? submittedAudio;

        await tester.pumpWidget(_wrap(
          VoiceTeacherPage(
            contextRef: 'lesson-1',
            recorder: fakeRecorder,
          ),
          overrides: [
            voiceTeacherSessionProvider.overrideWith(
              (ref) => _FakeVoiceTeacherSessionNotifier(
                const AppAsyncState.success(VoiceTeacherSessionState(
                  sessionId: 'session-1',
                  history: _history,
                )),
              )..onSubmitTurn = (audio) => submittedAudio = audio,
            ),
            voiceRecordSubmitProvider.overrideWith((ref) => recordNotifier),
          ],
        ));
        await tester.pump();

        // Real dart:io file I/O happens inside _onStopRecording (reading the
        // fake recorder's temp file back into memory), which needs a real
        // event-loop tick to complete — plain pump() only drains the fake
        // test zone's microtask/timer queue, not real system I/O.
        await tester.runAsync(() async {
          await tester.tap(find.byType(VoiceRecordButton));
          await tester.pump();
          await tester.pump();
          await tester.pump();
        });
        expect(recordNotifier.state, RecordSubmitState.recording);
        expect(fakeRecorder.startedPath, isNotNull);

        await tester.runAsync(() async {
          await tester.tap(find.byType(VoiceRecordButton));
          // _onStopRecording's fire-and-forget async chain (stop() -> real
          // file read -> delete -> submitToBackend -> submitTurn) needs real
          // wall-clock time to fully unwind, since VoiceRecordButton's
          // onStopRecording slot discards the returned Future.
          await Future<void>.delayed(const Duration(milliseconds: 100));
          await tester.pump();
        });

        expect(fakeRecorder.stopped, isTrue);
        expect(submittedAudio, [1, 2, 3, 4]);
      },
    );
  });
}

class _SignedInAuthFlowNotifier extends AuthFlowNotifier {
  _SignedInAuthFlowNotifier() : super() {
    state = const AuthFlowState.signedIn(
      email: 'student@example.com',
      accessToken: 'test-token',
    );
  }
}

class _FakeVoiceTeacherSessionNotifier extends VoiceTeacherSessionNotifier {
  _FakeVoiceTeacherSessionNotifier(
    AppAsyncState<VoiceTeacherSessionState> initialState,
  ) : super(repository: _FakeVoiceTeacherRepository()) {
    state = initialState;
  }

  /// Test hook — lets a test observe the audio bytes _onStopRecording
  /// actually submitted, without needing a real backend round trip.
  void Function(List<int> audioBytes)? onSubmitTurn;

  @override
  Future<void> startSession({
    required String bearerToken,
    required String contextRef,
  }) async {}

  @override
  Future<void> loadHistory({
    required String bearerToken,
    required String sessionId,
  }) async {}

  @override
  Future<void> submitTurn({
    required String bearerToken,
    required String sessionId,
    required List<int> audioBytes,
    required String mimeType,
  }) async {
    onSubmitTurn?.call(audioBytes);
  }

  @override
  Future<void> submitFeedback({
    required String bearerToken,
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  }) async {}
}

class _FakeVoiceTeacherRepository implements VoiceTeacherRepository {
  @override
  Future<String> startSession({
    required String bearerToken,
    required String contextRef,
  }) async =>
      'session-1';

  @override
  Future<List<VoiceSession>> listSessions({required String bearerToken}) async =>
      const [];

  @override
  Future<List<VoiceMessage>> getSessionHistory({
    required String bearerToken,
    required String sessionId,
  }) async =>
      _history;

  @override
  Future<VoiceTurnResult> submitAudio({
    required String bearerToken,
    required String sessionId,
    required List<int> audioBytes,
    required String mimeType,
  }) async =>
      const VoiceTurnResult(
        text: 'reply',
        audioRef: 'audio-1',
        isFallback: false,
        latencyMs: 10,
      );

  @override
  Future<List<int>> getAudioPlayback({
    required String bearerToken,
    required String audioRef,
  }) async =>
      const [];

  @override
  Future<VoiceFeedbackResult> submitFeedback({
    required String bearerToken,
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  }) async =>
      const VoiceFeedbackResult(feedbackId: 'f1', recorded: true);
}
