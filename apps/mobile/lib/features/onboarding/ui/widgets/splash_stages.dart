// The launch stages drawn by SplashPage.
//
// Stage 1 ([SplashStageOne]) continues the native Android splash (radial brand
// gradient behind the original AIM logo, same 128dp size, centred) so removing
// the native splash causes no visible jump.
//
// Stage 2 ([SplashStageTwo]) is the dark in-app backdrop: the same blue family,
// soft lights, a faint wordmark pattern and the app icon with its name.
//
// [SplashLogoLayer] is the single logo drawn above both: it settles into
// focus, grows, and its letters light up in turn as the loader.
//
// Built from design tokens only — no invented logo or extra colours.

import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:flutter/material.dart';

import '../../../../core/design_tokens/design_tokens.dart';
import '../../../../l10n/app_localizations.dart';

/// The original AIM logo (white wordmark + "YOUR AI MIND COACH" tagline).
const String kSplashLogoAsset = 'assets/splash/splash_logo.png';

/// Logo box used by the native splash (drawable-mdpi/splash.png is 128px = 128dp).
const double kNativeSplashLogoSize = 128;

/// Where the "AIM" wordmark and the tagline sit inside splash_logo.png
/// (fractions of the image height) — measured from the original asset.
const double _wordmarkBottom = 0.54;
const double _wordmarkCenterY = 0.445;

/// Horizontal extent of each letter in the logo (fractions of image width),
/// cut at the middle of the gaps between letters. Measured from the asset.
const List<(double, double)> _letterSpans = [
  (0.300, 0.4629), // A
  (0.4629, 0.5186), // I
  (0.5186, 0.700), // M
];

/// Stage 1 backdrop: identical to the native splash (radial brand gradient).
class SplashStageOne extends StatelessWidget {
  const SplashStageOne({super.key, required this.progress});

  /// 0 → 1 over the stage-1 intro (rings fade in).
  final Animation<double> progress;

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: Stack(
        fit: StackFit.expand,
        children: [
          const DecoratedBox(
            decoration: BoxDecoration(gradient: AimGradients.splash),
          ),
          // Rings are not part of the native frame, so they fade in softly.
          CustomPaint(painter: _RingsPainter(progress)),
        ],
      ),
    );
  }
}

/// Stage 2 backdrop: the same radial gradient geometry as stage 1 but in a
/// deep, dark tone of the same purple, with two soft lights of that same hue
/// and the faint wordmark pattern. The centre glow sits exactly where stage
/// 1's does, so the cross-fade between them is continuous.
class SplashStageTwo extends StatelessWidget {
  const SplashStageTwo({
    super.key,
    required this.reveal,
    required this.ambient,
  });

  /// 0 → 1: fades the pattern in (follows the stage cross-fade).
  final Animation<double> reveal;

  /// Repeating 0 → 1: drifting lights.
  final Animation<double> ambient;

  static final Color _dark = AimColorTheme.dark.background;

  /// Brand purple pulled toward the app's dark background.
  static Color tone(Color brand, double amount) =>
      Color.lerp(_dark, brand, amount)!;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    return RepaintBoundary(
      child: Stack(
        fit: StackFit.expand,
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: const Alignment(0.0, -0.1),
                radius: 1.0,
                colors: [
                  tone(AimColors.primary400, 0.34),
                  tone(AimColors.primary600, 0.1)
                ],
              ),
            ),
          ),
          CustomPaint(painter: _LightsPainter(ambient)),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            height: size.height * 0.27,
            child: FadeTransition(
              opacity: reveal,
              child: const RepaintBoundary(child: _BrandPattern()),
            ),
          ),
          // App icon (the in-app AIM badge) with the app name under it.
          Positioned(
            left: 0,
            right: 0,
            bottom: MediaQuery.paddingOf(context).bottom + size.height * 0.1,
            child: FadeTransition(
              opacity: reveal,
              child: const _AppIdentity(),
            ),
          ),
        ],
      ),
    );
  }
}

/// The app icon with the app name beneath it.
class _AppIdentity extends StatelessWidget {
  const _AppIdentity();

  @override
  Widget build(BuildContext context) {
    final name = Localizations.of<AppLocalizations>(context, AppLocalizations)
            ?.homeAppName ??
        'AIM English';
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // The actual app icon (same artwork as the launcher icon).
        Image.asset(
          'assets/images/app_icon.png',
          width: 56,
          height: 56,
          filterQuality: FilterQuality.medium,
          excludeFromSemantics: true,
        ),
        const SizedBox(height: 10),
        Text(
          name,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.85),
            fontWeight: FontWeight.w700,
            fontSize: 15,
            letterSpacing: 0.4,
          ),
        ),
      ],
    );
  }
}

