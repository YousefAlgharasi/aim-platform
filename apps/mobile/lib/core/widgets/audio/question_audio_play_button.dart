// QuestionAudioPlayButton — shared "Listen" control for any listening-type
// question (placement test, lesson practice). Plays backend-synthesized
// audio bytes fetched on tap; never synthesizes, transcribes, or interprets
// audio itself — purely a playback affordance over bytes the caller fetches.
//
// Reuses the same audioplayers-backed player abstraction the AI Teacher
// voice feature already uses (VoicePlayerClient/RealVoicePlayerClient) so
// this widget can be unit-tested with a fake player, exactly like
// VoicePlaybackNotifier already is.

import 'dart:async';
import 'dart:typed_data';

import 'package:flutter/material.dart';

import 'package:aim_mobile/features/voice_teacher/logic/voice_player_client.dart';

import '../../theme/theme.dart';

enum QuestionAudioButtonState { idle, loading, playing, unavailable, error }

class QuestionAudioPlayButton extends StatefulWidget {
  const QuestionAudioPlayButton({
    required this.fetchAudioBytes,
    super.key,
    this.player,
    this.label = 'Listen',
  });

  /// Fetches the audio bytes to play. An empty list means the backend has
  /// no audio available yet (a real content gap, e.g. no listening_script
  /// authored) — shown as "Audio not available yet", not an error.
  final Future<Uint8List> Function() fetchAudioBytes;

  final String label;

  /// Injectable for widget tests, which have no platform channel to back
  /// the real audioplayers plugin. Defaults to [RealVoicePlayerClient].
  final VoicePlayerClient? player;

  @override
  State<QuestionAudioPlayButton> createState() =>
      _QuestionAudioPlayButtonState();
}

class _QuestionAudioPlayButtonState extends State<QuestionAudioPlayButton> {
  late final VoicePlayerClient _player = widget.player ?? RealVoicePlayerClient();
  late final StreamSubscription<void> _completeSubscription;
  QuestionAudioButtonState _state = QuestionAudioButtonState.idle;

  @override
  void initState() {
    super.initState();
    _completeSubscription = _player.onComplete.listen((_) {
      if (mounted) setState(() => _state = QuestionAudioButtonState.idle);
    });
  }

  @override
  void dispose() {
    unawaited(_completeSubscription.cancel());
    _player.dispose();
    super.dispose();
  }

  Future<void> _onTap() async {
    if (_state == QuestionAudioButtonState.playing) {
      await _player.stop();
      if (mounted) setState(() => _state = QuestionAudioButtonState.idle);
      return;
    }

    setState(() => _state = QuestionAudioButtonState.loading);
    try {
      final bytes = await widget.fetchAudioBytes();
      if (bytes.isEmpty) {
        if (mounted) {
          setState(() => _state = QuestionAudioButtonState.unavailable);
        }
        return;
      }
      await _player.playBytes(bytes);
      if (mounted) setState(() => _state = QuestionAudioButtonState.playing);
    } catch (_) {
      if (mounted) setState(() => _state = QuestionAudioButtonState.error);
    }
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    final (icon, text, color) = switch (_state) {
      QuestionAudioButtonState.idle => (
          Icons.volume_up_outlined,
          widget.label,
          surfaces.textSecondary,
        ),
      QuestionAudioButtonState.loading => (
          Icons.hourglass_top,
          'Loading…',
          surfaces.textSecondary,
        ),
      QuestionAudioButtonState.playing => (
          Icons.stop_circle_outlined,
          'Stop',
          AimColors.primary500,
        ),
      QuestionAudioButtonState.unavailable => (
          Icons.volume_off_outlined,
          'Audio not available yet',
          surfaces.textMuted,
        ),
      QuestionAudioButtonState.error => (
          Icons.error_outline,
          'Couldn\'t play audio — tap to retry',
          AimColors.error500,
        ),
    };

    final canTap = _state != QuestionAudioButtonState.loading &&
        _state != QuestionAudioButtonState.unavailable;
    final soft = aimSoftFillsOf(context);

    // A single tap target for the whole control (icon + label) — the icon
    // is decorative (soft-pill styling matching AIMIconButton's look,
    // without a second independent tap handler), so a tap anywhere on the
    // row always reaches _onTap exactly once.
    return Semantics(
      button: true,
      label: text,
      excludeSemantics: true,
      child: InkWell(
        onTap: canTap ? _onTap : null,
        borderRadius: AimRadius.borderMd,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AimSpacing.space4,
            vertical: AimSpacing.space4,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              DecoratedBox(
                decoration: BoxDecoration(
                  color: canTap ? soft.primary : surfaces.surfaceSunken,
                  shape: BoxShape.circle,
                ),
                child: Padding(
                  padding: const EdgeInsets.all(AimSpacing.space8),
                  child: Icon(
                    icon,
                    size: AimSizes.iconSm,
                    color: canTap ? soft.onPrimary : surfaces.disabledFg,
                  ),
                ),
              ),
              const SizedBox(width: AimSpacing.space8),
              Text(
                text,
                style: AimTextStyles.label.copyWith(color: color),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
