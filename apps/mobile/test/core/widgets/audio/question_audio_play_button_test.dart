// QuestionAudioPlayButton — shared "Listen" control for listening-type
// questions (placement test, lesson practice).
//
// Covers:
//   1. Tapping fetches bytes and plays them (state → playing).
//   2. Tapping again while playing stops playback (state → idle).
//   3. Empty bytes (backend has no listening_script yet) show "not
//      available" without ever calling the player.
//   4. A fetch failure shows a retry-able error state.
//   5. onComplete firing on its own resets the button to idle.

import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/voice_teacher/logic/voice_player_client.dart';

class _FakePlayer implements VoicePlayerClient {
  final completeController = StreamController<void>.broadcast();
  Uint8List? playedBytes;
  bool stopped = false;

  @override
  Future<void> playBytes(Uint8List bytes) async => playedBytes = bytes;

  @override
  Future<void> pause() async {}

  @override
  Future<void> resume() async {}

  @override
  Future<void> stop() async => stopped = true;

  @override
  Stream<void> get onComplete => completeController.stream;

  @override
  void dispose() => unawaited(completeController.close());
}

Widget _wrap(Widget child) => MaterialApp(home: Scaffold(body: child));

void main() {
  testWidgets('tapping fetches bytes and plays them', (tester) async {
    final player = _FakePlayer();
    await tester.pumpWidget(_wrap(QuestionAudioPlayButton(
      player: player,
      fetchAudioBytes: () async => Uint8List.fromList([1, 2, 3]),
    )));

    await tester.tap(find.text('Listen'));
    await tester.pump();
    await tester.pump();

    expect(player.playedBytes, [1, 2, 3]);
    expect(find.text('Stop'), findsOneWidget);
  });

  testWidgets('tapping again while playing stops playback', (tester) async {
    final player = _FakePlayer();
    await tester.pumpWidget(_wrap(QuestionAudioPlayButton(
      player: player,
      fetchAudioBytes: () async => Uint8List.fromList([1, 2, 3]),
    )));

    await tester.tap(find.text('Listen'));
    await tester.pump();
    await tester.pump();
    expect(find.text('Stop'), findsOneWidget);

    await tester.tap(find.text('Stop'));
    await tester.pump();

    expect(player.stopped, isTrue);
    expect(find.text('Listen'), findsOneWidget);
  });

  testWidgets(
      'empty bytes (no listening_script yet) show "not available", never calls the player',
      (tester) async {
    final player = _FakePlayer();
    await tester.pumpWidget(_wrap(QuestionAudioPlayButton(
      player: player,
      fetchAudioBytes: () async => Uint8List(0),
    )));

    await tester.tap(find.text('Listen'));
    await tester.pump();
    await tester.pump();

    expect(find.text('Audio not available yet'), findsOneWidget);
    expect(player.playedBytes, isNull);
  });

  testWidgets('a fetch failure shows a retryable error state', (tester) async {
    final player = _FakePlayer();
    await tester.pumpWidget(_wrap(QuestionAudioPlayButton(
      player: player,
      fetchAudioBytes: () async => throw Exception('network down'),
    )));

    await tester.tap(find.text('Listen'));
    await tester.pump();
    await tester.pump();

    expect(find.textContaining('Couldn\'t play audio'), findsOneWidget);
  });

  testWidgets('onComplete firing on its own resets the button to idle',
      (tester) async {
    final player = _FakePlayer();
    await tester.pumpWidget(_wrap(QuestionAudioPlayButton(
      player: player,
      fetchAudioBytes: () async => Uint8List.fromList([1, 2, 3]),
    )));

    await tester.tap(find.text('Listen'));
    await tester.pump();
    await tester.pump();
    expect(find.text('Stop'), findsOneWidget);

    player.completeController.add(null);
    await tester.pump();

    expect(find.text('Listen'), findsOneWidget);
  });
}
