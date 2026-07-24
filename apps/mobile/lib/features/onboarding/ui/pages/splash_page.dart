// Design ref: Modern Auth Pages / Screen 1 — Splash Page (Figma)
//   bg: #4F46E5 (solid indigo)
//   Centered brand name (white, bold, 64px in Figma / responsive in Flutter)
//   Spinner at bottom-center (white)
//
// Two-stage splash strategy:
//   Stage 1 (native): Android/iOS shows static gradient + centered badge.
//   Stage 2 (this widget): FlutterNativeSplash.remove() fires after first
//   frame, then elements animate in.
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../auth/ui/widgets/auth_gate.dart';

/// Splash / bootstrap screen — AIM Mobile.
///
/// Purely a branding + loading surface: the real auth-check work and the
/// resulting navigation are entirely owned by [AuthGate], which is mounted
/// unchanged in the [Stack] below. This widget only renders the solid indigo
/// background, brand mark, and a loading spinner — it never makes navigation
/// decisions itself.
///
/// Colours match the Figma "Modern Auth Pages" Screen 1 spec exactly:
///   Background: #4F46E5 (solid indigo)
///   Text & icon: white (#FFFFFF / #F8FAFC)
///   Spinner: white
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

    // Entry: 900 ms fade + slide up.
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
    // Responsive icon/text sizes relative to screen width
    final iconBoxSize = size.width * 0.183; // ~72 on 393 wide
    final iconSize = iconBoxSize * 0.528; // ~38 on 72 box
    final titleFontSize = (size.width * 0.071).clamp(22.0, 36.0);
    final subtitleFontSize = (size.width * 0.033).clamp(11.0, 16.0);

    return Scaffold(
      backgroundColor: const Color(0xFF4F46E5),
      body: Stack(
        children: [
          // ── Solid indigo background (Figma spec: bg-[#4f46e5]) ────────
          const ColoredBox(color: Color(0xFF4F46E5), child: SizedBox.expand()),

          // ── Subtle radial glow overlay ────────────────────────────────
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: const Alignment(0.2, -0.2),
                  radius: 0.85,
                  colors: [
                    Colors.white.withValues(alpha: 0.07),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // ── Real auth-check + navigation (unchanged, untouched) ───────
          const AuthGate(),

          // ── Center column: Logo Box + Brand Name ─────────────────────
          Center(
            child: FadeTransition(
              opacity: _entryOpacity,
              child: SlideTransition(
                position: _entrySlide,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Glassmorphic logo box (Figma: white 15% opacity, blur 12)
                    ClipRRect(
                      borderRadius:
                          BorderRadius.circular(iconBoxSize * 0.306),
                      child: BackdropFilter(
                        filter:
                            ui.ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                        child: Container(
                          width: iconBoxSize,
                          height: iconBoxSize,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.15),
                            borderRadius:
                                BorderRadius.circular(iconBoxSize * 0.306),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.25),
                              width: 1.5,
                            ),
                          ),
                          child: Center(
                            child: Icon(
                              Icons.psychology_rounded,
                              size: iconSize,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: size.height * 0.022),
                    // Brand name — "AIM" (white, bold)
                    Text(
                      'AIM',
                      style: TextStyle(
                        fontFamily: 'IBMPlexSans',
                        fontWeight: FontWeight.w800,
                        fontSize: titleFontSize,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                    SizedBox(height: size.height * 0.007),
                    Text(
                      'AI-Powered Institute',
                      style: TextStyle(
                        fontFamily: 'IBMPlexSans',
                        fontWeight: FontWeight.w400,
                        fontSize: subtitleFontSize,
                        color: const Color(0xFFE0E7FF),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // ── Bottom Spinner (Figma: gg:spinner, white) ─────────────────
          Positioned(
            bottom: size.height * 0.075,
            left: 0,
            right: 0,
            child: Center(
              child: FadeTransition(
                opacity: _entryOpacity,
                child: SizedBox(
                  width: 36,
                  height: 36,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Colors.white.withValues(alpha: 0.85),
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
