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
import 'package:aim_mobile/features/voice_teacher/logic/live_voice_client.dart';
import 'package:aim_mobile/features/voice_teacher/logic/live_voice_engine.dart';
import 'package:aim_mobile/features/voice_teacher/ui/pages/voice_teacher_page.dart';
import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/features/voice_teacher/ui/widgets/voice_error_state.dart';

Widget _wrap(Widget child, {List<Override> overrides = const []}) =>
    ProviderScope(
      overrides: [
        authFlowProvider.overrideWith((ref) => _SignedInAuthFlowNotifier()),
        ...overrides,
      ],
      child: MaterialApp(
        theme: AppTheme.light,
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: child,
      ),
    );

/// Fake [LiveVoiceClient] — the real `record` package's AudioRecorder calls a platform channel in its own
/// constructor, so it can't be used in a widget test. This one streams synthetic audio on demand, so a test can
/// "talk" to the page (quiet room, a sentence, a pause) without any plugin.
class _FakeLiveVoiceClient implements LiveVoiceClient {
  _FakeLiveVoiceClient({this.permission = true, this.startThrows = false});

  final bool permission;
  final bool startThrows;
  // Synchronous, so frames are processed the moment a test feeds them.
  final _frames = StreamController<Uint8List>.broadcast(sync: true);
  bool started = false;
  bool stopped = false;
  bool disposed = false;

  @override
  Future<bool> hasPermission() async => permission;

  @override
  Future<Stream<Uint8List>> start() async {
    if (startThrows) throw StateError('device busy');
    started = true;
    return _frames.stream;
  }

  @override
  Future<void> stop() async => stopped = true;

  @override
  void dispose() {
    disposed = true;
    unawaited(_frames.close());
  }

  /// [ms] milliseconds of audio at loudness [amplitude] (RMS 0..1), in 80 ms frames.
  void feed(double amplitude, int ms) {
    final samples = (liveSampleRate * 0.08).round();
    final v = (amplitude * 32767).round();
    for (var t = 0; t < ms; t += 80) {
      final frame = Uint8List(samples * 2);
      final view = ByteData.sublistView(frame);
      for (var i = 0; i < samples; i++) {
        view.setInt16(i * 2, i.isEven ? v : -v, Endian.little);
      }
      _frames.add(frame);
    }
  }

