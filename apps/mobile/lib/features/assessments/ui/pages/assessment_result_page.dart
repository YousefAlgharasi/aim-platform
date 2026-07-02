// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Assessment result" (29)
//   docs/design/ui-for-all-system-mobile/screenshots/light/29-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/29-screen.png
// Endpoint: GET /student/assessments/attempts/:attemptId/result
// Widgets: AIMTopAppBar, AIMCard, AIMBadge, AIMProgressBar,
//   AIMGradientButton, AIMFullScreenLoading, AIMFullScreenError
//
// P10-062: Assessment result page — displays backend-graded score,
// pass/fail status, breakdown, and optional late-penalty indicator.
// Flutter never computes score; all values are backend-supplied.
//
// Deviations from the mockup (real-data-only rules):
// - The design is a headerless sheet; the real-title AIMTopAppBar is KEPT —
//   without it there is no way to identify which assessment this result
//   belongs to or to navigate back (established affordance-first deviation).
// - The design's big "85%" is a guarded, display-only derivation of two real
//   backend values (score / maxScore); when maxScore is 0 the raw
//   "score / maxScore" text is shown instead. Backend remains the grading
//   authority — see the comment at the derivation site.
// - The design's breakdown rows are labelled with section NAMES ("Grammar",
//   "Vocabulary", "Reading"). Names are omitted: the result contract only
//   carries opaque IDs (assessmentQuestionLinkId, nullable sectionId) and
//   points — no name field exists anywhere in the result payload. The
//   existing numbered per-question treatment is kept instead.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';

/// Display-only formatting of a real backend value: drops the trailing ".0"
/// when a points double is integral (e.g. "17" instead of "17.0").
String _fmtPts(double v) => v == v.roundToDouble() ? '${v.round()}' : '$v';

/// Formats an ISO date string as e.g. "Jun 30, 2026"; falls back to the raw
/// string on parse failure. (Same local pattern as achievements_page.dart.)
String _formatDate(String dateStr) {
  try {
    final date = DateTime.parse(dateStr);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  } catch (_) {
    return dateStr;
  }
}

class AssessmentResultPage extends ConsumerStatefulWidget {
  const AssessmentResultPage({
    required this.attemptId,
    required this.assessmentTitle,
    super.key,
  });

  final String attemptId;
  final String assessmentTitle;

  @override
  ConsumerState<AssessmentResultPage> createState() =>
      _AssessmentResultPageState();
}

class _AssessmentResultPageState extends ConsumerState<AssessmentResultPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(attemptResultProvider.notifier).load(
          bearerToken: token,
          attemptId: widget.attemptId,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(attemptResultProvider);

    return Scaffold(
      appBar: AIMTopAppBar(title: widget.assessmentTitle),
      body: switch (state) {
        AppAsyncLoading() => const AIMFullScreenLoading(
            semanticLabel: 'Loading result',
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: message,
            onRetry: _load,
          ),
        AppAsyncSuccess(:final data) => _ResultContent(
            result: data,
            onDone: () => Navigator.of(context).popUntil(
              (route) =>
                  route.settings.name == '/student/assessments' ||
                  route.isFirst,
            ),
          ),
        AppAsyncIdle() => const AIMFullScreenLoading(
            semanticLabel: 'Loading result',
          ),
      },
    );
  }
}

class _ResultContent extends StatelessWidget {
  const _ResultContent({
    required this.result,
    required this.onDone,
  });

  final AttemptResultDetail result;
  final VoidCallback onDone;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final statusColor =
        result.passed ? AimColors.success500 : AimColors.error500;
    final statusLabel = result.passed ? 'Passed' : 'Failed';

