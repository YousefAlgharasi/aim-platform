// Bugfix: VoicePlaybackNotifier previously fetched audio bytes and flipped
// its state to "playing" without ever actually playing them through any
// audio output, and stop/pause/resume never controlled any real player
// either. These tests prove the notifier now actually delegates to its
// VoicePlayerClient for every one of those operations.

import 'dart:async';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/voice_teacher/logic/provider/voice_playback_notifier.dart';
import 'package:aim_mobile/features/voice_teacher/logic/voice_player_client.dart';

class _FakePlayer implements VoicePlayerClient {
  final completeController = StreamController<void>.broadcast();

  Uint8List? playedBytes;
  bool stopped = false;
  bool paused = false;
  bool resumed = false;
  bool disposed = false;
  Object? playThrows;

  @override
  Future<void> playBytes(Uint8List bytes) async {
    if (playThrows != null) throw playThrows!;
    playedBytes = bytes;
  }

  @override
  Future<void> pause() async => paused = true;

  @override
  Future<void> resume() async => resumed = true;

  @override
  Future<void> stop() async => stopped = true;

  @override
  Stream<void> get onComplete => completeController.stream;

  @override
  void dispose() {
    disposed = true;
    unawaited(completeController.close());
  }
}

void main() {
  group('VoicePlaybackNotifier', () {
    test('loadAndPlay fetches bytes then actually plays them via the player', () async {
      final player = _FakePlayer();
      final notifier = VoicePlaybackNotifier(player: player);

      await notifier.loadAndPlay(
        audioRef: 'ref-1',
        fetchAudioFn: (_) async => Uint8List.fromList([9, 8, 7]),
      );

      expect(player.playedBytes, [9, 8, 7]);
      expect(notifier.state, PlaybackState.playing);
    });

    test('goes to error state without crashing when playback itself throws', () async {
      final player = _FakePlayer()..playThrows = Exception('no output device');
      final notifier = VoicePlaybackNotifier(player: player);

      await notifier.loadAndPlay(
        audioRef: 'ref-1',
        fetchAudioFn: (_) async => Uint8List(3),
      );

      expect(notifier.state, PlaybackState.error);
    });

    test('stop() actually stops the real player, not just local state', () {
      final player = _FakePlayer();
      final notifier = VoicePlaybackNotifier(player: player);

      notifier.stop();

      expect(player.stopped, isTrue);
      expect(notifier.state, PlaybackState.idle);
    });

    test('pause()/resume() actually control the real player', () async {
      final player = _FakePlayer();
      final notifier = VoicePlaybackNotifier(player: player);
      await notifier.loadAndPlay(
        audioRef: 'ref-1',
        fetchAudioFn: (_) async => Uint8List(3),
      );

      notifier.pause();
      expect(player.paused, isTrue);
      expect(notifier.state, PlaybackState.paused);

      notifier.resume();
      expect(player.resumed, isTrue);
      expect(notifier.state, PlaybackState.playing);
    });

    test('transitions to completed when the player reports natural completion', () async {
      final player = _FakePlayer();
      final notifier = VoicePlaybackNotifier(player: player);
      await notifier.loadAndPlay(
        audioRef: 'ref-1',
        fetchAudioFn: (_) async => Uint8List(3),
      );

      player.completeController.add(null);
      await Future<void>.delayed(Duration.zero);

      expect(notifier.state, PlaybackState.completed);
    });

    test('dispose() disposes the underlying player', () {
      final player = _FakePlayer();
      final notifier = VoicePlaybackNotifier(player: player);

      notifier.dispose();

      expect(player.disposed, isTrue);
    });
  });
}
