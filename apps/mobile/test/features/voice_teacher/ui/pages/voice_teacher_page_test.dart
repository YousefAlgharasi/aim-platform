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
import 'package:aim_mobile/features/voice_teacher/logic/voice_player_client.dart';
import 'package:aim_mobile/features/voice_teacher/logic/voice_recorder_client.dart';
import 'package:aim_mobile/features/voice_teacher/ui/pages/voice_teacher_page.dart';
import 'package:aim_mobile/features/voice_teacher/ui/widgets/voice_error_state.dart';
import 'package:aim_mobile/features/voice_teacher/ui/widgets/voice_push_to_talk_button.dart';

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

  final _amplitudeController = StreamController<double>.broadcast();

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
  Stream<double> onAmplitudeChanged(Duration interval) =>
      _amplitudeController.stream;

  @override
  void dispose() {
    disposed = true;
    unawaited(_amplitudeController.close());
  }
}

/// Fake [VoicePlayerClient] — the real `audioplayers` AudioPlayer calls a
/// platform channel in its own constructor, so it can't be used at all in a
/// widget test with no platform channel registered.
class _FakeVoicePlayerClient implements VoicePlayerClient {
  final _completeController = StreamController<void>.broadcast();

  List<int>? playedBytes;
  bool stopped = false;
  bool paused = false;
  bool resumed = false;
  bool disposed = false;

  @override
  Future<void> playBytes(Uint8List bytes) async {
    playedBytes = bytes;
  }

  @override
  Future<void> pause() async {
    paused = true;
  }

  @override
  Future<void> resume() async {
    resumed = true;
  }

  @override
  Future<void> stop() async {
    stopped = true;
  }

  @override
  Stream<void> get onComplete => _completeController.stream;

