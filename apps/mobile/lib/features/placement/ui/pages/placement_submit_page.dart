// Phase 4 — P4-068
// PlacementSubmitPage — confirmation and completion screen.
//
// Scope: Placement Test phase only.
//
// Responsibility:
//   1. Show a summary screen after the student has answered all questions
//      across all sections.
//   2. "Submit Test" calls POST /placement/attempts/:id/complete.
//   3. Backend transitions the attempt active → submitted and runs scoring.
//      Flutter receives only the submission confirmation — no scores, no level.
//   4. On success, navigate to the result page (P4-069) which polls for the
//      completed result once backend scoring is done.
//
// Security rules:
// - Flutter NEVER calculates or displays placement score, CEFR level, mastery,
//   or weakness maps. These are computed exclusively by the backend.
// - The page only confirms that all answers have been submitted.
// - student_id is JWT-resolved server-side — never sent by Flutter.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// - No secrets, service-role keys, or privileged config here.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/design_tokens/design_tokens.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_submit_notifier.dart';

class PlacementSubmitPage extends ConsumerStatefulWidget {
  const PlacementSubmitPage({
    super.key,
    required this.attemptId,
  });

  /// The active placement attempt to complete.
  final String attemptId;

  @override
  ConsumerState<PlacementSubmitPage> createState() =>
      _PlacementSubmitPageState();
}

class _PlacementSubmitPageState extends ConsumerState<PlacementSubmitPage> {
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(placementSubmitProvider);

    // Navigate to result page on success.
    ref.listen<PlacementSubmitState>(placementSubmitProvider, (_, next) {
      if (next is PlacementSubmitSuccess && context.mounted) {
        Navigator.of(context).pushReplacementNamed(
          AppRoutePaths.placementResult,
          arguments: {'attemptId': next.attemptId},
        );
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Placement Test'),
        automaticallyImplyLeading: false,
      ),
      body: switch (state) {
        PlacementSubmitLoading() => const Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: AimSpacing.space20),
                Text('Submitting your answers…'),
              ],
            ),
          ),
        PlacementSubmitSuccess() => const Center(
            child: CircularProgressIndicator(),
          ),
        PlacementSubmitError(:final message) => _ErrorBody(
            message: message,
            onRetry: () {
              ref.read(placementSubmitProvider.notifier).reset();
            },
          ),
        PlacementSubmitIdle() => _ConfirmBody(
            onSubmit: () {
              final token = ref.read(authFlowProvider).accessToken ?? '';
              ref.read(placementSubmitProvider.notifier).completeAttempt(
                    token,
                    attemptId: widget.attemptId,
                  );
            },
          ),
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Confirmation body
// ---------------------------------------------------------------------------

class _ConfirmBody extends StatelessWidget {
  const _ConfirmBody({required this.onSubmit});

  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.all(AimSpacing.space32),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Spacer(),

          // Completion icon
          const Icon(
            Icons.check_circle_outline,
            size: 80,
            color: AimColors.success500,
          ),
          const SizedBox(height: AimSpacing.space24),

          // Headline
          Text(
            'All sections complete!',
            textAlign: TextAlign.center,
            style: AimTextStyles.h2.copyWith(color: theme.colorScheme.onSurface),
          ),
          const SizedBox(height: AimSpacing.space16),

          // Subtext — sets expectations, no scores shown here
          Text(
            'Your answers have been recorded. When you submit, '
            'the backend will evaluate your results and determine '
            'your starting level.',
            textAlign: TextAlign.center,
            style: AimTextStyles.bodyMd.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.65),
            ),
          ),
          const SizedBox(height: AimSpacing.space12),

          // Backend authority note — security compliance
          Container(
            padding: const EdgeInsets.all(AimSpacing.space12),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.4),
              borderRadius: AimRadius.borderSm,
            ),
            child: Text(
              'Scoring is performed by the server. '
              'Your estimated level and study plan will be available '
              'on the result page.',
              textAlign: TextAlign.center,
              style: AimTextStyles.bodySm.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
              ),
            ),
          ),

          const Spacer(),

          // Submit button
          FilledButton(
            onPressed: onSubmit,
            child: const Padding(
              padding: EdgeInsets.symmetric(vertical: AimSpacing.space4),
              child: Text('Submit Placement Test', style: AimTextStyles.bodyMd),
            ),
          ),
          const SizedBox(height: AimSpacing.space16),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Error body
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
            const Icon(Icons.error_outline, size: 48, color: AimColors.error500),
            const SizedBox(height: AimSpacing.space16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: AimTextStyles.bodyMd.copyWith(
                color: Theme.of(context).colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: AimSpacing.space24),
            OutlinedButton(onPressed: onRetry, child: const Text('Try Again')),
          ],
        ),
      ),
    );
  }
}
