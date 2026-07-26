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
    final iconBoxSize = size.width * 0.183;
    final iconSize = iconBoxSize * 0.528;
    final titleFontSize = (size.width * 0.071).clamp(22.0, 36.0);
    final subtitleFontSize = (size.width * 0.033).clamp(11.0, 16.0);

    return Scaffold(
      backgroundColor: AimColors.primary500,
      body: Stack(
        children: [
          const ColoredBox(color: AimColors.primary500, child: SizedBox.expand()),
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: const Alignment(0.2, -0.2),
                  radius: 0.85,
                  colors: [
                    AimColors.neutral0.withValues(alpha: 0.07),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          const AuthGate(),
          Center(
            child: FadeTransition(
              opacity: _entryOpacity,
              child: SlideTransition(
                position: _entrySlide,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(iconBoxSize * 0.306),
                      child: BackdropFilter(
                        filter: ui.ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                        child: Container(
                          width: iconBoxSize,
                          height: iconBoxSize,
                          decoration: BoxDecoration(
                            color: AimColors.neutral0.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(iconBoxSize * 0.306),
                            border: Border.all(
                              color: AimColors.neutral0.withValues(alpha: 0.25),
                              width: 1.5,
                            ),
                          ),
                          child: Center(
                            child: Icon(
                              Icons.psychology_rounded,
                              size: iconSize,
                              color: AimColors.neutral0,
                            ),
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: size.height * 0.022),
                    Text(
                      'AIM',
                      style: AimTextStyles.display.copyWith(
                        fontSize: titleFontSize,
                        fontWeight: AimFontWeights.extrabold,
                        color: AimColors.neutral0,
                        letterSpacing: -0.5,
                      ),
                    ),
                    SizedBox(height: size.height * 0.007),
                    Text(
                      'AI-Powered Institute',
                      style: AimTextStyles.bodySm.copyWith(
                        fontSize: subtitleFontSize,
                        color: AimColors.primary100,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
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