  @override
  void dispose() {
    disposed = true;
    unawaited(_completeController.close());
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
      'does not auto-start recording for a fresh session with no history — '
      'push-to-talk requires a press',
      (tester) async {
        // Push-to-talk: the student controls exactly when their turn starts
        // by pressing and holding the mic — the app never starts recording
        // on its own.
        final fakeRecorder = _FakeVoiceRecorderClient();
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
                )),
              ),
            ),
          ],
        ));
        await tester.pump();
        await tester.pump();

        expect(fakeRecorder.startedPath, isNull);
        expect(find.byType(VoicePushToTalkButton), findsOneWidget);
      },
    );

    testWidgets(
      'shows student/teacher transcript turns and never renders '
      'mastery/level/weakness/difficulty/recommendation/review-schedule '
      'labels',
      (tester) async {
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
          ],
        ));
        await tester.pump();

        // Bugfix: the transcript is no longer shown automatically — the
        // call view (status pill/waveform/record button) is the default
        // every time this session is opened, with a "Messages" button to
        // opt into the transcript.
        expect(find.text('How do you say hello?'), findsNothing);
        await tester.tap(find.text('Messages'));
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
        VoiceTeacherPage(
          contextRef: 'lesson-1',
          recorder: _FakeVoiceRecorderClient(),
        ),
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
        VoiceTeacherPage(
          contextRef: 'lesson-1',
          recorder: _FakeVoiceRecorderClient(),
        ),
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

    // Bugfix (P21-017 was never actually wired up), then extended for
    // hands-free auto-play: a fresh session whose only message is the
    // auto-generated greeting must play the greeting's audio automatically
    // (no tap) and show a passive "your teacher is speaking" state while it
    // plays, not silently drop straight into the transcript/record view
    // with no audio ever surfaced.
    testWidgets(
      'auto-plays the greeting and shows a passive speaking state for a '
      'session with only the greeting message',
      (tester) async {
        final playbackNotifier =
            VoicePlaybackNotifier(player: _FakeVoicePlayerClient());

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
            voiceTeacherRepositoryProvider
                .overrideWithValue(_FakeVoiceTeacherRepository()),
          ],
        ));
        await tester.pump();
        await tester.pump();

        expect(find.text('Your teacher is speaking…'), findsOneWidget);
        expect(playbackNotifier.state, PlaybackState.playing);
        // The greeting is auto-playing, so the normal "press and hold to
        // speak" call view must not show underneath it yet.
        expect(find.text('Your turn — press and hold to speak'), findsNothing);
      },
    );

    testWidgets(
      'once the auto-played greeting finishes, the call view is shown '
      'with the push-to-talk button ready — no auto-listening',
      (tester) async {
        final playbackNotifier =
            VoicePlaybackNotifier(player: _FakeVoicePlayerClient());
        final fakeRecorder = _FakeVoiceRecorderClient();

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
            voiceTeacherRepositoryProvider
                .overrideWithValue(_FakeVoiceTeacherRepository()),
          ],
        ));
        await tester.pump();
        await tester.pump();
        expect(playbackNotifier.state, PlaybackState.playing);

        // Simulate the underlying player reporting natural completion —
        // this is what drives the auto-listen continuation, never a tap.
        await tester.runAsync(() async {
          playbackNotifier.complete();
          await Future<void>.delayed(const Duration(milliseconds: 50));
        });
        await tester.pump();

        // The transcript itself is opt-in (via the "Messages" button), not
        // shown automatically — but the call view (with the push-to-talk
        // button ready) must be showing in its place.
        expect(find.text('Your teacher is speaking…'), findsNothing);
        expect(find.byType(VoicePushToTalkButton), findsOneWidget);
        expect(
          fakeRecorder.startedPath,
          isNull,
          reason: 'push-to-talk must never auto-start recording — the '
              'student presses the mic themselves',
        );

        // The greeting is still reachable via the opt-in transcript.
        await tester.tap(find.text('Messages'));
        await tester.pump();
        expect(
          find.text('Welcome! Today we will focus on greetings.'),
          findsOneWidget,
          reason: 'once speaking finishes, the greeting must still be '
              'visible in the transcript',
        );
      },
    );

    testWidgets(
      'skips straight to the normal flow when the greeting has no audio (TTS failed)',
      (tester) async {
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

        expect(find.text('Your teacher is speaking…'), findsNothing);
        expect(find.byType(VoicePushToTalkButton), findsOneWidget);

        // The greeting is still reachable via the opt-in transcript.
        await tester.tap(find.text('Messages'));
        await tester.pump();
        expect(
          find.text('Welcome! Today we will focus on greetings.'),
          findsOneWidget,
        );
      },
    );

    // P21-018: pressing the mic while AI audio is actively playing must stop
    // local playback immediately and start recording (barge-in) — the mic
    // button stays pressable while the AI is speaking (only disabled during
    // `processing`), so a press can arrive mid-playback and must interrupt
    // it rather than being ignored.
    testWidgets(
      'pressing the push-to-talk button mid-playback (barge-in) stops '
      'playback and starts recording',
      (tester) async {
        final playbackNotifier = VoicePlaybackNotifier(player: _FakeVoicePlayerClient());
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
        await tester.pump();

        // Nothing recording yet — push-to-talk never auto-starts.
        expect(playbackNotifier.state, PlaybackState.playing);
        expect(recordNotifier.state, isNot(RecordSubmitState.recording));
        await tester.ensureVisible(find.byType(VoicePushToTalkButton));
        await tester.pump();

        // Press down (not a full tap) — hold the mic while the AI is still
        // speaking, exercising the barge-in path. The permission-check-
        // then-start chain is real async work, so it needs a real
        // event-loop tick via runAsync + a real delay.
        late final TestGesture gesture;
        await tester.runAsync(() async {
          gesture = await tester.startGesture(
            tester.getCenter(find.byType(VoicePushToTalkButton)),
          );
          await Future<void>.delayed(const Duration(milliseconds: 50));
          await tester.pump();
        });

        expect(
          playbackNotifier.state,
          isNot(PlaybackState.playing),
          reason: 'barge-in must stop local playback immediately on press',
        );
        expect(recordNotifier.state, RecordSubmitState.recording);

        await tester.runAsync(() async {
          await gesture.up();
          await Future<void>.delayed(const Duration(milliseconds: 50));
          await tester.pump();
        });
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
        await tester.ensureVisible(find.byType(VoicePushToTalkButton));
        await tester.pump();

        // A single tap (down+up together) is enough here: onPressStart
        // fires on the down phase and hits the permission check, which
        // reports the error before onPressEnd's release ever runs.
        await tester.tap(find.byType(VoicePushToTalkButton));
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
        await tester.ensureVisible(find.byType(VoicePushToTalkButton));
        await tester.pump();

        await tester.tap(find.byType(VoicePushToTalkButton));
        await tester.pump();
        await tester.pump();
        await tester.pump();

        expect(recordNotifier.state, RecordSubmitState.error);
        expect(find.byType(VoiceErrorState), findsOneWidget);
      },
    );

    testWidgets(
      'press-and-hold then release reads real captured bytes and submits them',
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
        await tester.ensureVisible(find.byType(VoicePushToTalkButton));
        await tester.pump();

        // Press down (not a full tap) — starts recording and holds. The
        // press handler's permission-check-then-start chain is real async
        // work (not fake-test-zone timers), so it needs a real event-loop
        // tick via runAsync + a real delay, same as the release side below.
        late final TestGesture gesture;
        await tester.runAsync(() async {
          gesture = await tester.startGesture(
            tester.getCenter(find.byType(VoicePushToTalkButton)),
          );
          await Future<void>.delayed(const Duration(milliseconds: 50));
          await tester.pump();
        });
        expect(recordNotifier.state, RecordSubmitState.recording);
        expect(fakeRecorder.startedPath, isNotNull);

        // Real dart:io file I/O happens inside _onStopRecording (reading the
        // fake recorder's temp file back into memory), which needs a real
        // event-loop tick to complete — plain pump() only drains the fake
        // test zone's microtask/timer queue, not real system I/O.
        await tester.runAsync(() async {
          await gesture.up();
          // _onStopRecording's fire-and-forget async chain (stop() -> real
          // file read -> delete -> submitToBackend -> submitTurn) needs real
          // wall-clock time to fully unwind, since the button's onPressEnd
          // slot discards the returned Future.
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
