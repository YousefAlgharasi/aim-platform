// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Placement start"
//   docs/design/ui-for-all-system-mobile/screenshots/light/19-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/19-screen.png
//
// Phase 4 — P4-065 (restyled — TASK-19)
// PlacementStartPage — student-facing placement start screen.
//
// Endpoints: GET /placement/active, POST /placement/attempts
// Widgets: AIMGradientButton, AIMFullScreenLoading, AIMFullScreenError
//
// Scope: Placement Test phase only.
//
// This is a real-data-only visual restyle. The bare Material AppBar is
// replaced with a bespoke gradient header (mirrors PlacementIntroPage's
// private `_IntroHeader`, duplicated locally since it's private to that
// file), and the ready-state body leads with a rounded gradient card
// showing exactly two real stat cells: Sections (test.totalSections) and
// Estimated time (test.estimatedMinutes). Per
// services/backend-api/src/features/placement/placement-test-read.service.ts,
// GET /placement/active only ever returns id/title/status/total_sections/
// estimated_minutes — there is no per-section name/duration breakdown and no
// total question count anywhere in this response. The design's "SECTIONS"
// list (Vocabulary/Grammar/Reading/Listening rows) and its 36-question stat
// cell are therefore intentionally NOT built here, mirroring the same
// real-data-only reasoning already documented in placement_intro_page.dart.
//
// Responsibility:
//   1. Load the active placement test on mount.
//   2. Display test info (title, sections, estimated time).
//   3. Let the student start the attempt via a single "Start" button.
//   4. Navigate to the section page once the attempt is created (P4-066).
//
// Security rules:
// - Displays only data returned from the backend via placementStartProvider.
// - estimatedLevel, scores, and mastery values are never shown or computed here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/placement/data/models/placement_test_model.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_start_notifier.dart';

class PlacementStartPage extends ConsumerStatefulWidget {
  const PlacementStartPage({super.key});

  @override
  ConsumerState<PlacementStartPage> createState() => _PlacementStartPageState();
}

class _PlacementStartPageState extends ConsumerState<PlacementStartPage> {
  @override
  void initState() {
    super.initState();
    // Load active test after first frame so the provider is ready.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token = ref.read(authFlowProvider).accessToken ?? '';
      ref.read(placementStartProvider.notifier).loadActivePlacementTest(token);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(placementStartProvider);

    // Navigate once attempt is started — handle in listener to avoid
    // mid-build navigation.
    ref.listen<PlacementStartState>(placementStartProvider, (_, next) {
      if (next is PlacementStarted && context.mounted) {
        Navigator.of(context).pushNamed(
          AppRoutePaths.placementSection,
          arguments: {
            'attemptId': next.attempt.id,
            'testId': next.test.id,
          },
        );
      }
    });

    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _StartHeader(),
          Expanded(
            child: switch (state) {
              PlacementStartIdle() ||
              PlacementStartLoading() =>
                const AIMFullScreenLoading(
                  semanticLabel: 'Loading placement test',
                ),
              PlacementStartError(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: () {
                    final token = ref.read(authFlowProvider).accessToken ?? '';
                    ref
                        .read(placementStartProvider.notifier)
                        .loadActivePlacementTest(token);
                  },
                ),
              PlacementStartReady(:final test) => _ReadyBody(
                  test: test,
                  onStart: () {
                    final token = ref.read(authFlowProvider).accessToken ?? '';
                    ref.read(placementStartProvider.notifier).startAttempt(token);
                  },
                ),
              PlacementStarted() =>
                // Transitioning — show spinner while navigation fires.
                const AIMFullScreenLoading(
                  semanticLabel: 'Starting placement test',
                ),
            },
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Gradient header — mirrors PlacementIntroPage's private `_IntroHeader`
// (duplicated locally since that widget is private to its own file). Back
// button is a genuine pop: PlacementIntroPage pushes this screen via
// Navigator.pushNamed(AppRoutePaths.placementStart), so a working back
// affordance matches normal push/pop semantics.
// ---------------------------------------------------------------------------

class _StartHeader extends StatelessWidget {
  const _StartHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Semantics(
              button: true,
              label: 'Back',
              child: InkWell(
                onTap: () => Navigator.of(context).maybePop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.arrow_back,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.componentGap),
            Text(
              'Placement Test',
              style: AimTextStyles.h2.copyWith(color: AimColors.neutral0),
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

class _ReadyBody extends StatelessWidget {
  const _ReadyBody({
    required this.test,
    required this.onStart,
  });

  final PlacementTestModel test;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Gradient "Find your level" card — static UI copy (non-data)
            // plus exactly two real stat cells.
            Container(
              padding: const EdgeInsetsDirectional.all(AimSpacing.space20),
              decoration: BoxDecoration(
                gradient: AimGradients.gzHero,
                borderRadius: AimRadius.borderLg,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Find your level',
                    style:
                        AimTextStyles.h3.copyWith(color: AimColors.neutral0),
                  ),
                  const SizedBox(height: AimSpacing.space8),
                  Text(
                    'A short adaptive test places you at the right level so '
                    'every lesson fits you.',
                    style: AimTextStyles.bodySm.copyWith(
                      color: AimColors.neutral0.withValues(alpha: 0.85),
                    ),
                  ),
                  const SizedBox(height: AimSpacing.sectionGap),
                  Row(
                    children: [
                      Expanded(
                        child: _StatCell(
                          value: '${test.totalSections}',
                          label: 'sections',
                        ),
                      ),
                      Expanded(
                        child: _StatCell(
                          value: '~${test.estimatedMinutes}',
                          label: 'minutes',
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
            // Boundary note — backend authority.
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
              label: 'Start Placement Test',
              fullWidth: true,
              semanticLabel: 'Start Placement Test',
              onPressed: onStart,
            ),
            const SizedBox(height: AimSpacing.componentGap),
            Center(
              child: TextButton(
                onPressed: () => Navigator.of(context).maybePop(),
                child: const Text('Not now'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Compact white-on-gradient number+label stat cell used in the "Find your
/// level" card (Sections / Estimated time — both real, backend-supplied).
class _StatCell extends StatelessWidget {
  const _StatCell({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: '$value $label',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
          ),
          const SizedBox(height: AimSpacing.space2),
          Text(
            label,
            style: AimTextStyles.caption.copyWith(
              color: AimColors.neutral0.withValues(alpha: 0.85),
            ),
          ),
        ],
      ),
    );
  }
}
