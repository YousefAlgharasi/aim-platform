// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Splash"
//   docs/design/ui-for-all-system-mobile/screenshots/light/01-screen.png
//   docs/design/ui-for-all-system-mobile/design/AIM Mobile - Gen Z.dc.html
//   (lines 85-110 — the canonical HTML source for screen 1)
//
// Key design decisions from the HTML source:
//   • gz-hero gradient at 142deg (not 135deg)
//   • 3 decorative blobs: white (top-right, blob-shaped), lime/green (bottom-left,
//     blurred), coral/pink (mid-left, blurred circle)
//   • Badge: 108×108, radius 32, rgba(255,255,255,.18), 1.5px white border,
//     backdrop blur, outer glow blob
//   • Badge floats continuously (gz-float)
//   • Sparkle: a 4-pointed star (not auto_awesome), gz-lime color, flame animation
//   • AIM text: 60px, weight 800, letterSpacing 0.08em
//   • Progress bar: lime-green (#C8FF3D) with left-to-right shimmer animation,
//     160px wide, 6px tall, on a translucent white track
//
// Two-stage splash strategy (unchanged):
//   Stage 1 (native): Android/iOS shows static gradient + centered badge.
//   Stage 2 (this widget): FlutterNativeSplash.remove() fires after first frame,
//   then decorative elements and text animate in.
import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../auth/ui/widgets/auth_gate.dart';

