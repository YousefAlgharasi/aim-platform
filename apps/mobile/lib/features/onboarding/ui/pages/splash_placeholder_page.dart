import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/theme.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../../auth/ui/widgets/auth_gate.dart';

/// Splash / auth-check screen.
///
/// Displayed while [authFlowProvider] is in the checking state.
/// [AuthGate] is mounted invisibly alongside the branding UI; it watches
/// [appBootstrapProvider] and navigates to the correct destination
/// ([/auth/sign-in] or [/main]) as soon as the session check resolves.
///
/// RTL / Arabic: all text is [TextAlign.center] (direction-neutral).
/// No [TextDirection] is hard-coded.  The ambient locale from [localeProvider]
/// drives the layout direction automatically.
class SplashPlaceholderPage extends ConsumerWidget {
  const SplashPlaceholderPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authFlowProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            // ── Invisible auth gate — drives navigation ───────────────────
            const AuthGate(),

            // ── Visible branding + loading indicator ──────────────────────
            Center(
              child: Padding(
                padding:
                    const EdgeInsets.all(AimSpacing.screenPaddingMobile),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.school_outlined,
                      size: AimSizes.iconLg * 3,
                      color: AimColors.primary500,
                    ),
                    const SizedBox(height: AimSpacing.sectionGap),
                    Text(
                      'AIM',
                      style: AimTextStyles.h1.copyWith(
                        color: surfaces.textPrimary,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: AimSpacing.innerGap),
                    Text(
                      'Adaptive Intelligence for Mastery',
                      style: AimTextStyles.bodySm.copyWith(
                        color: surfaces.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AimSpacing.sectionGap),

                    // Loading indicator shown during the session check.
                    if (authState.isChecking) ...[
                      const CircularProgressIndicator(
                        color: AimColors.primary500,
                      ),
                      const SizedBox(height: AimSpacing.componentGap),
                      Text(
                        'Checking your session\u2026',
                        style: AimTextStyles.bodySm.copyWith(
                          color: surfaces.textMuted,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
