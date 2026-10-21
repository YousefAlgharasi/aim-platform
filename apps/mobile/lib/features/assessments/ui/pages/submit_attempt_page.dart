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
import 'package:aim_mobile/l10n/app_localizations.dart';

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
      appBar: AIMTopAppBar(
        title: widget.assessmentTitle,
        onBack: _submitting ? null : () => context.pop(),
      ),
      body: Padding(
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
              AppLocalizations.of(context).submitAttemptTitle,
              style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AimSpacing.componentGap),
            Text(
              AppLocalizations.of(context).submitAttemptWarning,
              style:
                  AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
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
                      AppLocalizations.of(context).submitAttemptFinalAction,
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
            AIMButton(
              variant: AIMButtonVariant.primary,
              size: AIMButtonSize.large,
              onPressed: _submitting ? null : _submitAttempt,
              loading: _submitting,
              fullWidth: true,
              semanticLabel:
                  '${AppLocalizations.of(context).assessmentsSubmit} ${widget.assessmentTitle}',
              child: Text(AppLocalizations.of(context).assessmentsSubmit),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            AIMButton(
              variant: AIMButtonVariant.outline,
              size: AIMButtonSize.large,
              onPressed: _submitting ? null : () => context.pop(),
              disabled: _submitting,
              fullWidth: true,
              child: Text(AppLocalizations.of(context).assessmentsGoBack),
            ),
          ],
        ),
      ),
    );
  }
}