    // Display-only arithmetic on two backend-supplied values — NOT score
    // computation (the backend remains the grading authority). Guarded so a
    // zero maxScore never divides; in that case the raw score text is shown.
    final int? percentage = result.maxScore > 0
        ? ((result.score / result.maxScore) * 100).round()
        : null;

    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      children: [
        // Score hero card — big percentage + solid pass/fail pill.
        AIMCard(
          variant: AIMCardVariant.elevated,
          child: Column(
            children: [
              Text(
                percentage != null
                    ? '$percentage%'
                    : '${_fmtPts(result.score)} / ${_fmtPts(result.maxScore)}',
                style: AimTextStyles.display.copyWith(color: statusColor),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AimSpacing.componentGap),
              AIMBadge(
                tone: result.passed ? AIMBadgeTone.success : AIMBadgeTone.error,
                variant: AIMBadgeVariant.solid,
                pill: true,
                icon: Icon(result.passed ? Icons.check : Icons.close),
                semanticLabel: '$statusLabel: '
                    '${_fmtPts(result.score)} of ${_fmtPts(result.maxScore)} '
                    'points',
                child: Text(statusLabel),
              ),
            ],
          ),
        ),
        const SizedBox(height: AimSpacing.componentGap),

        // Late penalty indicator
        if (result.latePenaltyApplied) ...[
          Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.warning_amber_rounded,
                  size: AimSizes.iconSm,
                  color: AimColors.warning500,
                ),
                const SizedBox(width: AimSpacing.space4),
                Text(
                  'Late penalty applied',
                  style: AimTextStyles.bodySm
                      .copyWith(color: AimColors.warning500),
                ),
              ],
            ),
          ),
          const SizedBox(height: AimSpacing.componentGap),
        ],

        // Graded timestamp
        Center(
          child: Text(
            'Graded ${_formatDate(result.gradedAt)}',
            style:
                AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
        ),

        // Breakdown section
        if (result.breakdown.isNotEmpty) ...[
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            'BREAKDOWN',
            style: AimTextStyles.label.copyWith(
              color: surfaces.textMuted,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          ...result.breakdown.asMap().entries.map(
                (entry) => Padding(
                  padding:
                      const EdgeInsets.only(bottom: AimSpacing.listItemGap),
                  child: _BreakdownCard(
                    item: entry.value,
                    index: entry.key + 1,
                  ),
                ),
              ),
        ],

        const SizedBox(height: AimSpacing.sectionGap),
        AIMGradientButton(
          label: 'Done',
          onPressed: onDone,
          fullWidth: true,
          semanticLabel: 'Done viewing result',
        ),
      ],
    );
  }
}

class _BreakdownCard extends StatelessWidget {
  const _BreakdownCard({
    required this.item,
    required this.index,
  });

  final BreakdownItem item;
  final int index;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    final (IconData? icon, Color? iconColor) = switch (item.isCorrect) {
      true => (Icons.check_circle, AimColors.success500),
      false => (Icons.cancel, AimColors.error500),
      null => (null, null),
    };

    return AIMCard(
      variant: AIMCardVariant.standard,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              // Number circle — the result contract carries no section or
              // question names (only opaque IDs + points), so the design's
              // "Grammar"/"Vocabulary" labels cannot be shown; see file
              // header.
              DecoratedBox(
                decoration: BoxDecoration(
                  color: surfaces.surfaceSunken,
                  borderRadius: AimRadius.borderX2l,
                ),
                child: Padding(
                  padding: const EdgeInsets.all(AimSpacing.space8),
                  child: Text(
                    '$index',
                    style: AimTextStyles.label
                        .copyWith(color: surfaces.textPrimary),
                  ),
                ),
              ),
              const SizedBox(width: AimSpacing.componentGap),
              Expanded(
                child: Text(
                  '${_fmtPts(item.pointsAwarded)} / '
                  '${_fmtPts(item.pointsPossible)} pts',
                  style: AimTextStyles.bodyMd
                      .copyWith(color: surfaces.textPrimary),
                ),
              ),
              if (icon != null)
                Icon(icon, size: AimSizes.iconSm, color: iconColor),
            ],
          ),
          // Per-item progress bar (design screen 29). Guarded: with a zero
          // pointsPossible the bar's value/max division would be NaN, so it
          // is omitted for zero-point items.
          if (item.pointsPossible > 0) ...[
            const SizedBox(height: AimSpacing.space8),
            AIMProgressBar(
              value: item.pointsAwarded,
              max: item.pointsPossible,
              tone: AIMProgressBarTone.success,
              size: AIMProgressBarSize.sm,
            ),
          ],
        ],
      ),
    );
  }
}
