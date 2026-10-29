// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Assessment result" (29)
//   docs/design/ui-for-all-system-mobile/screenshots/light/29-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/29-screen.png
// Endpoint: GET /student/assessments/attempts/:attemptId/result
// Widgets: AIMTopAppBar, AIMCard, AIMBadge, AIMProgressBar,
//   AIMGradientButton, AIMFullScreenLoading, AIMFullScreenError
//
// P10-062: Assessment result page — displays backend-graded score (out of
// 100), pass/fail, correct/wrong/skipped counts, a per-question review with
// the student's answer and (once the backend reveals it) the correct answer,
// and a "My certificate" button after passing a course final exam.
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
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/formatting/score_percent.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

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
      appBar: AIMTopAppBar(
        title: widget.assessmentTitle,
        onBack: () => context.canPop()
            ? context.pop()
            : context.go(AppRoutePaths.assessments),
      ),
      body: SafeArea(top: false, child: switch (state) {
        AppAsyncLoading() => const AIMFullScreenLoading(
            semanticLabel: 'Loading result',
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: message,
            onRetry: _load,
          ),
        AppAsyncSuccess(:final data) => _ResultContent(
            result: data,
            onDone: () => context.go(AppRoutePaths.assessments),
          ),
        AppAsyncIdle() => const AIMFullScreenLoading(
            semanticLabel: 'Loading result',
          ),
      }),
    );
  }
}

class _ResultContent extends StatefulWidget {
  const _ResultContent({
    required this.result,
    required this.onDone,
  });

  final AttemptResultDetail result;
  final VoidCallback onDone;

  @override
  State<_ResultContent> createState() => _ResultContentState();
}

class _ResultContentState extends State<_ResultContent> {
  /// null = all questions.
  ReviewStatus? _filter;

  void _openCertificate(BuildContext context) {
    final id = widget.result.certificateId;
    if (id != null) {
      context.push('${AppRoutePaths.certificateDetail}?id=$id');
    } else {
      // Certificates are issued when the list is loaded after the course
      // is complete, so the list is the safe place to land.
      context.push(AppRoutePaths.certificates);
    }
  }

