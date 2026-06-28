// Phase 4 — P4-065
// PlacementStartPage — student-facing placement start screen.
//
// Scope: Placement Test phase only.
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

import 'package:aim_mobile/core/design_tokens/design_tokens.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
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
      appBar: AppBar(
        title: const Text('Placement Test'),
        automaticallyImplyLeading: false,
      ),
      body: switch (state) {
        PlacementStartIdle() ||
        PlacementStartLoading() =>
          const Center(child: CircularProgressIndicator()),
        PlacementStartError(:final message) => _ErrorBody(
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
          const Center(child: CircularProgressIndicator()),
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Body — ready state
// ---------------------------------------------------------------------------

class _ReadyBody extends StatelessWidget {
  const _ReadyBody({required this.test, required this.onStart});

  final PlacementTestModel test;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(AimSpacing.space24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Spacer(),
            // Icon
            Icon(
              Icons.assignment_outlined,
              size: 72,
              color: colorScheme.primary,
            ),
            const SizedBox(height: AimSpacing.space24),
            // Title
            Text(
              test.title,
              style: AimTextStyles.h2.copyWith(color: colorScheme.onSurface),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.space8),
            Text(
              'Determine your English level',
              style: AimTextStyles.bodyMd.copyWith(
                color: colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.space32),
            // Info cards
            _InfoRow(
              icon: Icons.layers_outlined,
              label: 'Sections',
              value: '${test.totalSections}',
            ),
            const SizedBox(height: AimSpacing.space12),
            _InfoRow(
              icon: Icons.timer_outlined,
              label: 'Estimated time',
              value: '${test.estimatedMinutes} min',
            ),
            const SizedBox(height: AimSpacing.space32),
            // Boundary note — backend authority
            Container(
              padding: const EdgeInsets.all(AimSpacing.space12),
              decoration: BoxDecoration(
                color: colorScheme.surfaceContainerHighest,
                borderRadius: AimRadius.borderSm,
              ),
              child: Text(
                'Your level is determined by the backend after completion. '
                'Results are never calculated on your device.',
                style: AimTextStyles.bodySm.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const Spacer(),
            FilledButton(
              onPressed: onStart,
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  vertical: AimSpacing.space16,
                ),
              ),
              child: const Text('Start Placement Test'),
            ),
            const SizedBox(height: AimSpacing.space12),
            TextButton(
              onPressed: () => Navigator.of(context).maybePop(),
              child: const Text('Not now'),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Body — error state
// ---------------------------------------------------------------------------

class _ErrorBody extends StatelessWidget {
  const _ErrorBody({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AimSpacing.space24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(height: AimSpacing.space16),
            Text(
              'Could not load placement test',
              style: AimTextStyles.title.copyWith(
                color: Theme.of(context).colorScheme.onSurface,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.space8),
            Text(
              message,
              style: AimTextStyles.bodySm.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.space24),
            FilledButton.tonal(
              onPressed: onRetry,
              child: const Text('Retry'),
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
    final theme = Theme.of(context);
    return Row(
      children: [
        Icon(icon, size: AimSizes.iconMd, color: theme.colorScheme.primary),
        const SizedBox(width: AimSpacing.space12),
        Text(
          label,
          style: AimTextStyles.bodyMd.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        const Spacer(),
        Text(
          value,
          style: AimTextStyles.bodyMd.copyWith(
            fontWeight: AimFontWeights.semibold,
          ),
        ),
      ],
    );
  }
}
