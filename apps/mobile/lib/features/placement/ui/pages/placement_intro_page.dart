// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Placement intro"
//   docs/design/ui-for-all-system-mobile/screenshots/light/18-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/18-screen.png
// Endpoint: GET /placement/active (read-only preview, no attempt started)
// Widgets: AIMFullScreenLoading, AIMFullScreenError, AIMGradientButton
//
// Phase 4 — P4-061 / P4-066
// PlacementIntroPage — read-only preview of the active placement test.
//
// Scope: Placement Test phase only.
//
// Responsibility:
//   1. Load the active placement test (GET /placement/active) on mount.
//      This call has no side effects — it does not start an attempt.
//   2. Show the test title, section count, and estimated time.
//   3. Let the student continue to [PlacementStartPage], which is
//      responsible for actually starting the attempt.
//
// Security rules:
// - Displays only data returned from the backend via placementStartProvider.
// - Flutter must not display or compute placement score, CEFR threshold
//   breakdowns, skill mastery, weakness map, or initial path.
// - This screen never calls startAttempt — it only navigates forward.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/routing/routing.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../auth/logic/provider/auth_flow_provider.dart';
import '../../data/models/placement_test_model.dart';
import '../../logic/provider/placement_provider.dart';
import '../../logic/provider/placement_start_notifier.dart';

/// Read-only introduction screen shown before [PlacementStartPage].
///
/// Design system: all colours, typography, spacing, and interactive widgets
/// use AIM Mobile Design System tokens. No hard-coded values.
///
/// RTL/Arabic: no [TextDirection] is hard-coded. [EdgeInsetsDirectional] and
/// [AlignmentDirectional] are used throughout so the layout mirrors correctly.
class PlacementIntroPage extends ConsumerStatefulWidget {
  const PlacementIntroPage({super.key});

  @override
  ConsumerState<PlacementIntroPage> createState() =>
      _PlacementIntroPageState();
}

class _PlacementIntroPageState extends ConsumerState<PlacementIntroPage> {
  @override
  void initState() {
    super.initState();
    // Load active test after first frame so the provider is ready.
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadActiveTest());
  }

  void _loadActiveTest() {
    final token = ref.read(authFlowProvider).accessToken ?? '';
    ref.read(placementStartProvider.notifier).loadActivePlacementTest(token);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(placementStartProvider);

    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _IntroHeader(),
          Expanded(
            child: switch (state) {
              PlacementStartIdle() ||
              PlacementStartLoading() =>
                const AIMFullScreenLoading(
                  semanticLabel: 'Loading placement test',
                ),
              PlacementStartError(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: _loadActiveTest,
                ),
              PlacementStartReady(:final test) => _IntroBody(test: test),
              // Attempt was already started elsewhere (e.g. the student
              // returned to this screen after starting) — nothing new to
              // preview here beyond a simple loading indicator.
              PlacementStarted() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading placement test',
                ),
            },
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Gradient header
// ---------------------------------------------------------------------------

class _IntroHeader extends StatelessWidget {
  const _IntroHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.sectionGap,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Align(
              alignment: AlignmentDirectional.centerStart,
              child: Semantics(
                button: true,
                label: 'Back',
                child: InkWell(
                  onTap: () => Navigator.of(context).pop(),
                  customBorder: const CircleBorder(),
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: AimColors.neutral0.withValues(alpha: 0.18),
                      shape: BoxShape.circle,
                    ),
                    child: Padding(
                      padding: EdgeInsets.all(AimSpacing.space12),
                      child: Icon(
                        Directionality.of(context) == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                        size: AimSizes.iconMd,
                        color: AimColors.neutral0,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
            Text(
              'Placement Test',
              style: AimTextStyles.h2.copyWith(color: AimColors.neutral0),
            ),
            const SizedBox(height: AimSpacing.space4),
            Text(
              'A quick check to find your starting level',
              style: AimTextStyles.bodySm.copyWith(
                color: AimColors.neutral0.withValues(alpha: 0.85),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Body — ready state
// ---------------------------------------------------------------------------

class _IntroBody extends StatelessWidget {
  const _IntroBody({required this.test});

  final PlacementTestModel test;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsetsDirectional.all(
          AimSpacing.screenPaddingMobile,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              test.title,
              style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
            _InfoRow(
              icon: Icons.layers_outlined,
              label: 'Sections',
              value: '${test.totalSections} sections',
            ),
            const SizedBox(height: AimSpacing.componentGap),
            _InfoRow(
              icon: Icons.timer_outlined,
              label: 'Estimated time',
              value: '~${test.estimatedMinutes} min',
            ),
            const SizedBox(height: AimSpacing.sectionGap),
            // Boundary note — backend authority. Copy reused verbatim from
            // PlacementStartPage — the only real, approved copy source for
            // this screen.
            Container(
              padding: const EdgeInsetsDirectional.all(AimSpacing.space12),
              decoration: BoxDecoration(
                color: surfaces.surfaceSunken,
                borderRadius: AimRadius.borderSm,
              ),
              child: Text(
                'Your level is determined by the backend after completion. '
                'Results are never calculated on your device.',
                style: AimTextStyles.bodySm.copyWith(
                  color: surfaces.textSecondary,
                ),
              ),
            ),
            const Spacer(),
            AIMGradientButton(
              label: 'Continue',
              fullWidth: true,
              semanticLabel: 'Continue to placement test',
              onPressed: () => Navigator.of(context)
                  .pushNamed(AppRoutePaths.placementStart),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Info row widget
// ---------------------------------------------------------------------------

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Row(
      children: [
        Icon(icon, size: AimSizes.iconMd, color: AimColors.primary500),
        const SizedBox(width: AimSpacing.space12),
        Text(
          label,
          style: AimTextStyles.bodyMd.copyWith(
            color: surfaces.textSecondary,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: AimTextStyles.bodyMd.copyWith(
            color: surfaces.textPrimary,
            fontWeight: AimFontWeights.semibold,
          ),
        ),
      ],
    );
  }
}