  @override
  Widget build(BuildContext context) {
    final result = widget.result;
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final statusColor =
        result.passed ? AimColors.success500 : AimColors.error500;
    final statusLabel =
        result.passed ? l10n.assessmentsResultPassed : l10n.assessmentsResultFailed;

    // Backend sends percentScore (out of 100). Older backends don't, so fall
    // back to the guarded display-only derivation in score_percent.dart.
    final int? outOf100 = result.percentScore ??
        scorePercent(numerator: result.score, denominator: result.maxScore);

    final hasReview = result.review.isNotEmpty;
    final visible = _filter == null
        ? result.review
        : result.review.where((r) => r.status == _filter).toList();
    final showCertificate = result.isCourseExam && result.passed;

    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      children: [
        // Score hero — score out of 100 + pass/fail pill.
        AIMCard(
          variant: AIMCardVariant.elevated,
          child: Column(
            children: [
              if (outOf100 != null) ...[
                SizedBox(
                  width: 132,
                  height: 132,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      CircularProgressIndicator(
                        value: (outOf100.clamp(0, 100)) / 100,
                        strokeWidth: 10,
                        backgroundColor: surfaces.surfaceSunken,
                        valueColor: AlwaysStoppedAnimation(statusColor),
                      ),
                      Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '$outOf100',
                              style: AimTextStyles.display
                                  .copyWith(color: statusColor, height: 1),
                            ),
                            Text(
                              l10n.assessmentsOutOf100,
                              style: AimTextStyles.bodySm
                                  .copyWith(color: surfaces.textSecondary),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ] else
                Text(
                  '${_fmtPts(result.score)} / ${_fmtPts(result.maxScore)}',
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
              const SizedBox(height: AimSpacing.space8),
              Text(
                l10n.assessmentsGradedOn(_formatDate(result.gradedAt)),
                style: AimTextStyles.bodySm
                    .copyWith(color: surfaces.textSecondary),
                textAlign: TextAlign.center,
              ),
              if (result.latePenaltyApplied) ...[
                const SizedBox(height: AimSpacing.space8),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.warning_amber_rounded,
                      size: AimSizes.iconSm,
                      color: AimColors.warning500,
                    ),
                    const SizedBox(width: AimSpacing.space4),
                    Flexible(
                      child: Text(
                        l10n.assessmentsLateSubmissionNote,
                        style: AimTextStyles.bodySm
                            .copyWith(color: AimColors.warning500),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),

        // Correct / wrong / skipped counts (backend-supplied).
        if (hasReview) ...[
          const SizedBox(height: AimSpacing.componentGap),
          Row(
            children: [
              Expanded(
                child: _StatTile(
                  icon: Icons.check_circle_rounded,
                  color: AimColors.success500,
                  value: result.correctCount,
                  label: l10n.assessmentsCorrectLabel,
                ),
              ),
              const SizedBox(width: AimSpacing.space8),
              Expanded(
                child: _StatTile(
                  icon: Icons.cancel_rounded,
                  color: AimColors.error500,
                  value: result.wrongCount,
                  label: l10n.assessmentsWrongLabel,
                ),
              ),
              const SizedBox(width: AimSpacing.space8),
              Expanded(
                child: _StatTile(
                  icon: Icons.remove_circle_outline_rounded,
                  color: surfaces.textMuted,
                  value: result.skippedCount,
                  label: l10n.assessmentsSkippedLabel,
                ),
              ),
            ],
          ),
        ],

        const SizedBox(height: AimSpacing.sectionGap),
        if (showCertificate) ...[
          AIMButton(
            variant: AIMButtonVariant.primary,
            size: AIMButtonSize.large,
            onPressed: () => _openCertificate(context),
            fullWidth: true,
            leadingIcon: const Icon(Icons.workspace_premium_rounded),
            semanticLabel: l10n.assessmentsMyCertificate,
            child: Text(l10n.assessmentsMyCertificate),
          ),
          const SizedBox(height: AimSpacing.space8),
        ],
        AIMButton(
          variant: showCertificate
              ? AIMButtonVariant.outline
              : AIMButtonVariant.primary,
          size: AIMButtonSize.large,
          onPressed: widget.onDone,
          fullWidth: true,
          semanticLabel: l10n.assessmentsDone,
          child: Text(l10n.assessmentsDone),
        ),

        // Per-question review.
        if (hasReview) ...[
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            l10n.assessmentsReviewTitle,
            style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
          ),
          if (!result.answersRevealed) ...[
            const SizedBox(height: AimSpacing.space4),
            Text(
              l10n.assessmentsAnswersHiddenNote,
              style:
                  AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            ),
          ],
          const SizedBox(height: AimSpacing.componentGap),
          Wrap(
            spacing: AimSpacing.space8,
            runSpacing: AimSpacing.space8,
            children: [
              _filterChip(null, '${l10n.assessmentsFilterAll} (${result.totalQuestions})'),
              _filterChip(ReviewStatus.wrong,
                  '${l10n.assessmentsWrongLabel} (${result.wrongCount})'),
              _filterChip(ReviewStatus.skipped,
                  '${l10n.assessmentsSkippedLabel} (${result.skippedCount})'),
              _filterChip(ReviewStatus.correct,
                  '${l10n.assessmentsCorrectLabel} (${result.correctCount})'),
            ],
          ),
          const SizedBox(height: AimSpacing.componentGap),
          if (visible.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: AimSpacing.space16),
              child: Text(
                l10n.assessmentsReviewEmptyFilter,
                textAlign: TextAlign.center,
                style: AimTextStyles.bodyMd
                    .copyWith(color: surfaces.textSecondary),
              ),
            ),
          ...visible.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
              child: _ReviewCard(item: item),
            ),
          ),
        ] else if (result.breakdown.isNotEmpty) ...[
          // Older backend without review data — keep the points breakdown.
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            l10n.assessmentsBreakdownTitle,
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
      ],
    );
  }

  Widget _filterChip(ReviewStatus? value, String label) {
    return ChoiceChip(
      label: Text(label),
      selected: _filter == value,
      onSelected: (_) => setState(() => _filter = value),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.icon,
    required this.color,
    required this.value,
    required this.label,
  });

  final IconData icon;
  final Color color;
  final int value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return AIMCard(
      variant: AIMCardVariant.standard,
      child: Column(
        children: [
          Icon(icon, color: color, size: AimSizes.iconMd),
          const SizedBox(height: AimSpacing.space4),
          Text(
            '$value',
            style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
          ),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
        ],
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.item});

  final ReviewItem item;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);

    final (IconData icon, Color color, String statusText) = switch (item.status) {
      ReviewStatus.correct =>
        (Icons.check_circle_rounded, AimColors.success500, l10n.assessmentsCorrectLabel),
      ReviewStatus.wrong =>
        (Icons.cancel_rounded, AimColors.error500, l10n.assessmentsWrongLabel),
      ReviewStatus.skipped =>
        (Icons.remove_circle_outline_rounded, surfaces.textMuted, l10n.assessmentsSkippedLabel),
    };

    return AIMCard(
      variant: AIMCardVariant.standard,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  l10n.assessmentsQuestionNumber(item.number),
                  style: AimTextStyles.label
                      .copyWith(color: surfaces.textSecondary),
                ),
              ),
              Icon(icon, size: AimSizes.iconSm, color: color),
              const SizedBox(width: AimSpacing.space4),
              Text(
                statusText,
                style: AimTextStyles.label.copyWith(color: color),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            item.prompt,
            style: AimTextStyles.bodyLg.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          ...item.options.map((option) {
            final chosen = option.id == item.selectedOptionId;
            final correct = item.correctOptionIds.contains(option.id);
            return Padding(
              padding: const EdgeInsets.only(bottom: AimSpacing.space8),
              child: _ReviewOptionRow(
                option: option,
                chosen: chosen,
                correct: correct,
                status: item.status,
              ),
            );
          }),
          if (item.status == ReviewStatus.skipped)
            Text(
              l10n.assessmentsNotAnswered,
              style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
            ),
        ],
      ),
    );
  }
}

