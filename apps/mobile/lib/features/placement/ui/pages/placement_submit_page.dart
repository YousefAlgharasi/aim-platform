// Phase 4 — P4-068
// PlacementSubmitPage — confirmation and completion screen.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → placementSubmit
//   docs/design/ui-for-all-system-mobile/screenshots/light/22-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/22-screen.png
// Endpoint: POST /placement/attempts/:id/complete
// Widgets: AIMGradientButton, AIMFullScreenLoading
//
// Scope: Placement Test phase only.
//
// Responsibility:
//   1. Show a summary screen after the student has answered all questions
//      across all sections.
//   2. "Submit Placement Test" calls POST /placement/attempts/:id/complete.
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
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_provider.dart';
import 'package:aim_mobile/features/placement/logic/provider/placement_submit_notifier.dart';

class PlacementSubmitPage extends ConsumerStatefulWidget {
  const PlacementSubmitPage({
    super.key,
    required this.attemptId,
    this.totalSections,
  });

  /// The active placement attempt to complete.
  final String attemptId;

  /// Total section count, passed from the section page's ready state, so
  /// this screen can show "All N sections complete" — falls back to
  /// generic copy if not supplied (e.g. deep-linked directly).
  final int? totalSections;

  @override
  ConsumerState<PlacementSubmitPage> createState() =>
      _PlacementSubmitPageState();
}

class _PlacementSubmitPageState extends ConsumerState<PlacementSubmitPage> {
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(placementSubmitProvider);
    final surfaces = aimSurfacesOf(context);

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
      backgroundColor: surfaces.background,
      body: Column(
        children: [
          _GradientTopBar(title: 'Almost done'),
          Expanded(
            child: switch (state) {
              PlacementSubmitLoading() => const AIMFullScreenLoading(
                  semanticLabel: 'Submitting your answers',
                ),
              PlacementSubmitSuccess() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading your result',
                ),
              PlacementSubmitError(:final message) => AIMFullScreenError(
                  message: message,
                  retryLabel: 'Retry',
                  onRetry: () {
                    ref.read(placementSubmitProvider.notifier).reset();
                  },
                ),
              PlacementSubmitIdle() => _ConfirmBody(
                  totalSections: widget.totalSections,
                  onSubmit: () {
                    final token = ref.read(authFlowProvider).accessToken ?? '';
                    ref.read(placementSubmitProvider.notifier).completeAttempt(
                          token,
                          attemptId: widget.attemptId,
                        );
                  },
                ),
            },
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Gradient top bar — back chevron + "Almost done".
// ---------------------------------------------------------------------------

class _GradientTopBar extends StatelessWidget {
  const _GradientTopBar({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    final isRtl = Directionality.of(context) == TextDirection.rtl;

    // Without this, the OS paints its default status bar background above
    // the gradient instead of light icons sitting transparently on it.
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Container(
        width: double.infinity,
        decoration: const BoxDecoration(gradient: AimGradients.gzHero),
        child: SafeArea(
          bottom: false,
          child: SizedBox(
            height: AimSizes.topBarHeight,
            child: Row(
              children: [
                const SizedBox(width: AimSpacing.space8),
                AIMIconButton(
                  semanticLabel: 'Back',
                  icon: Icon(
                    isRtl ? Icons.chevron_right : Icons.chevron_left,
                    color: AimColors.neutral0,
                  ),
                  onPressed: () => Navigator.of(context).maybePop(),
                ),
                const SizedBox(width: AimSpacing.space4),
                Text(
                  title,
                  style:
                      AimTextStyles.title.copyWith(color: AimColors.neutral0),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Confirmation body
// ---------------------------------------------------------------------------

class _ConfirmBody extends StatelessWidget {
  const _ConfirmBody({required this.onSubmit, this.totalSections});

  final VoidCallback onSubmit;
  final int? totalSections;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final headline = totalSections != null
        ? 'All $totalSections sections complete'
        : 'All sections complete';

    return Padding(
      padding: const EdgeInsets.all(AimSpacing.screenPaddingMobile),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Spacer(),
          Center(
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: soft.success,
                shape: BoxShape.circle,
              ),
              child: Padding(
                padding: const EdgeInsets.all(AimSpacing.space16),
                child: Icon(
                  Icons.check,
                  size: AimSizes.iconLg,
                  color: soft.onSuccess,
                ),
              ),
            ),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            headline,
            textAlign: TextAlign.center,
            style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            'Submit your placement test to see your level and a '
            'personalised plan.',
            textAlign: TextAlign.center,
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
          const Spacer(),
          AIMGradientButton(
            label: 'Submit Placement Test',
            fullWidth: true,
            onPressed: onSubmit,
            semanticLabel: 'Submit Placement Test',
          ),
        ],
      ),
    );
  }
}
