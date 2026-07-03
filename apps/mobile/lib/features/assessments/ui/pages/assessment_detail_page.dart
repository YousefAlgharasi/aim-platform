// P10-055/P10-057: AssessmentDetailPage — displays assessment info before attempt.
// All data is backend-supplied; Flutter never computes deadline status.
//
// TASK-22: restyled to match design screen 25 — gradient header ("Quiz
// details" / "Exam details", derived from the real backend `type`), stat
// tiles for Questions/Time limit/Max attempts, a "Past results" link to the
// existing result-history route, and a gradient Start Attempt button.
//
// Deviations from the mockup (real-data-only rules):
// - The mockup's "70% Passing score" and "1 / 3 Attempts used" tiles have no
//   backing field anywhere in AssessmentDetail — the backend detail payload
//   has no passingScore or attemptsUsed/attemptCount. Neither is fabricated;
//   "Max attempts" (a real field) is shown instead of "Attempts used".

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class AssessmentDetailPage extends ConsumerStatefulWidget {
  const AssessmentDetailPage({
    required this.assessmentId,
    required this.assessmentTitle,
    super.key,
  });

  final String assessmentId;
  final String assessmentTitle;

  @override
  ConsumerState<AssessmentDetailPage> createState() =>
      _AssessmentDetailPageState();
}

class _AssessmentDetailPageState extends ConsumerState<AssessmentDetailPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(assessmentDetailProvider.notifier).load(
          bearerToken: token,
          assessmentId: widget.assessmentId,
        );
  }

  void _navigateToStartAttempt(AssessmentDetail detail) {
    context.push(
      '/student/assessments/start',
      extra: {
        'assessmentId': detail.id,
        'assessmentTitle': detail.title,
        'timeLimitSeconds': detail.timeLimitSeconds,
      },
    );
  }

  void _navigateToPastResults(AssessmentDetail detail) {
    context.push(
      '/student/assessments/history',
      extra: {
        'assessmentId': detail.id,
        'assessmentTitle': detail.title,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(assessmentDetailProvider);
    final surfaces = aimSurfacesOf(context);
    final loc = AppLocalizations.of(context);
    final headerTitle = switch (state) {
      AppAsyncSuccess(:final data) => data.type == 'exam'
          ? loc.assessmentsExamDetailsTitle
          : loc.assessmentsQuizDetailsTitle,
      _ => loc.assessmentsDetailsTitle,
    };

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _AssessmentDetailHeader(title: headerTitle),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() => AIMFullScreenLoading(
                  semanticLabel: loc.assessmentsLoadingAssessmentSemantic,
                ),
              AppAsyncFailure(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: _load,
                ),
              AppAsyncSuccess(:final data) => _AssessmentDetailContent(
                  detail: data,
                  onStartAttempt: () => _navigateToStartAttempt(data),
                  onViewPastResults: () => _navigateToPastResults(data),
                ),
              AppAsyncIdle() => AIMFullScreenLoading(
                  semanticLabel: loc.assessmentsLoadingAssessmentSemantic,
                ),
            },
          ),
        ],
      ),
    );
  }
}

// ── Gradient header ─────────────────────────────────────────────────────────

class _AssessmentDetailHeader extends StatelessWidget {
  const _AssessmentDetailHeader({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Container(
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
                label: AppLocalizations.of(context).commonBack,
                child: InkWell(
                  onTap: () {
                    if (context.canPop()) context.pop();
                  },
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
      ),
    );
  }
}

class _AssessmentDetailContent extends StatelessWidget {
  const _AssessmentDetailContent({
    required this.detail,
    required this.onStartAttempt,
    required this.onViewPastResults,
  });

