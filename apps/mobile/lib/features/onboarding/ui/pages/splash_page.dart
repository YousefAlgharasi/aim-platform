// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Splash"
//   docs/design/ui-for-all-system-mobile/screenshots/light/01-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/01-screen.png
// Endpoint: none (static loading/branding screen, real auth-check state
//   from authFlowProvider)
// Widgets: AuthGate, LinearProgressIndicator (custom-styled), Stack/Positioned
//   decorative circles
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/theme.dart';
import '../../../../core/widgets/widgets.dart';
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
/// System tokens. No hard-coded values except the documented translucent
/// white overlays used for the decorative circles / icon badge, matching
/// the pattern already established in `register_page.dart` / `login_page.dart`
/// for gradient-hero back buttons.
class SplashPage extends ConsumerWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authFlowProvider);

    return Scaffold(
      body: Stack(
        children: [
          // ── Gradient hero background ─────────────────────────────────
          const DecoratedBox(
            decoration: BoxDecoration(gradient: AimGradients.gzHero),
            child: SizedBox.expand(),
          ),

          // ── Decorative blurred circles (purely visual, not data-driven) ──
          const Positioned(
            top: -60,
            right: -40,
            child: _DecorativeCircle(size: 220, opacity: 0.15),
          ),
          const Positioned(
            left: -70,
            top: 220,
            child: _DecorativeCircle(size: 150, opacity: 0.12),
          ),
          const Positioned(
            bottom: -50,
            left: -30,
            child: _DecorativeCircle(size: 200, opacity: 0.12),
          ),

          // ── Real auth-check + navigation (unchanged, untouched) ──────
          const AuthGate(),

          // ── Brand content ─────────────────────────────────────────────
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
              child: Column(
                children: [
                  const Spacer(flex: 3),
                  // Icon badge with sparkle accent.
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      DecoratedBox(
                        decoration: BoxDecoration(
                          color: AimColors.neutral0.withValues(alpha: 0.18),
                          borderRadius: AimRadius.borderXl,
                        ),
                        child: const Padding(
                          padding: EdgeInsets.all(AimSpacing.space24),
                          child: Icon(
                            Icons.school_outlined,
                            size: AimSizes.iconLg * 1.5,
                            color: AimColors.neutral0,
                          ),
                        ),
                      ),
                      const PositionedDirectional(
                        top: -6,
                        end: -6,
                        child: Icon(
                          Icons.auto_awesome,
                          size: AimSizes.iconSm,
                          color: AimColors.warning500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AimSpacing.sectionGap),
                  Text(
                    'AIM',
                    style: AimTextStyles.display.copyWith(
                      color: AimColors.neutral0,
                      letterSpacing: 2,
                    ),
                  ),
                  const SizedBox(height: AimSpacing.innerGap),
                  Text(
                    'Adaptive Intelligence for Mastery',
                    style: AimTextStyles.bodySm.copyWith(
                      color: AimColors.neutral0.withValues(alpha: 0.85),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const Spacer(flex: 4),

                  // ── Progress + hint ─────────────────────────────────
                  // The real auth-check flow is fully automatic: AuthGate
                  // reactively navigates away as soon as authFlowProvider
                  // resolves, and there is no working "tap to skip"
                  // mechanism anywhere in this codebase. Rather than invent
                  // one (out of scope for a visual fix) or wire a fake
                  // onTap that does nothing, "Tap to continue" is rendered
                  // as static, non-interactive copy shown alongside the
                  // progress bar for the whole duration of the check —
                  // matching the mockup's simultaneous appearance of both
                  // elements — and it never receives a tap handler.
                  if (authState.isChecking) ...[
                    ClipRRect(
                      borderRadius: AimRadius.borderPill,
                      child: SizedBox(
                        height: AimSpacing.space4,
                        width: double.infinity,
                        child: LinearProgressIndicator(
                          backgroundColor:
                              AimColors.neutral0.withValues(alpha: 0.25),
                          valueColor: const AlwaysStoppedAnimation<Color>(
                            AimColors.neutral0,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: AimSpacing.componentGap),
                    Text(
                      'Tap to continue',
                      style: AimTextStyles.caption.copyWith(
                        color: AimColors.neutral0.withValues(alpha: 0.75),
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                  const SizedBox(height: AimSpacing.sectionGap),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// A soft, translucent decorative circle used to echo the mockup's blurred
/// background blobs. Purely visual — no data, no interaction.
class _DecorativeCircle extends StatelessWidget {
  const _DecorativeCircle({required this.size, required this.opacity});

  final double size;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AimColors.neutral0.withValues(alpha: opacity),
        shape: BoxShape.circle,
      ),
      child: SizedBox(width: size, height: size),
    );
  }
}
