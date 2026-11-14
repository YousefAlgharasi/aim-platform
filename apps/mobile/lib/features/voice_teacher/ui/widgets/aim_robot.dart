// AimRobot — the AIM teacher robot.
//
// The picture (assets/robot/aim-robot.webp) is the robot with a blank face screen. The eyebrows, eyes and mouth are
// painted on top (in the picture's own 658x760 coordinates) so they can move: the eyes blink and glance around, and
// while the robot speaks the mouth opens and closes and the brows lift. The whole robot also moves softly: it breathes
// when idle, sways while speaking, leans in while listening and tilts while thinking. Its base stays put (it sits
// behind the text box). The state also shows as a soft glow behind it.
//
// Motion is off when the device asks to reduce motion.

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

enum RobotMood { idle, speaking, listening, thinking }

const double _kImageWidth = 658;
const double _kImageHeight = 760;

/// Width / height of the robot picture.
const double kRobotAspect = _kImageWidth / _kImageHeight;

class AimRobot extends StatefulWidget {
  const AimRobot({required this.mood, required this.height, super.key});

  final RobotMood mood;
  final double height;

  @override
  State<AimRobot> createState() => _AimRobotState();
}

class _AimRobotState extends State<AimRobot> with SingleTickerProviderStateMixin {
  late final Ticker _ticker = createTicker((elapsed) => _seconds.value = elapsed.inMicroseconds / 1e6);
  final ValueNotifier<double> _seconds = ValueNotifier<double>(0);
  bool _moving = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final reduce = MediaQuery.maybeOf(context)?.disableAnimations ?? false;
    if (reduce && _moving) {
      _ticker.stop();
      _moving = false;
    } else if (!reduce && !_moving) {
      _ticker.start();
      _moving = true;
    }
  }

  @override
  void dispose() {
    _ticker.dispose();
    _seconds.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final h = widget.height;
    final mood = widget.mood;
    return Semantics(
      excludeSemantics: true,
      child: SizedBox(
        width: h * kRobotAspect,
        height: h,
        child: ValueListenableBuilder<double>(
          valueListenable: _seconds,
          builder: (context, t, _) {
            final glow = _glowOpacity(mood, t);
            final body = _bodyPose(mood, t);
            return Stack(
              clipBehavior: Clip.none,
              children: [
                if (glow > 0)
                  Positioned.fill(
                    left: h * kRobotAspect * 0.02,
                    right: h * kRobotAspect * 0.02,
                    top: h * 0.06,
                    bottom: h * 0.14,
                    child: Opacity(
                      opacity: glow.clamp(0, 1),
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [_glowColor(mood).withValues(alpha: 0.5), _glowColor(mood).withValues(alpha: 0)],
                            stops: const [0, 0.72],
                          ),
                        ),
                      ),
                    ),
                  ),
                Positioned.fill(
                  child: Transform(
                    alignment: Alignment.bottomCenter,
                    transform: Matrix4.identity()
                      ..translateByDouble(0, body.dy * h, 0, 1)
                      ..rotateZ(body.rotation * 3.141592653589793 / 180)
                      ..scaleByDouble(body.scale, body.scale, 1, 1),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.asset('assets/robot/aim-robot.webp', fit: BoxFit.fill, filterQuality: FilterQuality.medium),
                        CustomPaint(painter: _FacePainter(mood: mood, t: t)),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

Color _glowColor(RobotMood mood) => mood == RobotMood.listening ? const Color(0xFFFF5D5D) : const Color(0xFF4F6BFF);

double _glowOpacity(RobotMood mood, double t) => switch (mood) {
      RobotMood.speaking => 0.4 + 0.6 * _wave(t / 1.8),
      RobotMood.listening => 1,
      RobotMood.thinking => 0.3 + 0.4 * _wave(t / 1.2),
      RobotMood.idle => 0,
    };

/// 0..1..0 smooth wave with the given period fraction (1.0 = one full cycle).
double _wave(double cycles) {
  final p = cycles - cycles.floorToDouble();
  return p < 0.5 ? Curves.easeInOut.transform(p * 2) : Curves.easeInOut.transform((1 - p) * 2);
}

/// Piecewise interpolation. [stops] rows are `[position 0..1, value...]`; every value column is eased between rows.
List<double> _keyframes(double progress, List<List<double>> stops) {
  final p = progress - progress.floorToDouble();
  for (var i = 0; i < stops.length - 1; i++) {
    final a = stops[i];
    final b = stops[i + 1];
    if (p >= a[0] && p <= b[0]) {
      final span = b[0] - a[0];
      final f = span == 0 ? 0.0 : Curves.easeInOut.transform((p - a[0]) / span);
      return [for (var k = 1; k < a.length; k++) a[k] + (b[k] - a[k]) * f];
    }
  }
  return stops.last.sublist(1);
}

class _BodyPose {
  const _BodyPose(this.dy, this.rotation, this.scale);
  final double dy; // fraction of the robot's height
  final double rotation; // degrees
  final double scale;
}

_BodyPose _bodyPose(RobotMood mood, double t) {
  switch (mood) {
    case RobotMood.speaking:
      final v = _keyframes(t / 1.25, const [
        [0, 0, -1.6, 1],
        [0.25, -0.022, 0, 1.02],
        [0.5, 0, 1.6, 1],
        [0.75, -0.022, 0, 1.02],
        [1, 0, -1.6, 1],
      ]);
      return _BodyPose(v[0], v[1], v[2]);
    case RobotMood.listening:
      final v = _keyframes(t / 2.4, const [
        [0, 0, 1, 1.03],
        [0.5, -0.008, 2, 1.045],
        [1, 0, 1, 1.03],
      ]);
      return _BodyPose(v[0], v[1], v[2]);
    case RobotMood.thinking:
      final v = _keyframes(t / 2.8, const [
        [0, 0, -2, 1],
        [0.5, 0, -3.5, 1.01],
        [1, 0, -2, 1],
      ]);
      return _BodyPose(v[0], v[1], v[2]);
    case RobotMood.idle:
      final v = _keyframes(t / 5, const [
        [0, 0, 0, 1],
        [0.5, -0.015, 0.8, 1.012],
        [1, 0, 0, 1],
      ]);
      return _BodyPose(v[0], v[1], v[2]);
  }
}

class _FacePainter extends CustomPainter {
  _FacePainter({required this.mood, required this.t});

  final RobotMood mood;
  final double t;

  static final Path _eyeA = Path()
    ..moveTo(193, 228)
    ..quadraticBezierTo(222, 170, 255, 222);
  static final Path _eyeB = Path()
    ..moveTo(323, 194)
    ..quadraticBezierTo(346, 138, 372, 184);
  static final Path _browA = Path()
    ..moveTo(184, 160)
    ..quadraticBezierTo(198, 140, 219, 141);
  static final Path _browB = Path()
    ..moveTo(322, 121)
    ..quadraticBezierTo(338, 107, 355, 112);
  static final Path _mouth = Path()
    ..moveTo(276, 238)
    ..quadraticBezierTo(301, 249, 326, 238)
    ..quadraticBezierTo(321, 270, 301, 270)
    ..quadraticBezierTo(281, 270, 276, 238)
    ..close();

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();
    canvas.scale(size.width / _kImageWidth, size.height / _kImageHeight);

    final speaking = mood == RobotMood.speaking;
    final lookPeriod = speaking ? 3.2 : 7.0;

    // Where the eyes glance (the mouth follows a little, for a feel of depth).
    var look = const [0.0, 0.0];
    if (mood == RobotMood.thinking) {
      look = const [8, -7];
    } else if (mood != RobotMood.listening) {
      look = _keyframes(t / lookPeriod, const [
        [0, 0, 0],
        [0.12, 0, 0],
        [0.24, -9, -2],
        [0.40, -9, -2],
        [0.54, 9, -3],
        [0.70, 9, -3],
        [0.82, 0, 2],
        [1, 0, 0],
      ]);
    }

    // Blink: every 4.6 s the eyes squash flat for an instant.
    final blinkPhase = (t % 4.6) / 4.6;
    final blink = blinkPhase < 0.93
        ? 1.0
        : blinkPhase < 0.96
            ? 1 - 0.92 * Curves.easeInOut.transform((blinkPhase - 0.93) / 0.03)
            : 1 - 0.92 * Curves.easeInOut.transform(1 - (blinkPhase - 0.96) / 0.04);
    final eyeScale = mood == RobotMood.listening ? 1.08 : 1.0;

    var browDy = mood == RobotMood.listening ? -5.0 : 0.0;
    if (speaking) {
      browDy += _keyframes(t / 0.9, const [
        [0, 0],
        [0.25, -5],
        [0.55, -2],
        [0.8, -6],
        [1, 0],
      ])[0];
    }

    // ── brows ──
    final browPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 7
      ..color = const Color(0xE6B8BDEE);
    canvas.save();
    canvas.translate(look[0], look[1] + browDy);
    canvas.drawPath(_browA, browPaint);
    canvas.drawPath(_browB, browPaint);
    canvas.restore();

    // ── eyes ──
    final glow = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 11
      ..color = const Color(0xE62898FF)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 5);
    final core = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 11
      ..color = const Color(0xFF46E3FF);
    for (final eye in [_eyeA, _eyeB]) {
      final c = eye.getBounds().center;
      canvas.save();
      canvas.translate(look[0], look[1]);
      canvas.translate(c.dx, c.dy);
      canvas.scale(eyeScale, blink * eyeScale);
      canvas.translate(-c.dx, -c.dy);
      canvas.drawPath(eye, glow);
      canvas.drawPath(eye, core);
      canvas.restore();
    }

    // ── mouth (hangs from its top edge, so it opens downwards) ──
    double mx = 1, my = 1;
    if (speaking) {
      final v = _keyframes(t / 0.62, const [
        [0, 1, 0.55],
        [0.14, 1.12, 1.55],
        [0.30, 0.92, 0.8],
        [0.46, 1.18, 1.9],
        [0.62, 0.95, 0.65],
        [0.78, 1.08, 1.4],
        [1, 1, 0.55],
      ]);
      mx = v[0];
      my = v[1];
    } else if (mood == RobotMood.thinking) {
      mx = 0.7;
      my = 0.35;
    }
    canvas.save();
    canvas.translate(look[0] * 0.33, look[1] * 0.33);
    canvas.translate(301, 238);
    canvas.scale(mx, my);
    canvas.translate(-301, -238);
    canvas.drawPath(
      _mouth,
      Paint()
        ..color = const Color(0xCC28DCFF)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 5),
    );
    canvas.drawPath(_mouth, Paint()..color = const Color(0xFF2EEAF3));
    canvas.restore();

    canvas.restore();
  }

  @override
  bool shouldRepaint(_FacePainter old) => old.t != t || old.mood != mood;
}