  final AssessmentDetail detail;
  final VoidCallback onStartAttempt;
  final VoidCallback onViewPastResults;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final loc = AppLocalizations.of(context);
    final totalQuestions =
        detail.sections.fold<int>(0, (sum, s) => sum + s.questionCount);

    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      children: [
        Text(
          detail.title,
          style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
        ),
        if (detail.description != null && detail.description!.isNotEmpty) ...[
          const SizedBox(height: AimSpacing.space4),
          Text(
            detail.description!,
            style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          ),
        ],
        const SizedBox(height: AimSpacing.sectionGap),

        Wrap(
          spacing: AimSpacing.componentGap,
          runSpacing: AimSpacing.componentGap,
          children: [
            _StatTile(
              value: '$totalQuestions',
              label: loc.assessmentsQuestionsLabel,
            ),
            if (detail.timeLimitSeconds != null)
              _StatTile(
                value: _formatDuration(loc, detail.timeLimitSeconds!),
                label: loc.assessmentsTimeLimitLabel,
              ),
            _StatTile(
              value: '${detail.maxAttempts}',
              label: loc.assessmentsMaxAttemptsLabel,
            ),
          ],
        ),
        const SizedBox(height: AimSpacing.componentGap),

        _PastResultsCard(onTap: onViewPastResults),

        if (detail.deadline != null) ...[
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            loc.assessmentsDeadlineHeading,
            style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          _DeadlineCard(deadline: detail.deadline!),
        ],

        if (detail.sections.isNotEmpty) ...[
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            loc.assessmentsSectionsHeading,
            style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          ...detail.sections.map(
            (section) => Padding(
              padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
              child: _SectionTile(section: section),
            ),
          ),
        ],

        const SizedBox(height: AimSpacing.sectionGap),
        AIMGradientButton(
          label: loc.assessmentsStartAttemptButton,
          fullWidth: true,
          onPressed: onStartAttempt,
          semanticLabel: loc.assessmentsStartAttemptSemantic(detail.title),
        ),
      ],
    );
  }

  String _formatDuration(AppLocalizations loc, int seconds) {
    final minutes = seconds ~/ 60;
    final remaining = seconds % 60;
    if (remaining == 0) return loc.assessmentsDurationMinutes(minutes);
    return loc.assessmentsDurationMinutesSeconds(minutes, remaining);
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final shadows = aimShadowsOf(context);

    return SizedBox(
      width: (MediaQuery.sizeOf(context).width -
              AimSpacing.screenPaddingMobile * 2 -
              AimSpacing.componentGap) /
          2,
      child: Container(
        padding: const EdgeInsets.all(AimSpacing.cardPadding),
        decoration: BoxDecoration(
          color: surfaces.surface,
          borderRadius: AimRadius.borderLg,
          boxShadow: shadows.card,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
            ),
            const SizedBox(height: AimSpacing.space4),
            Text(
              label,
              style: AimTextStyles.bodySm.copyWith(
                color: surfaces.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PastResultsCard extends StatelessWidget {
  const _PastResultsCard({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final loc = AppLocalizations.of(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      interactive: true,
      onTap: onTap,
      semanticLabel: loc.assessmentsPastResultsSemantic,
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  loc.assessmentsPastResultsTitle,
                  style:
                      AimTextStyles.title.copyWith(color: surfaces.textPrimary),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  loc.assessmentsViewAttemptHistorySubtitle,
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Icon(
            Icons.chevron_right,
            size: AimSizes.iconSm,
            color: surfaces.textSecondary,
          ),
        ],
      ),
    );
  }
}

class _DeadlineCard extends StatelessWidget {
  const _DeadlineCard({required this.deadline});

  final AssessmentDeadline deadline;

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final (color, label) = switch (deadline.status) {
      'open' => (AimColors.success500, loc.assessmentsDeadlineStatusOpen),
      'upcoming' => (AimColors.info500, loc.assessmentsDeadlineStatusUpcoming),
      'closed' ||
      'expired' =>
        (AimColors.neutral500, loc.assessmentsDeadlineStatusClosed),
      'late' => (AimColors.warning500, loc.assessmentsDeadlineStatusLate),
      'missed' => (AimColors.error500, loc.assessmentsDeadlineStatusMissed),
      _ => (AimColors.neutral500, deadline.status),
    };

    return AIMCard(
      variant: AIMCardVariant.elevated,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AimSpacing.space8,
              vertical: AimSpacing.space2,
            ),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: AimRadius.borderSm,
            ),
            child: Text(
              label,
              style: Theme.of(context)
                  .textTheme
                  .labelSmall
                  ?.copyWith(color: color),
            ),
          ),
          const SizedBox(height: AimSpacing.space8),
          _DeadlineDateRow(
            label: loc.assessmentsOpensLabel,
            value: deadline.opensAt,
          ),
          _DeadlineDateRow(
            label: loc.assessmentsClosesLabel,
            value: deadline.closesAt,
          ),
          if (deadline.extendedClosesAt != null)
            _DeadlineDateRow(
              label: loc.assessmentsExtendedCloseLabel,
              value: deadline.extendedClosesAt!,
            ),
        ],
      ),
    );
  }
}

class _DeadlineDateRow extends StatelessWidget {
  const _DeadlineDateRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: AimSpacing.space4),
      child: Row(
        children: [
          Text(
            '$label: ',
            style:
                AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
          Expanded(
            child: Text(
              value,
              style: AimTextStyles.bodySm
                  .copyWith(color: surfaces.textPrimary),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTile extends StatelessWidget {
  const _SectionTile({required this.section});

  final AssessmentSection section;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.standard,
      child: Row(
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              color: surfaces.surfaceSunken,
              borderRadius: AimRadius.borderX2l,
            ),
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space8),
              child: Text(
                '${section.order}',
                style: Theme.of(context).textTheme.titleSmall,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  section.title,
                  style: Theme.of(context).textTheme.titleSmall,
                ),
                Text(
                  AppLocalizations.of(context)
                      .assessmentsQuestionCount(section.questionCount),
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
