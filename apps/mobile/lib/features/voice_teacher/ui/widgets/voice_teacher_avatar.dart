// VoiceTeacherAvatar — abstract, illustrated AI-teacher avatar.
//
// Deliberately not a stock photo of a person: a soft gradient orb built from
// the app's own brand gradient (AimGradients.gzHero) and logo motif (a small
// graduation-cap badge, echoing assets/splash/splash_logo.png), with a
// simple face that changes expression per [VoiceAvatarMood] — animated
// waveform "mouth" while speaking, a mic glyph while the student's turn is
// being recorded, a spinner while processing, and a calm neutral mouth while
// idle/awaiting the student's press. No network/asset dependency; entirely
// vector shapes + one design-system waveform widget, so it needs no external
// image and matches light/dark theme via app-wide brand colors already used
// elsewhere in this screen (the gzHero gradient background).

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/design_tokens/design_tokens.dart';
import 'voice_waveform_indicator.dart';

enum VoiceAvatarMood { speaking, listening, recording, processing }

class VoiceTeacherAvatar extends StatefulWidget {
  const VoiceTeacherAvatar({required this.mood, this.size = 200, super.key});

  final VoiceAvatarMood mood;
  final double size;

  @override
  State<VoiceTeacherAvatar> createState() => _VoiceTeacherAvatarState();
}

class _VoiceTeacherAvatarState extends State<VoiceTeacherAvatar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1600),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  Color _ringColor(VoiceAvatarMood mood) => switch (mood) {
        VoiceAvatarMood.speaking => AimColors.gzLime,
        VoiceAvatarMood.recording => AimColors.gzCoral,
        VoiceAvatarMood.processing => AimColors.gzSky,
        VoiceAvatarMood.listening => AimColors.neutral0,
      };

  @override
  Widget build(BuildContext context) {
    final reduceMotion = MediaQuery.of(context).disableAnimations;
    final mood = widget.mood;
    final size = widget.size;
    final animated = mood != VoiceAvatarMood.listening;
    final ringColor = _ringColor(mood);

    return SizedBox(
      width: size * 1.4,
      height: size * 1.4,
      child: Stack(
        alignment: Alignment.center,
        children: [
          if (animated)
            AnimatedBuilder(
              animation: _pulse,
              builder: (context, _) {
                final t = reduceMotion ? 0.0 : _pulse.value;
                return Container(
                  width: size * (1.12 + t * 0.18),
                  height: size * (1.12 + t * 0.18),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: ringColor.withValues(alpha: 0.22 * (1 - t)),
                  ),
                );
              },
            ),
          AnimatedBuilder(
            animation: _pulse,
            builder: (context, child) {
              final t = reduceMotion ? 0.0 : _pulse.value;
              final scale = animated ? 1.0 + (t * 0.035) : 1.0;
              return Transform.scale(scale: scale, child: child);
            },
            child: Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: AimGradients.gzHero,
                border: Border.all(
                  color: AimColors.neutral0.withValues(alpha: 0.5),
                  width: 4,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AimColors.gzPurple.withValues(alpha: 0.35),
                    blurRadius: 30,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: _AvatarFace(mood: mood, size: size),
            ),
          ),
          Positioned(
            top: size * 0.04,
            right: size * 0.04,
            child: Container(
              width: size * 0.24,
              height: size * 0.24,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AimColors.neutral0,
                shape: BoxShape.circle,
                border: Border.all(color: AimColors.warning500, width: 2.5),
              ),
              child: Icon(
                Icons.school_rounded,
                color: AimColors.primary600,
                size: size * 0.13,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AvatarFace extends StatelessWidget {
  const _AvatarFace({required this.mood, required this.size});

  final VoiceAvatarMood mood;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _Eye(size: size),
            SizedBox(width: size * 0.2),
            _Eye(size: size),
          ],
        ),
        SizedBox(height: size * 0.14),
        SizedBox(
          height: size * 0.18,
          child: Center(child: _AvatarMouth(mood: mood, size: size)),
        ),
      ],
    );
  }
}

class _Eye extends StatelessWidget {
  const _Eye({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size * 0.085,
      height: size * 0.085,
      decoration: const BoxDecoration(
        color: AimColors.neutral0,
        shape: BoxShape.circle,
      ),
    );
  }
}

class _AvatarMouth extends StatelessWidget {
  const _AvatarMouth({required this.mood, required this.size});

  final VoiceAvatarMood mood;
  final double size;

  @override
  Widget build(BuildContext context) {
    return switch (mood) {
      VoiceAvatarMood.speaking => VoiceWaveformIndicator(
          active: true,
          color: AimColors.neutral0,
          height: size * 0.16,
          barCount: 5,
        ),
      VoiceAvatarMood.recording => Icon(
          Icons.mic_rounded,
          color: AimColors.neutral0,
          size: size * 0.16,
        ),
      VoiceAvatarMood.processing => SizedBox(
          width: size * 0.13,
          height: size * 0.13,
          child: const CircularProgressIndicator(
            strokeWidth: 3,
            valueColor: AlwaysStoppedAnimation<Color>(AimColors.neutral0),
          ),
        ),
      VoiceAvatarMood.listening => Container(
          width: size * 0.22,
          height: size * 0.045,
          decoration: BoxDecoration(
            color: AimColors.neutral0.withValues(alpha: 0.85),
            borderRadius: BorderRadius.circular(20),
          ),
        ),
    };
  }
}