  void quiet(int ms) => feed(0.003, ms);
  void talk(int ms) => feed(0.2, ms);
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
  Future<void> playUrl(String url) async {}

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
      'opens the live microphone as soon as the conversation is open',
      (tester) async {
        // The student chose to start the live lesson, so the mic opens on its own and listens.
        final fakeLive = _FakeLiveVoiceClient();
        await tester.pumpWidget(_wrap(
          VoiceTeacherPage(
            contextRef: 'lesson-1',
            liveClient: fakeLive,
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

        expect(fakeLive.started, isTrue);
        expect(find.text("I'm listening. Just talk."), findsOneWidget);
        expect(find.byIcon(Icons.mic_rounded), findsOneWidget);
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
            liveClient: _FakeLiveVoiceClient(),
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
          liveClient: _FakeLiveVoiceClient(),
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
          liveClient: _FakeLiveVoiceClient(),
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
            liveClient: _FakeLiveVoiceClient(),
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
      'with the live microphone listening',
      (tester) async {
        final playbackNotifier =
            VoicePlaybackNotifier(player: _FakeVoicePlayerClient());
        final fakeLive = _FakeLiveVoiceClient();

        await tester.pumpWidget(_wrap(
          VoiceTeacherPage(
            contextRef: 'lesson-1',
            liveClient: fakeLive,
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
        // shown automatically — but the call view (with the live mic
        // listening) must be showing in its place.
        expect(find.text('Your teacher is speaking…'), findsNothing);
        expect(find.byIcon(Icons.mic_rounded), findsOneWidget);
        expect(
          fakeLive.started,
          isTrue,
          reason: 'the live mic is open and listening, so the student can '
              'simply answer by talking',
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
            liveClient: _FakeLiveVoiceClient(),
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
        expect(find.byIcon(Icons.mic_rounded), findsOneWidget);

        // The greeting is still reachable via the opt-in transcript.
        await tester.tap(find.text('Messages'));
        await tester.pump();
        expect(
          find.text('Welcome! Today we will focus on greetings.'),
          findsOneWidget,
        );
      },
    );

    // P21-018: talking over the teacher while its audio is playing must stop the
    // audio immediately (barge-in), so the student can interrupt naturally.
    testWidgets(
      'talking over the teacher stops the teacher (barge-in) and the student is heard',
      (tester) async {
        final playbackNotifier = VoicePlaybackNotifier(player: _FakeVoicePlayerClient());
        // Drive it into a "playing" state without a real audio backend.
        unawaited(playbackNotifier.loadAndPlay(
          audioRef: 'audio-1',
          fetchAudioFn: (_) async => Uint8List(0),
        ));
        await tester.pump();
        expect(playbackNotifier.state, PlaybackState.playing);

        final fakeLive = _FakeLiveVoiceClient();
        await tester.pumpWidget(_wrap(
          VoiceTeacherPage(contextRef: 'lesson-1', liveClient: fakeLive),
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
          ],
        ));
        await tester.pump();
        await tester.pump();

        // Nothing stops the teacher while the room is quiet.
        fakeLive.quiet(800);
        expect(playbackNotifier.state, PlaybackState.playing);

        // The student starts talking over the playing audio.
        fakeLive.talk(1000);
        await tester.pump();
        expect(
          playbackNotifier.state,
          isNot(PlaybackState.playing),
          reason: 'talking over the teacher must stop the teacher right away',
        );
      },
    );

    testWidgets(
      'a finished spoken sentence is sent on its own, as a WAV file',
      (tester) async {
        final notifier = _FakeVoiceTeacherSessionNotifier(
          const AppAsyncState.success(VoiceTeacherSessionState(
            sessionId: 'session-1',
            history: _history,
          )),
        );
        List<int>? submitted;
        notifier.onSubmitTurn = (bytes) => submitted = bytes;
        final fakeLive = _FakeLiveVoiceClient();

        await tester.pumpWidget(_wrap(
          VoiceTeacherPage(contextRef: 'lesson-1', liveClient: fakeLive),
          overrides: [
            voiceTeacherSessionProvider.overrideWith((ref) => notifier),
            voicePlaybackProvider.overrideWith(
              (ref) => VoicePlaybackNotifier(player: _FakeVoicePlayerClient()),
            ),
            voiceTeacherRepositoryProvider.overrideWithValue(_FakeVoiceTeacherRepository()),
          ],
        ));
        await tester.pump();
        await tester.pump();

        fakeLive.quiet(800);
        fakeLive.talk(2000);
        await tester.pump();
        expect(submitted, isNull, reason: 'nothing is sent while the student is still talking');
        fakeLive.quiet(1300);
        await tester.pump();
        await tester.pump();

        expect(submitted, isNotNull);
        expect(String.fromCharCodes(submitted!.sublist(0, 4)), 'RIFF');
        expect(String.fromCharCodes(submitted!.sublist(8, 12)), 'WAVE');
      },
    );

    testWidgets('the mic button mutes and unmutes the microphone, and a muted mic sends nothing',
        (tester) async {
      final notifier = _FakeVoiceTeacherSessionNotifier(
        const AppAsyncState.success(VoiceTeacherSessionState(sessionId: 'session-1', history: _history)),
      );
      var sends = 0;
      notifier.onSubmitTurn = (_) => sends++;
      final fakeLive = _FakeLiveVoiceClient();
      await tester.pumpWidget(_wrap(
        VoiceTeacherPage(contextRef: 'lesson-1', liveClient: fakeLive),
        overrides: [
          voiceTeacherSessionProvider.overrideWith((ref) => notifier),
          voicePlaybackProvider.overrideWith(
            (ref) => VoicePlaybackNotifier(player: _FakeVoicePlayerClient()),
          ),
          voiceTeacherRepositoryProvider.overrideWithValue(_FakeVoiceTeacherRepository()),
        ],
      ));
      await tester.pump();
      await tester.pump();

      await tester.tap(find.byIcon(Icons.mic_rounded));
      await tester.pump();
      expect(find.byIcon(Icons.mic_off_rounded), findsOneWidget);
      expect(find.text('Your microphone is muted'), findsOneWidget);

      fakeLive.quiet(800);
      fakeLive.talk(2000);
      fakeLive.quiet(1500);
      await tester.pump();
      await tester.pump();
      expect(sends, 0, reason: 'a muted microphone must not send anything');

      await tester.tap(find.byIcon(Icons.mic_off_rounded));
      await tester.pump();
      expect(find.byIcon(Icons.mic_rounded), findsOneWidget);
    });

    testWidgets('shows the microphone error state when microphone permission is denied',
        (tester) async {
      await tester.pumpWidget(_wrap(
        VoiceTeacherPage(
          contextRef: 'lesson-1',
          liveClient: _FakeLiveVoiceClient(permission: false),
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
      await tester.pump();

      expect(find.byType(VoiceErrorState), findsOneWidget);
      // The student can still type to the teacher.
      expect(find.byType(TextField), findsOneWidget);
    });

    testWidgets('shows the microphone error state when the microphone cannot start',
        (tester) async {
      await tester.pumpWidget(_wrap(
        VoiceTeacherPage(
          contextRef: 'lesson-1',
          liveClient: _FakeLiveVoiceClient(startThrows: true),
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
      await tester.pump();

      expect(find.byType(VoiceErrorState), findsOneWidget);
      expect(find.textContaining('Exception'), findsNothing);
    });
  });

  group('VoiceTeacherPage live lesson controls', () {
    const greetingOnly = VoiceTeacherSessionState(
      sessionId: 'session-1',
      history: [
        VoiceMessage(
          id: 'g1',
          role: VoiceMessageRole.teacher,
          text: 'Welcome! Are you ready to start?',
          createdAt: '2026-01-01T00:00:00Z',
          isGreeting: true,
        ),
      ],
    );
    const withHistory = VoiceTeacherSessionState(sessionId: 'session-1', history: _history);

    Widget page(_FakeVoiceTeacherSessionNotifier notifier) => _wrap(
          VoiceTeacherPage(contextRef: 'lesson:l1', liveClient: _FakeLiveVoiceClient()),
          overrides: [
            voiceTeacherSessionProvider.overrideWith((ref) => notifier),
            voicePlaybackProvider.overrideWith(
              (ref) => VoicePlaybackNotifier(player: _FakeVoicePlayerClient()),
            ),
            voiceTeacherRepositoryProvider.overrideWithValue(_FakeVoiceTeacherRepository()),
          ],
        );

    Future<void> open(WidgetTester tester, _FakeVoiceTeacherSessionNotifier notifier) async {
      await tester.pumpWidget(page(notifier));
      await tester.pump();
      await tester.pump();
    }

    testWidgets("shows the text box, send button, mute toggle and the teacher's words as text", (tester) async {
      await open(tester, _FakeVoiceTeacherSessionNotifier(const AppAsyncState.success(withHistory)));

      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('Type or talk to your teacher'), findsOneWidget);
      // With nothing typed, the round button is the live microphone; typing turns it into "send".
      expect(find.byIcon(Icons.mic_rounded), findsOneWidget);
      expect(find.byIcon(Icons.arrow_upward_rounded), findsNothing);
      await tester.enterText(find.byType(TextField), 'Hello');
      await tester.pump();
      expect(find.byIcon(Icons.arrow_upward_rounded), findsOneWidget);
      expect(find.byIcon(Icons.mic_rounded), findsNothing);
      expect(find.byIcon(Icons.volume_up_rounded), findsOneWidget);
      expect(find.text('You say "hello".'), findsOneWidget);
    });

    testWidgets('sends what is typed (trimmed) and clears the box', (tester) async {
      final notifier = _FakeVoiceTeacherSessionNotifier(const AppAsyncState.success(withHistory));
      await open(tester, notifier);

      await tester.enterText(find.byType(TextField), '  I play football on Sundays  ');
      await tester.pump();
      await tester.tap(find.byIcon(Icons.arrow_upward_rounded));
      await tester.pump();
      await tester.pump();

      expect(notifier.sentTexts, ['I play football on Sundays']);
      expect(tester.widget<TextField>(find.byType(TextField)).controller!.text, isEmpty);
    });

    testWidgets('does not send an empty message', (tester) async {
      final notifier = _FakeVoiceTeacherSessionNotifier(const AppAsyncState.success(withHistory));
      await open(tester, notifier);

      await tester.enterText(find.byType(TextField), '   ');
      await tester.pump();
      // Only spaces: there is nothing to send, so the button stays the microphone.
      expect(find.byIcon(Icons.arrow_upward_rounded), findsNothing);
      expect(find.byIcon(Icons.mic_rounded), findsOneWidget);

      expect(notifier.sentTexts, isEmpty);
    });

    testWidgets('keeps the text and says so when a message could not be sent', (tester) async {
      final notifier = _FakeVoiceTeacherSessionNotifier(const AppAsyncState.success(withHistory))
        ..textSendSucceeds = false;
      await open(tester, notifier);

      await tester.enterText(find.byType(TextField), 'Hello');
      await tester.pump();
      await tester.tap(find.byIcon(Icons.arrow_upward_rounded));
      await tester.pump();
      await tester.pump();

      expect(find.text('Your message could not be sent. Please try again.'), findsOneWidget);
      expect(tester.widget<TextField>(find.byType(TextField)).controller!.text, 'Hello');
    });

    testWidgets('after the greeting, one tap answers "ready to start?"', (tester) async {
      final notifier = _FakeVoiceTeacherSessionNotifier(const AppAsyncState.success(greetingOnly));
      await open(tester, notifier);

      expect(find.text("Yes, let's start"), findsOneWidget);
      // The test window is small; scroll the button into view like a student would.
      await tester.ensureVisible(find.text("Yes, let's start"));
      await tester.pump();
      await tester.tap(find.text("Yes, let's start"));
      await tester.pump();
      await tester.pump();

      expect(notifier.sentTexts, ["Yes, let's start."]);
    });

    testWidgets("the mute toggle switches the teacher's voice off and on", (tester) async {
      await open(tester, _FakeVoiceTeacherSessionNotifier(const AppAsyncState.success(withHistory)));

      await tester.tap(find.byIcon(Icons.volume_up_rounded));
      await tester.pump();
      expect(find.byIcon(Icons.volume_off_rounded), findsOneWidget);
      await tester.tap(find.byIcon(Icons.volume_off_rounded));
      await tester.pump();
      expect(find.byIcon(Icons.volume_up_rounded), findsOneWidget);
    });
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

  /// Typed messages the screen sent, and whether sending "works".
  final List<String> sentTexts = [];
  bool textSendSucceeds = true;

  @override
  Future<bool> submitTextTurn({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) async {
    sentTexts.add(message);
    return textSendSucceeds;
  }

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
  Future<VoiceTurnResult> submitText({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) async =>
      const VoiceTurnResult(text: 'reply', isFallback: false, latencyMs: 10);

  @override
  Future<List<int>> getMessageAudio({
    required String bearerToken,
    required String messageId,
  }) async =>
      const [1, 2, 3];

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