class _ReviewOptionRow extends StatelessWidget {
  const _ReviewOptionRow({
    required this.option,
    required this.chosen,
    required this.correct,
    required this.status,
  });

  final ReviewOption option;
  final bool chosen;
  final bool correct;
  final ReviewStatus status;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);

    // Colours follow the backend verdict: the chosen option is green when
    // the backend marked the question correct, red when wrong; an option the
    // backend lists as correct is always green.
    final Color? tone = correct || (chosen && status == ReviewStatus.correct)
        ? AimColors.success500
        : chosen
            ? AimColors.error500
            : null;

    final tags = <String>[
      if (chosen) l10n.assessmentsYourAnswer,
      if (correct) l10n.assessmentsCorrectAnswer,
    ];

    return DecoratedBox(
      decoration: BoxDecoration(
        color: tone?.withValues(alpha: 0.08) ?? surfaces.surfaceSunken,
        borderRadius: AimRadius.borderMd,
        border: Border.all(
          color: tone ?? surfaces.border,
          width: tone != null ? 1.5 : 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsetsDirectional.symmetric(
          horizontal: AimSpacing.space12,
          vertical: AimSpacing.space8,
        ),
        child: Row(
          children: [
            Text(
              option.label,
              style: AimTextStyles.label
                  .copyWith(color: tone ?? surfaces.textSecondary),
            ),
            const SizedBox(width: AimSpacing.space12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    option.text,
                    style: AimTextStyles.bodyMd
                        .copyWith(color: surfaces.textPrimary),
                  ),
                  if (tags.isNotEmpty)
                    Text(
                      tags.join(' · '),
                      style: AimTextStyles.bodySm.copyWith(
                        color: tone ?? surfaces.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                ],
              ),
            ),
            if (tone != null)
              Icon(
                tone == AimColors.success500
                    ? Icons.check_rounded
                    : Icons.close_rounded,
                size: AimSizes.iconSm,
                color: tone,
              ),
          ],
        ),
      ),
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
