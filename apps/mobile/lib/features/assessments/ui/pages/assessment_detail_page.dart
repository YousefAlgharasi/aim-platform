// P10-055/P10-057: AssessmentDetailPage — displays assessment info before attempt.
// All data is backend-supplied; Flutter never computes deadline status.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';

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
    Navigator.of(context).pushNamed(
      '/student/assessments/start',
      arguments: {
        'assessmentId': detail.id,
        'assessmentTitle': detail.title,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(assessmentDetailProvider);

    return Scaffold(
      appBar: AIMTopAppBar(title: widget.assessmentTitle),
      body: switch (state) {
        AppAsyncLoading() => const AIMFullScreenLoading(
            semanticLabel: 'Loading assessment',
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: message,
            onRetry: _load,
          ),
        AppAsyncSuccess(:final data) => _AssessmentDetailContent(
            detail: data,
            onStartAttempt: () => _navigateToStartAttempt(data),
          ),
        AppAsyncIdle() => const AIMFullScreenLoading(
            semanticLabel: 'Loading assessment',
          ),
      },
    );
  }
}

class _AssessmentDetailContent extends StatelessWidget {
  const _AssessmentDetailContent({
    required this.detail,
    required this.onStartAttempt,
  });

  final AssessmentDetail detail;
  final VoidCallback onStartAttempt;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final totalQuestions =
        detail.sections.fold<int>(0, (sum, s) => sum + s.questionCount);

    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      children: [
        if (detail.description != null && detail.description!.isNotEmpty) ...[
          Text(
            detail.description!,
            style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
        ],

        _InfoRow(
          icon: Icons.category_outlined,
          label: 'Type',
          value: detail.type == 'exam' ? 'Exam' : 'Quiz',
        ),
        _InfoRow(
          icon: Icons.help_outline,
          label: 'Total questions',
          value: '$totalQuestions',
        ),
        _InfoRow(
          icon: Icons.replay,
          label: 'Max attempts',
          value: '${detail.maxAttempts}',
        ),
        if (detail.timeLimitSeconds != null)
          _InfoRow(
            icon: Icons.timer_outlined,
            label: 'Time limit',
            value: _formatDuration(detail.timeLimitSeconds!),
          ),

        if (detail.deadline != null) ...[
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            'Deadline',
            style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          _DeadlineCard(deadline: detail.deadline!),
        ],

        if (detail.sections.isNotEmpty) ...[
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            'Sections',
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
        AIMButton(
          onPressed: onStartAttempt,
          fullWidth: true,
          size: AIMButtonSize.large,
          semanticLabel: 'Start attempt for ${detail.title}',
          child: const Text('Start Attempt'),
        ),
      ],
    );
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final remaining = seconds % 60;
    if (remaining == 0) return '$minutes min';
    return '$minutes min $remaining sec';
  }
}

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
    final surfaces = aimSurfacesOf(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: AimSpacing.space12),
      child: Row(
        children: [
          Icon(icon, size: AimSizes.iconSm, color: surfaces.textSecondary),
          const SizedBox(width: AimSpacing.space8),
          Expanded(
            child: Text(
              label,
              style: AimTextStyles.bodyMd
                  .copyWith(color: surfaces.textSecondary),
            ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.titleSmall,
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
    final (color, label) = switch (deadline.status) {
      'open' => (AimColors.success500, 'Open'),
      'upcoming' => (AimColors.info500, 'Upcoming'),
      'closed' || 'expired' => (AimColors.neutral500, 'Closed'),
      'late' => (AimColors.warning500, 'Late'),
      'missed' => (AimColors.error500, 'Missed'),
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
          _DeadlineDateRow(label: 'Opens', value: deadline.opensAt),
          _DeadlineDateRow(label: 'Closes', value: deadline.closesAt),
          if (deadline.extendedClosesAt != null)
            _DeadlineDateRow(
              label: 'Extended close',
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
                  '${section.questionCount} question${section.questionCount == 1 ? '' : 's'}',
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
