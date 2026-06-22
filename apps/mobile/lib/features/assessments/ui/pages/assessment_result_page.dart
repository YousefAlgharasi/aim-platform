// P10-062: Assessment result page — displays backend-graded score,
// pass/fail status, breakdown, and optional late-penalty indicator.
// Flutter never computes score; all values are backend-supplied.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';

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
        AppAsyncLoading() => AIMFullScreenLoading(
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
        AppAsyncIdle() => AIMFullScreenLoading(
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

    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      children: [
        // Score display
        Center(
          child: Text(
            '${result.score} / ${result.maxScore}',
            style: AimTextStyles.h1.copyWith(color: surfaces.textPrimary),
          ),
        ),
        const SizedBox(height: AimSpacing.componentGap),

        // Pass/fail badge
        Center(
          child: Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AimSpacing.space12,
              vertical: AimSpacing.space4,
            ),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.12),
              borderRadius: AimRadius.borderSm,
            ),
            child: Text(
              statusLabel,
              style: AimTextStyles.label.copyWith(color: statusColor),
            ),
          ),
        ),
        const SizedBox(height: AimSpacing.componentGap),

        // Late penalty indicator
        if (result.latePenaltyApplied) ...[
          Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
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
            'Graded at ${result.gradedAt}',
            style:
                AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
        ),

        // Breakdown section
        if (result.breakdown.isNotEmpty) ...[
          const SizedBox(height: AimSpacing.sectionGap),
          Text(
            'Breakdown',
            style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
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
        AIMButton(
          onPressed: onDone,
          fullWidth: true,
          size: AIMButtonSize.large,
          semanticLabel: 'Done viewing result',
          child: const Text('Done'),
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
                '$index',
                style: Theme.of(context).textTheme.titleSmall,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Text(
              '${item.pointsAwarded} / ${item.pointsPossible} pts',
              style: AimTextStyles.bodyMd
                  .copyWith(color: surfaces.textPrimary),
            ),
          ),
          if (icon != null)
            Icon(icon, size: AimSizes.iconSm, color: iconColor),
        ],
      ),
    );
  }
}
