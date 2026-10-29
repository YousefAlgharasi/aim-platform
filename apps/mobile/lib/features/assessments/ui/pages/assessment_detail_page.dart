// P10-055/P10-057: AssessmentDetailPage — displays assessment info before attempt.
// All data is backend-supplied; Flutter never computes deadline status.
//
// TASK-22: restyled to match design screen 25 — gradient header ("Quiz
// details" / "Exam details", derived from the real backend `type`), stat
// tiles for Questions/Time limit/Max attempts, a "Past results" link to the
// existing result-history route, and a gradient Start Attempt button.
//
// Attempts used/left, best score, passed, and whether Start is allowed all
// come from the backend detail payload (canStart / blockedReason mirror the
// checks the backend runs when an attempt starts). The pass mark is never
// sent to the client, so it isn't shown.

import 'package:flutter/material.dart';
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
    final l10n = AppLocalizations.of(context);
    final headerTitle = switch (state) {
      AppAsyncSuccess(:final data) => data.type == 'exam'
          ? l10n.assessmentsDetailsTitleExam
          : l10n.assessmentsDetailsTitleQuiz,
      _ => l10n.assessmentsDetailsTitle,
    };

    return Scaffold(
      backgroundColor: surfaces.background,
      appBar: AIMTopAppBar(
        title: headerTitle,
        onBack: () {
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/student/assessments');
          }
        },
      ),
      body: SafeArea(top: false, child: switch (state) {
        AppAsyncLoading() => AIMFullScreenLoading(
            semanticLabel: l10n.assessmentsLoadingLabel,
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
            semanticLabel: l10n.assessmentsLoadingLabel,
          ),
      }),
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
    final l10n = AppLocalizations.of(context);
    final blockedMessage = switch (detail.blockedReason) {
      'CHAPTER_NOT_COMPLETE' => l10n.assessmentsBlockedChapter,
      'COURSE_NOT_COMPLETE' => l10n.assessmentsBlockedCourse,
      'MAX_ATTEMPTS_REACHED' => l10n.assessmentsBlockedMaxAttempts,
      _ => null,
    };
    final startLabel = detail.hasActiveAttempt
        ? l10n.assessmentsResumeAttempt
        : (detail.attemptsUsed > 0
            ? l10n.assessmentsRetakeAttempt
            : l10n.assessmentsStartAttempt);

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
                value: '${detail.questionCount}',
                label: l10n.assessmentsStatQuestions),
            if (detail.timeLimitSeconds != null)
              _StatTile(
                value: l10n.assessmentsDurationMinutes(
                    (detail.timeLimitSeconds! / 60).ceil()),
                label: l10n.assessmentsStatTimeLimit,
              ),
            _StatTile(
                value: '${detail.attemptsRemaining}',
                label: l10n.assessmentsStatAttemptsLeft),
            if (detail.bestScorePercent != null)
              _StatTile(
                value: '${detail.bestScorePercent}%',
                label: l10n.assessmentsStatBestScore),
          ],
        ),
        const SizedBox(height: AimSpacing.space8),
        Row(
          children: [
            Expanded(
              child: Text(
                l10n.assessmentsAttemptsUsed(
                    detail.attemptsUsed, detail.maxAttempts),
                style: AimTextStyles.bodySm
                    .copyWith(color: surfaces.textSecondary),
              ),
            ),
            if (detail.passed)
              Container(
                padding: const EdgeInsetsDirectional.symmetric(
                  horizontal: AimSpacing.space8,
                  vertical: AimSpacing.space2,
                ),
                decoration: BoxDecoration(
                  color: AimColors.success500.withValues(alpha: 0.12),
                  borderRadius: AimRadius.borderSm,
                ),
                child: Text(
                  l10n.assessmentsPassedBadge,
                  style: AimTextStyles.bodySm.copyWith(
                    color: AimColors.success700,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: AimSpacing.componentGap),

        _PastResultsCard(onTap: onViewPastResults),

        if (detail.deadline != null) ...[
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            AppLocalizations.of(context).assessmentsDeadlinesTitle,
            style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          _DeadlineCard(deadline: detail.deadline!),
        ],

        if (detail.sections.isNotEmpty) ...[
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            l10n.assessmentsSectionsTitle,
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
        if (blockedMessage != null) ...[
          AIMCard(
            variant: AIMCardVariant.standard,
            child: Row(
              children: [
                Icon(Icons.lock_outline,
                    size: AimSizes.iconSm, color: surfaces.textSecondary),
                const SizedBox(width: AimSpacing.space8),
                Expanded(
                  child: Text(
                    blockedMessage,
                    style: AimTextStyles.bodySm
                        .copyWith(color: surfaces.textSecondary),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AimSpacing.componentGap),
        ],
        AIMButton(
          variant: AIMButtonVariant.primary,
          size: AIMButtonSize.large,
          fullWidth: true,
          disabled: !detail.canStart,
          onPressed: detail.canStart ? onStartAttempt : null,
          semanticLabel: '$startLabel ${detail.title}',
          child: Text(startLabel),
        ),
      ],
    );
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
    final l10n = AppLocalizations.of(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      interactive: true,
      onTap: onTap,
      semanticLabel:
          '${l10n.assessmentsPastResultsTitle}, ${l10n.assessmentsPastResultsSubtitle}',
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.assessmentsPastResultsTitle,
                  style:
                      AimTextStyles.title.copyWith(color: surfaces.textPrimary),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  l10n.assessmentsPastResultsSubtitle,
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
    final l10n = AppLocalizations.of(context);
    final (color, label) = switch (deadline.status) {
      'open' => (AimColors.success500, l10n.assessmentsDeadlineOpen),
      'upcoming' => (AimColors.info500, l10n.assessmentsDeadlineUpcoming),
      'closed' || 'expired' => (AimColors.neutral500, l10n.assessmentsDeadlineClosed),
      'late' => (AimColors.warning500, l10n.assessmentsDeadlineLate),
      'missed' => (AimColors.error500, l10n.assessmentsDeadlineMissed),
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
              label: AppLocalizations.of(context).assessmentsOpensLabel,
              value: deadline.opensAt),
          _DeadlineDateRow(
              label: AppLocalizations.of(context).assessmentsClosesLabel,
              value: deadline.closesAt),
          if (deadline.extendedClosesAt != null)
            _DeadlineDateRow(
              label:
                  AppLocalizations.of(context).assessmentsExtendedCloseLabel,
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
                      .assessmentsSectionQuestionCount(section.questionCount),
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
