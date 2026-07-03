// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Submit quiz" (28)
//   docs/design/ui-for-all-system-mobile/screenshots/light/28-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/28-screen.png
// Endpoint: POST /student/assessments/attempts/:attemptId/submit
// Widgets: AIMGradientButton, AIMButton
//
// P10-061: SubmitAttemptPage — confirmation and submission flow for
// assessments. Pushed on top of AttemptPage (screen 27) as the design's
// explicit confirmation step; previously this page was orphaned and the
// attempt page submitted inline in one tap — TASK-23 wired it into the
// flow as the design intends (attempt 27 → confirm 28 → result 29).
//
// Responsibility:
//   1. Ask the student to confirm before the attempt is submitted.
//   2. "Submit" calls POST /student/assessments/attempts/:attemptId/submit.
//   3. On success, navigate to the result screen (29), removing the
//      already-submitted attempt page from the stack.
//
// Intentional omissions (no backing data — never fabricated):
// - The design's "Answered X / Y" row: the resume endpoint returns only
//   attemptId/status/expiresAt (see ResumeAttemptResult in
//   apps/mobile/lib/features/assessments/logic/entity/attempt_result.dart);
//   question content is itself a documented backend gap (see the note in
//   attempt_page.dart) and no answers are tracked client-side.
// - The design's "Time used" row: the resume response has no startedAt and
//   this page only receives attemptId + title.
//   → the design's stats card has zero real fields, so the whole card is
//     omitted. The header shows the real assessment title instead of the
//     design's static "Submit quiz" label (real data beats static copy).
//
// Security rules:
// - Submits the attempt to the backend; Flutter never evaluates correctness
//   or computes scores. Backend is the final authority for grading and
//   results.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';

class SubmitAttemptPage extends ConsumerStatefulWidget {
  const SubmitAttemptPage({
    required this.attemptId,
    required this.assessmentTitle,
    super.key,
  });

  final String attemptId;
  final String assessmentTitle;

  @override
  ConsumerState<SubmitAttemptPage> createState() => _SubmitAttemptPageState();
}

class _SubmitAttemptPageState extends ConsumerState<SubmitAttemptPage> {
  bool _submitting = false;

  void _submitAttempt() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;

    setState(() => _submitting = true);

    ref.read(submitAttemptProvider.notifier).submit(
          bearerToken: token,
          attemptId: widget.attemptId,
        );
  }

  void _onSubmitSuccess(SubmitAttemptResult result) {
    // This page is pushed ON TOP of the attempt page, so a plain
    // pushReplacement would leave the already-submitted attempt page in the
    // stack behind the result. Remove back to the assessments list instead —
    // the same predicate the result page's own Done button uses.
    context.go(AppRoutePaths.assessments);
    context.push(
      AppRoutePaths.assessmentResult,
      extra: {
        'attemptId': result.attemptId,
        'resultId': result.resultId,
        'assessmentTitle': widget.assessmentTitle,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AppAsyncState<SubmitAttemptResult>>(
      submitAttemptProvider,
      (_, next) {
        switch (next) {
          case AppAsyncSuccess(:final data):
            _onSubmitSuccess(data);
          case AppAsyncFailure(:final message):
            setState(() => _submitting = false);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(message)),
            );
          case _:
            break;
        }
      },
    );

    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _SubmitHeader(
            title: widget.assessmentTitle,
            // Match the Go Back button's disabled-while-submitting behaviour
            // so the user can't leave mid-submit.
            onBack: _submitting ? null : () => context.pop(),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsetsDirectional.fromSTEB(
                AimSpacing.screenPaddingMobile,
                AimSpacing.sectionGap,
                AimSpacing.screenPaddingMobile,
                AimSpacing.sectionGap,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Spacer(),
                  Text(
                    'Submit your answers?',
                    style: AimTextStyles.h2
                        .copyWith(color: surfaces.textPrimary),
                    textAlign: TextAlign.center,
                  ),
                  // The design's stats card ("Answered 10 / 10", "Time used
                  // 9 min") is intentionally omitted here — neither row has
                  // backing data; see the file header.
                  const SizedBox(height: AimSpacing.componentGap),
                  Text(
                    'You cannot change answers after submitting.',
                    style: AimTextStyles.bodyMd
                        .copyWith(color: surfaces.textSecondary),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AimSpacing.componentGap),
                  // Finality warning
                  Container(
                    padding: const EdgeInsets.all(AimSpacing.componentGap),
                    decoration: const BoxDecoration(
                      color: AimColors.error100,
                      borderRadius: AimRadius.borderSm,
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.warning_amber_rounded,
                          size: AimSizes.iconSm,
                          color: AimColors.error500,
                        ),
                        const SizedBox(width: AimSpacing.space8),
                        Expanded(
                          child: Text(
                            'This action is final and cannot be undone.',
                            style: AimTextStyles.bodySm.copyWith(
                              color: AimColors.error700,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(flex: 2),
                  AIMGradientButton(
                    label: 'Submit',
                    onPressed: _submitting ? null : _submitAttempt,
                    loading: _submitting,
                    fullWidth: true,
                    semanticLabel:
                        'Submit attempt for ${widget.assessmentTitle}',
                  ),
                  const SizedBox(height: AimSpacing.componentGap),
                  AIMButton(
                    variant: AIMButtonVariant.outline,
                    onPressed: _submitting ? null : () => context.pop(),
                    disabled: _submitting,
                    fullWidth: true,
                    child: const Text('Go Back'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Gradient header ─────────────────────────────────────────────────────────

/// Hero header mirroring [AttemptPage]'s back-button/title pattern, minus
/// the countdown pill (this screen has no live deadline affordance in the
/// design). Shows the real assessment title.
class _SubmitHeader extends StatelessWidget {
  const _SubmitHeader({required this.title, this.onBack});

  final String title;

  /// Null disables the back affordance (while a submission is in flight).
  final VoidCallback? onBack;

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
              enabled: onBack != null,
              label: 'Back',
              child: InkWell(
                onTap: onBack,
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
            const SizedBox(width: AimSpacing.space12),
            Expanded(
              child: Text(
                title,
                style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