/// Splash / bootstrap screen — Student Mobile App MVP.
///
/// Purely a branding + loading surface: the real auth-check work and the
/// resulting navigation are entirely owned by [AuthGate], which is mounted
/// unchanged in the [Stack] below. This widget only renders the gradient
/// hero, brand mark, and a progress affordance driven by
/// [authFlowProvider]'s `isChecking` flag — it never makes navigation
/// decisions itself.
///
/// Design system: all colours, typography, spacing use AIM Mobile Design
/// System tokens. The gz-hero gradient, lime shimmer, and blob shapes are
/// taken directly from the authoritative HTML design source.
class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage>
    with TickerProviderStateMixin {
  // ── Entry animation (fade+slide everything in after native splash) ────
  late final AnimationController _entryCtrl;
  late final Animation<double> _entryOpacity;
  late final Animation<Offset> _entrySlide;

  // ── Badge float animation ─────────────────────────────────────────────
  late final AnimationController _floatCtrl;
  late final Animation<double> _floatY;

  // ── Sparkle flame animation ───────────────────────────────────────────
  late final AnimationController _flameCtrl;
  late final Animation<double> _flameRotate;
  late final Animation<double> _flameScale;

  // ── Shimmer sweep across the progress bar ────────────────────────────
  late final AnimationController _shimmerCtrl;
  late final Animation<double> _shimmerX;

  // ── Blob morph animations ─────────────────────────────────────────────
  late final AnimationController _blob1Ctrl;
  late final AnimationController _blob2Ctrl;

  @override
  void initState() {
    super.initState();

    // Entry: 900ms fade + slide up for all Flutter-only elements.
    _entryCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _entryOpacity = CurvedAnimation(
      parent: _entryCtrl,
      curve: const Interval(0.0, 0.7, curve: Curves.easeOut),
    );
    _entrySlide = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _entryCtrl,
      curve: const Interval(0.0, 0.7, curve: Curves.easeOutCubic),
    ));

    // Badge float: 3.4 s sinusoidal bob (gz-float).
    _floatCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3400),
    )..repeat(reverse: true);
    _floatY = Tween<double>(begin: 0, end: -9).animate(
      CurvedAnimation(parent: _floatCtrl, curve: Curves.easeInOut),
    );

    // Sparkle flame: 1.8 s oscillating rotate + scale (gz-flame).
    _flameCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);
    _flameRotate =
        Tween<double>(begin: -5 * math.pi / 180, end: 5 * math.pi / 180)
            .animate(CurvedAnimation(
                parent: _flameCtrl, curve: Curves.easeInOut));
    _flameScale = Tween<double>(begin: 1.0, end: 1.12)
        .animate(CurvedAnimation(parent: _flameCtrl, curve: Curves.easeInOut));

    // Shimmer: 1.8 s sweeping translateX across the progress bar (gz-shimmer).
    _shimmerCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat();
    _shimmerX = Tween<double>(begin: -1.4, end: 4.2).animate(
      CurvedAnimation(parent: _shimmerCtrl, curve: Curves.easeInOut),
    );

    // Blob 1 (top-right, 9 s) and blob 2 (bottom-left, 7 s).
    _blob1Ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 9000),
    )..repeat(reverse: true);
    _blob2Ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 7000),
    )..repeat(reverse: true);

    // Remove the native splash after the first frame and start entry animation.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      FlutterNativeSplash.remove();
      _entryCtrl.forward();
    });
  }

  @override
  void dispose() {
    _entryCtrl.dispose();
    _floatCtrl.dispose();
    _flameCtrl.dispose();
    _shimmerCtrl.dispose();
    _blob1Ctrl.dispose();
    _blob2Ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authFlowProvider);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      body: Stack(
        children: [
          // ── gz-hero gradient (142 deg) ────────────────────────────────
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment(-0.74, -1.0),
                end: Alignment(0.74, 1.0),
                stops: [0.0, 0.46, 1.0],
                colors: [
                  Color(0xFF8B5CF6), // violet
                  Color(0xFF6C63FF), // purple
                  Color(0xFF5AC8FA), // sky
                ],
              ),
            ),
          ),

          // ── Blob 1: top-right, white morphing shape (gz-blob) ─────────
          FadeTransition(
            opacity: _entryOpacity,
            child: AnimatedBuilder(
              animation: _blob1Ctrl,
              builder: (_, __) {
                final r = BorderRadius.lerp(
                  const BorderRadius.only(
                    topLeft: Radius.circular(46),
                    topRight: Radius.circular(54),
                    bottomRight: Radius.circular(60),
                    bottomLeft: Radius.circular(40),
                  ),
                  const BorderRadius.only(
                    topLeft: Radius.circular(58),
                    topRight: Radius.circular(42),
                    bottomRight: Radius.circular(38),
                    bottomLeft: Radius.circular(62),
                  ),
                  _blob1Ctrl.value,
                )!;
                return Positioned(
                  top: -70,
                  right: -60,
                  child: Container(
                    width: 260,
                    height: 260,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.16),
                      borderRadius: r,
                    ),
                  ),
                );
              },
            ),
          ),

          // ── Blob 2: bottom-left, lime-green, blurred, floating ────────
          FadeTransition(
            opacity: _entryOpacity,
            child: AnimatedBuilder(
              animation: _blob2Ctrl,
              builder: (_, __) {
                final dy = -9.0 * math.sin(_blob2Ctrl.value * math.pi);
                return Positioned(
                  bottom: -50 + dy,
                  left: -70,
                  child: Container(
                    width: 240,
                    height: 240,
                    decoration: BoxDecoration(
                      color: const Color(0xFFC8FF3D).withValues(alpha: 0.18),
                      shape: BoxShape.circle,
                    ),
                    child: ClipOval(
                      child: BackdropFilter(
                        filter: ui.ImageFilter.blur(sigmaX: 6, sigmaY: 6),
                        child: const SizedBox.expand(),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // ── Blob 3: mid-left, coral/pink, blurred circle ──────────────
          FadeTransition(
            opacity: _entryOpacity,
            child: Positioned(
              top: 0,
              left: -30,
              right: 0,
              bottom: 0,
              child: Align(
                alignment: const Alignment(-1.0, -0.32),
                child: Container(
                  width: 90,
                  height: 90,
                  decoration: const BoxDecoration(
                    color: Color(0x47FF6B8A), // rgba(255,107,138,.28)
                    shape: BoxShape.circle,
                  ),
                  child: ClipOval(
                    child: BackdropFilter(
                      filter: ui.ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                      child: const SizedBox.expand(),
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ── Real auth-check + navigation (unchanged, untouched) ───────
          const AuthGate(),

          // ── Center column: floating badge + text ──────────────────────
          Center(
            child: FadeTransition(
              opacity: _entryOpacity,
              child: SlideTransition(
                position: _entrySlide,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Badge (floats, with outer glow + sparkle)
                    _AnimatedBadge(
                      floatY: _floatY,
                      flameRotate: _flameRotate,
                      flameScale: _flameScale,
                    ),
                    const SizedBox(height: 24),
                    // "AIM" — 60px, weight 800, letter-spacing 0.08em
                    Text(
                      l10n.onboardingBrandName,
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontWeight: FontWeight.w800,
                        fontSize: 60,
                        height: 1,
                        letterSpacing: 60 * 0.08,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    // "Academy of Intelligent Minds" — 15px, weight 700
                    Text(
                      l10n.onboardingTagline,
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        height: 1.4,
                        letterSpacing: 0.15,
                        color: Colors.white,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ── Progress bar + "Tap to continue" — pinned to bottom ───────
          if (authState.isChecking)
            Positioned(
              left: 40,
              right: 40,
              bottom: 48,
              child: FadeTransition(
                opacity: _entryOpacity,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _ShimmerProgressBar(shimmerX: _shimmerX),
                    const SizedBox(height: 16),
                    Text(
                      l10n.onboardingTapToContinue,
                      style: const TextStyle(
                        fontFamily: 'Inter',
                        fontWeight: FontWeight.w600,
                        fontSize: 12,
                        letterSpacing: 0.04 * 12,
                        color: Color(0xC7FFFFFF), // rgba(255,255,255,.78)
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge: 108×108, frosted-glass, outer glow, floating + flame sparkle.
// ─────────────────────────────────────────────────────────────────────────────
class _AnimatedBadge extends StatelessWidget {
  const _AnimatedBadge({
    required this.floatY,
    required this.flameRotate,
    required this.flameScale,
  });

  final Animation<double> floatY;
  final Animation<double> flameRotate;
  final Animation<double> flameScale;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([floatY, flameRotate, flameScale]),
      builder: (_, __) {
        return Transform.translate(
          offset: Offset(0, floatY.value),
          child: SizedBox(
            // Extra room for sparkle that hangs outside the badge
            width: 108 + 48,
            height: 108 + 48,
            child: Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                // Outer glow (position:absolute inset:-18px, blur:14px)
                Positioned(
                  top: 9,
                  left: 9,
                  right: 9,
                  bottom: 9,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.16),
                      borderRadius: BorderRadius.circular(34),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(34),
                      child: BackdropFilter(
                        filter: ui.ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                        child: const SizedBox.expand(),
                      ),
                    ),
                  ),
                ),

                // Glass badge
                Center(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(32),
                    child: BackdropFilter(
                      filter: ui.ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                      child: Container(
                        width: 108,
                        height: 108,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(32),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.4),
                            width: 1.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.35),
                              blurRadius: 50,
                              offset: const Offset(0, 20),
                              spreadRadius: -16,
                            ),
                          ],
                        ),
                        child: Center(
                          child: CustomPaint(
                            size: const Size(58, 58),
                            painter: _GraduationCapPainter(),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),

                // Sparkle: gz-lime star, top-right, flame animation
                Positioned(
                  top: 6,
                  right: 6,
                  child: Transform.rotate(
                    angle: flameRotate.value,
                    child: Transform.scale(
                      scale: flameScale.value,
                      child: const _StarSparkle(size: 26),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Graduation cap outline SVG (2 px stroke, white).
// ─────────────────────────────────────────────────────────────────────────────
class _GraduationCapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = 2.0 * (size.width / 24)
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final s = size.width / 24;

    // Hat top: M22 10 12 5 2 10l10 5 10-5Z
    final hat = Path()
      ..moveTo(22 * s, 10 * s)
      ..lineTo(12 * s, 5 * s)
      ..lineTo(2 * s, 10 * s)
      ..lineTo(12 * s, 15 * s)
      ..lineTo(22 * s, 10 * s)
      ..close();
    canvas.drawPath(hat, paint);

    // Gown: M6 12v5c0 1 2.7 3 6 3s6-2 6-3v-5
    final gown = Path()
      ..moveTo(6 * s, 12 * s)
      ..lineTo(6 * s, 17 * s)
      ..cubicTo(6 * s, 18 * s, 8.7 * s, 20 * s, 12 * s, 20 * s)
      ..cubicTo(15.3 * s, 20 * s, 18 * s, 18 * s, 18 * s, 17 * s)
      ..lineTo(18 * s, 12 * s);
    canvas.drawPath(gown, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4-pointed star sparkle (gz-lime = #C8FF3D).
// ─────────────────────────────────────────────────────────────────────────────
class _StarSparkle extends StatelessWidget {
  const _StarSparkle({required this.size});
  final double size;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _StarPainter(),
    );
  }
}

class _StarPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFC8FF3D)
      ..style = PaintingStyle.fill;

    final s = size.width / 24;

    // SVG path: "m12 2 1.9 5.8a2 2 0 0 0 1.3 1.3L21 11l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 20l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 11l5.8-1.9a2 2 0 0 0 1.3-1.3z"
    final path = Path()
      ..moveTo(12 * s, 2 * s)
      ..lineTo(13.9 * s, 7.8 * s)
      ..cubicTo(14.2 * s, 8.7 * s, 14.9 * s, 9.4 * s, 15.8 * s, 9.7 * s)
      ..lineTo(21 * s, 11 * s)
      ..lineTo(15.2 * s, 12.9 * s)
      ..cubicTo(14.3 * s, 13.2 * s, 13.6 * s, 13.9 * s, 13.3 * s, 14.8 * s)
      ..lineTo(12 * s, 20 * s)
      ..lineTo(10.1 * s, 14.2 * s)
      ..cubicTo(9.8 * s, 13.3 * s, 9.1 * s, 12.6 * s, 8.2 * s, 12.3 * s)
      ..lineTo(3 * s, 11 * s)
      ..lineTo(8.8 * s, 9.1 * s)
      ..cubicTo(9.7 * s, 8.8 * s, 10.4 * s, 8.1 * s, 10.7 * s, 7.2 * s)
      ..close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lime-green shimmer progress bar.
// 160 px wide, 6 px tall, pill. gz-lime sweep with glow.
// ─────────────────────────────────────────────────────────────────────────────
class _ShimmerProgressBar extends StatelessWidget {
  const _ShimmerProgressBar({required this.shimmerX});
  final Animation<double> shimmerX;

  static const double _barWidth = 160;
  static const double _sweepWidth = _barWidth * 0.42;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: _barWidth,
      height: 6,
      child: AnimatedBuilder(
        animation: shimmerX,
        builder: (_, __) {
          // shimmerX ranges -1.4 → 4.2; multiply by sweepWidth for px offset.
          final dx = shimmerX.value * _sweepWidth;
          return ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: Stack(
              children: [
                // Track
                Container(color: Colors.white.withValues(alpha: 0.25)),
                // Sweep
                Transform.translate(
                  offset: Offset(dx, 0),
                  child: Container(
                    width: _sweepWidth,
                    decoration: BoxDecoration(
                      color: const Color(0xFFC8FF3D),
                      borderRadius: BorderRadius.circular(999),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0xB3C8FF3D),
                          blurRadius: 12,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