/// The single logo layer drawn above both backdrops, so the logo never
/// cross-fades between two copies (no ghosting): it starts exactly as the
/// native splash's logo (128dp, sharp, centred), settles into focus, then
/// smoothly grows while the tagline gives way to a ring loader.
class SplashLogoLayer extends StatelessWidget {
  const SplashLogoLayer({
    super.key,
    required this.intro,
    required this.zoom,
    required this.morph,
    required this.wave,
    required this.ambient,
  });

  /// Repeating 0 → 1, started exactly when the loader appears, so the light
  /// always begins on the first letter (A).
  final Animation<double> wave;

  /// 0 → 1: blur-to-focus settle (stage 1).
  final Animation<double> intro;

  /// 0 → 1: logo grows from the native size to its stage-2 size.
  final Animation<double> zoom;

  /// 0 → 1: tagline fades; the letters start their light-up loading wave.
  final Animation<double> morph;

  /// Repeating 0 → 1: letter light wave + breathing.
  final Animation<double> ambient;

  @override
  Widget build(BuildContext context) {
    const base = kNativeSplashLogoSize;
    final target =
        (MediaQuery.sizeOf(context).shortestSide * 0.5).clamp(160.0, 240.0);
    final growth = target / base;

    return RepaintBoundary(
      child: Center(
        child: AnimatedBuilder(
          animation: Listenable.merge([intro, zoom, morph, wave, ambient]),
          builder: (context, _) {
            final i = Curves.easeOut.transform(intro.value);
            final z = Curves.easeInOutCubic.transform(zoom.value);
            final m = Curves.easeInOut.transform(morph.value);
            final settle = 1 + 0.08 * math.sin(math.pi * intro.value);
            final breathe =
                1 + 0.02 * math.sin(ambient.value * 2 * math.pi) * z;
            final scale = settle * (1 + (growth - 1) * z) * breathe;
            final sigma = 2 + 14 * (1 - i);

            return Transform.scale(
              scale: scale,
              child: SizedBox(
                width: base,
                height: base,
                child: Stack(
                  alignment: Alignment.center,
                  clipBehavior: Clip.none,
                  children: [
                    if (intro.value < 1)
                      Opacity(
                        opacity: (1 - i) * 0.9,
                        child: ImageFiltered(
                          imageFilter: ui.ImageFilter.blur(
                            sigmaX: sigma,
                            sigmaY: sigma,
                          ),
                          child: const _Logo(size: base),
                        ),
                      ),
                    // Wordmark as three letters. Once the tagline has gone
                    // (m → 1) they light up one after another — the logo
                    // itself is the loader. Letters never move off the
                    // original wordmark position.
                    for (var k = 0; k < _letterSpans.length; k++)
                      _LoaderLetter(
                        size: base,
                        span: _letterSpans[k],
                        lit: _letterPulse(wave.value, k),
                        loading: m,
                      ),
                    // Tagline: fades out as the loader forms.
                    Opacity(
                      opacity: 1 - m,
                      child: const _LogoRegion(
                        size: base,
                        top: _wordmarkBottom,
                        bottom: 1,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

/// A horizontal band of the logo image, drawn in place (not re-centred).
class _LogoRegion extends StatelessWidget {
  const _LogoRegion({
    required this.size,
    required this.top,
    required this.bottom,
  });

  final double size;
  final double top;
  final double bottom;

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      clipper: _RectClipper(0, top, 1, bottom),
      child: _Logo(size: size),
    );
  }
}

/// Staggered, tinted copies of the real wordmark — like a watermark.
class _BrandPattern extends StatelessWidget {
  const _BrandPattern();

  @override
  Widget build(BuildContext context) {
    const cell = 46.0;
    return ShaderMask(
      blendMode: BlendMode.dstIn,
      shaderCallback: (rect) => const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Color(0x00FFFFFF), Color(0xFFFFFFFF)],
      ).createShader(rect),
      child: LayoutBuilder(
        builder: (context, c) {
          final cols = (c.maxWidth / cell).ceil() + 1;
          final rows = (c.maxHeight / (cell * 0.8)).ceil() + 1;
          return ClipRect(
            child: Stack(
              children: [
                for (var r = 0; r < rows; r++)
                  for (var col = 0; col < cols; col++)
                    Positioned(
                      left: col * cell + (r.isOdd ? cell / 2 : 0) - cell / 2,
                      top: r * cell * 0.8,
                      width: cell * 0.7,
                      height: cell * 0.7 * 0.19 / 0.40,
                      child: const ColorFiltered(
                        colorFilter: ColorFilter.mode(
                          AimColors.primary400,
                          BlendMode.srcIn,
                        ),
                        child: Opacity(
                          opacity: 0.16,
                          child: FittedBox(
                            fit: BoxFit.fitWidth,
                            child: SizedBox(
                              width: 100,
                              height: 100 * 0.19 / 0.40,
                              child: ClipRect(
                                child: OverflowBox(
                                  maxWidth: 100 / 0.40,
                                  maxHeight: 100 / 0.40,
                                  alignment: Alignment(0, -0.11),
                                  child: _Logo(size: 100 / 0.40),
                                ),
                              ),
                            ),
                          ),
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

/// 0 → 1 → 0 light level of letter [index] at wave position [t] (one wave per
/// loop). Each letter lags the previous one, so the light travels A → I → M and
/// at t = 0 it is just about to start on A. Continuous at the loop seam.
double _letterPulse(double t, int index) {
  final u = (t - index * 0.16) % 1.0;
  if (u > 0.55) return 0;
  final v = math.sin(math.pi * u / 0.55);
  return v * v;
}

/// One letter of the wordmark, drawn in place. While [loading] > 0 it dims and
/// lights up with [lit]: a small scale pulse plus a soft brand-blue glow.
class _LoaderLetter extends StatelessWidget {
  const _LoaderLetter({
    required this.size,
    required this.span,
    required this.lit,
    required this.loading,
  });

  final double size;
  final (double, double) span;
  final double lit;
  final double loading;

  static const double _dimmest = 0.45;

  @override
  Widget build(BuildContext context) {
    final letter = ClipRect(
      clipper: _RectClipper(span.$1, 0, span.$2, _wordmarkBottom),
      child: _Logo(size: size),
    );
    if (loading <= 0) return letter;

    final level = _dimmest + (1 - _dimmest) * lit;
    final opacity = 1 - loading * (1 - level);
    final center = Alignment(
      (span.$1 + span.$2) - 1, // centre x as fraction → -1..1
      _wordmarkCenterY * 2 - 1,
    );
    return Transform.scale(
      scale: 1 + 0.12 * lit * loading,
      alignment: center,
      child: Stack(
        children: [
          if (lit > 0.02)
            Opacity(
              opacity: lit * 0.9 * loading,
              child: ImageFiltered(
                imageFilter: ui.ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                child: ColorFiltered(
                  colorFilter: const ColorFilter.mode(
                    AimColors.primary200,
                    BlendMode.srcIn,
                  ),
                  child: letter,
                ),
              ),
            ),
          Opacity(opacity: opacity, child: letter),
        ],
      ),
    );
  }
}

class _RectClipper extends CustomClipper<Rect> {
  const _RectClipper(this.left, this.top, this.right, this.bottom);

  final double left;
  final double top;
  final double right;
  final double bottom;

  @override
  Rect getClip(Size size) => Rect.fromLTRB(
        size.width * left,
        size.height * top,
        size.width * right,
        size.height * bottom,
      );

  @override
  bool shouldReclip(covariant _RectClipper old) =>
      old.left != left ||
      old.top != top ||
      old.right != right ||
      old.bottom != bottom;
}

class _Logo extends StatelessWidget {
  const _Logo({required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      kSplashLogoAsset,
      width: size,
      height: size,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.medium,
      excludeFromSemantics: true,
    );
  }
}

/// Concentric rings from the original splash artwork, fading in with [t].
class _RingsPainter extends CustomPainter {
  _RingsPainter(this.t) : super(repaint: t);

  final Animation<double> t;

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height * 0.45);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;
    const radii = [140.0, 240.0, 350.0, 470.0, 600.0];
    final fade = Curves.easeOut.transform(t.value);
    for (var i = 0; i < radii.length; i++) {
      paint.color = Colors.white.withValues(alpha: (0.05 - i * 0.008) * fade);
      canvas.drawCircle(center, radii[i], paint);
    }
  }

  @override
  bool shouldRepaint(covariant _RingsPainter old) => false;
}

/// Two soft lights drifting on the dark base. Plain radial gradients — no blur
/// filters — so it stays cheap per frame.
class _LightsPainter extends CustomPainter {
  _LightsPainter(this.t) : super(repaint: t);

  final Animation<double> t;

  @override
  void paint(Canvas canvas, Size size) {
    final a = t.value * 2 * math.pi;
    final r = size.shortestSide * 0.95;

    void light(Offset c, Color color, double alpha) {
      final rect = Rect.fromCircle(center: c, radius: r);
      canvas.drawRect(
        Offset.zero & size,
        Paint()
          ..shader = RadialGradient(
            colors: [
              color.withValues(alpha: alpha),
              color.withValues(alpha: 0)
            ],
          ).createShader(rect),
      );
    }

    // Both lights are the launch-gradient blue, so the screen reads as one
    // colour family.
    light(
      Offset(size.width * (0.15 + 0.05 * math.sin(a)),
          size.height * (0.22 + 0.03 * math.cos(a))),
      AimColors.primary400,
      0.22,
    );
    light(
      Offset(size.width * (0.88 + 0.04 * math.cos(a)),
          size.height * (0.78 + 0.03 * math.sin(a))),
      AimColors.primary600,
      0.3,
    );
  }

  @override
  bool shouldRepaint(covariant _LightsPainter old) => false;
}
