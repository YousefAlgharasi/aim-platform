import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/theme.dart';
import '../../../auth/ui/widgets/auth_gate.dart';

/// Splash / bootstrap screen — AIM Mobile.
class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage>
    with SingleTickerProviderStateMixin {
  late final AnimationController _entryCtrl;
  late final Animation<double> _entryOpacity;
  late final Animation<Offset> _entrySlide;

  @override
  void initState() {
    super.initState();

    _entryCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _entryOpacity = CurvedAnimation(
      parent: _entryCtrl,
      curve: const Interval(0.0, 0.7, curve: Curves.easeOut),
    );
    _entrySlide = Tween<Offset>(
      begin: const Offset(0, 0.05),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _entryCtrl,
      curve: const Interval(0.0, 0.7, curve: Curves.easeOutCubic),
    ));

    WidgetsBinding.instance.addPostFrameCallback((_) {
      FlutterNativeSplash.remove();
      _entryCtrl.forward();
    });
  }

  @override
  void dispose() {
    _entryCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      backgroundColor: const Color(0xFF5E4BF4),
      body: Stack(
        children: [
          // Radial Gradient Base
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment(0.0, -0.1),
                  radius: 1.0,
                  colors: [
                    Color(0xFF6E5DF6),
                    Color(0xFF4C3CDA),
                  ],
                ),
              ),
            ),
          ),

          // Concentric Background Rings / Ripples
          Positioned.fill(
            child: CustomPaint(
              painter: _SplashRipplesPainter(),
            ),
          ),

          const AuthGate(),

          // Center Logo & Tagline
          Center(
            child: FadeTransition(
              opacity: _entryOpacity,
              child: SlideTransition(
                position: _entrySlide,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Brand Title
                    Text(
                      'AIM',
                      style: AimTextStyles.display.copyWith(
                        fontSize: 64,
                        fontWeight: AimFontWeights.extrabold,
                        color: AimColors.neutral0,
                        letterSpacing: 2.0,
                        height: 1.0,
                      ),
                    ),
                    const SizedBox(height: 12),
                    // Tagline Subtitle
                    Text(
                      'YOUR AI MIND COACH',
                      style: AimTextStyles.caption.copyWith(
                        fontSize: 13,
                        fontWeight: AimFontWeights.bold,
                        color: AimColors.neutral0.withValues(alpha: 0.75),
                        letterSpacing: 3.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Loading Indicator
          Positioned(
            bottom: size.height * 0.08,
            left: 0,
            right: 0,
            child: Center(
              child: FadeTransition(
                opacity: _entryOpacity,
                child: SizedBox(
                  width: 32,
                  height: 32,
                  child: CircularProgressIndicator(
                    strokeWidth: 3.0,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      AimColors.neutral0.withValues(alpha: 0.85),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Custom painter that draws the subtle concentric rings in the splash background.
class _SplashRipplesPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2 - 20);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;

    final radii = [140.0, 240.0, 350.0, 470.0, 600.0];
    for (int i = 0; i < radii.length; i++) {
      paint.color = Colors.white.withValues(alpha: 0.05 - (i * 0.008));
      canvas.drawCircle(center, radii[i], paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
