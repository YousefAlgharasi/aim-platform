import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/design_tokens/design_tokens.dart';
import '../../../auth/ui/widgets/auth_gate.dart';
import '../../logic/splash_hold_provider.dart';
import '../widgets/splash_stages.dart';

/// Two-stage launch screen — AIM Mobile.
///
/// Stage 0 is the native Android splash (gradient + logo). The first Flutter
/// frame is an exact continuation of it ([SplashStageOne]); if startup is
/// still running shortly after, it cross-fades into the dark animated
/// [SplashStageTwo] with a loading indicator.
///
/// There are NO artificial delays: navigation away from this page is driven
/// purely by [AuthGate] → app bootstrap → the router's auth redirect, so a
/// fast start never even reaches stage 2. [_stageTwoAt] is only *when stage 2
/// starts showing if initialisation is still in progress*, not a wait.
class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage>
    with TickerProviderStateMixin {
  static const _timelineLength = Duration(milliseconds: 2000);

  /// Fraction of the timeline at which stage 2 begins to cross-fade in (~600ms).
  static const _stageTwoAt = 0.3;

  late final AnimationController _timeline =
      AnimationController(vsync: this, duration: _timelineLength);
  late final AnimationController _ambient =
      AnimationController(vsync: this, duration: const Duration(seconds: 3));

  /// Letter light wave; started when the loader appears so it begins on "A".
  late final AnimationController _wave = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1500),
  );

  /// Fraction of the timeline at which the tagline gives way to the loader.
  static const _loaderAt = 0.65;

  late final Animation<double> _stageOneIntro = CurvedAnimation(
    parent: _timeline,
    curve: const Interval(0.0, 0.28),
  );
  late final Animation<double> _crossfade = CurvedAnimation(
    parent: _timeline,
    curve: const Interval(_stageTwoAt, 0.5, curve: Curves.easeInOut),
  );
  late final Animation<double> _logoZoom = CurvedAnimation(
    parent: _timeline,
    curve: const Interval(_stageTwoAt, _loaderAt),
  );
  late final Animation<double> _stageTwoMorph = CurvedAnimation(
    parent: _timeline,
    curve: const Interval(_loaderAt, 0.85),
  );

  bool _started = false;
  bool _began = false;
  Timer? _precacheGuard;
  Timer? _holdTimer;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_started) return;
    _started = true;
    // The logo is a tiny bundled asset. Make sure it is decoded before the
    // native splash is removed so the handoff never shows a logo-less frame.
    // Bounded so a stuck asset load can never keep the native splash up;
    // cancelled as soon as the asset is ready or the page goes away.
    _precacheGuard = Timer(const Duration(seconds: 2), _begin);
    precacheImage(const AssetImage(kSplashLogoAsset), context)
        .catchError((_) {})
        .whenComplete(_begin);
  }

  void _begin() {
    _precacheGuard?.cancel();
    if (!mounted || _began) return;
    _began = true;
    FlutterNativeSplash.remove();
    if (MediaQuery.disableAnimationsOf(context)) {
      // Reduced motion: keep the static stage-1 frame, no animation loops,
      // and don't hold the user back.
      _timeline.value = 0.28;
      _releaseHold();
      return;
    }
    // The splash is visible from now: keep it for its minimum time, then let
    // the router move on as soon as initialisation is done.
    _holdTimer = Timer(kSplashMinVisible, _releaseHold);
    _timeline.addListener(_startAmbientOnce);
    _timeline.addListener(_startWaveOnce);
    _timeline.forward();
  }

  void _releaseHold() {
    if (!mounted) return;
    ref.read(splashHoldProvider.notifier).state = false;
  }

  void _startWaveOnce() {
    if (_timeline.value >= _loaderAt && !_wave.isAnimating) {
      _timeline.removeListener(_startWaveOnce);
      _wave.repeat();
    }
  }

  void _startAmbientOnce() {
    if (_timeline.value >= _stageTwoAt && !_ambient.isAnimating) {
      _timeline.removeListener(_startAmbientOnce);
      _ambient.repeat();
    }
  }

  @override
  void dispose() {
    _precacheGuard?.cancel();
    _holdTimer?.cancel();
    _timeline.removeListener(_startAmbientOnce);
    _timeline.removeListener(_startWaveOnce);
    _timeline.dispose();
    _ambient.dispose();
    _wave.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
        systemNavigationBarColor: Colors.transparent,
        systemNavigationBarIconBrightness: Brightness.light,
        systemNavigationBarContrastEnforced: false,
      ),
      child: Scaffold(
        // Behind the stages: same colour as the native splash edge, so no
        // white/black flash can show between layers.
        backgroundColor: AimColors.primary600,
        body: Stack(
          fit: StackFit.expand,
          children: [
            // Stage 1 stays opaque underneath; stage 2 fades in over it, so the
            // colour goes straight from vivid to deep purple (no grey dip).
            SplashStageOne(progress: _stageOneIntro),
            FadeTransition(
              opacity: _crossfade,
              child: SplashStageTwo(reveal: _crossfade, ambient: _ambient),
            ),
            // One logo above both backdrops — never two cross-fading copies.
            SplashLogoLayer(
              intro: _stageOneIntro,
              zoom: _logoZoom,
              morph: _stageTwoMorph,
              wave: _wave,
              ambient: _ambient,
            ),

            // Starts the session-restore check immediately (no UI).
            const AuthGate(),
          ],
        ),
      ),
    );
  }
}
