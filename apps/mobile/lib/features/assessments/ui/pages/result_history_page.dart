// P10-063: Result history page — displays previous attempts/results
// for an assessment. All data is backend-supplied; Flutter never
// computes scores.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';

class ResultHistoryPage extends ConsumerStatefulWidget {
  const ResultHistoryPage({
    required this.assessmentId,
    required this.assessmentTitle,
    super.key,
  });

  final String assessmentId;
  final String assessmentTitle;

  @override
  ConsumerState<ResultHistoryPage> createState() => _ResultHistoryPageState();
}

class _ResultHistoryPageState extends ConsumerState<ResultHistoryPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(resultHistoryProvider.notifier).load(
          bearerToken: token,
          assessmentId: widget.assessmentId,
        );
  }

  void _onItemTap(ResultHistoryItem item) {
    Navigator.of(context).pushNamed(
      '/student/assessments/result',
      arguments: {
        'attemptId': item.attemptId,
        'assessmentTitle': widget.assessmentTitle,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(resultHistoryProvider);

    return Scaffold(
      appBar: AIMTopAppBar(title: widget.assessmentTitle),
      body: switch (state) {
        AppAsyncLoading() => const AIMFullScreenLoading(
            semanticLabel: 'Loading result history',
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: message,
            onRetry: _load,
          ),
        AppAsyncSuccess(:final data) => _ResultHistoryContent(
            history: data,
            onItemTap: _onItemTap,
          ),
        AppAsyncIdle() => const AIMFullScreenLoading(
            semanticLabel: 'Loading result history',
          ),
      },
    );
  }
}

class _ResultHistoryContent extends StatelessWidget {
  const _ResultHistoryContent({
    required this.history,
    required this.onItemTap,
  });

  final ResultHistory history;
  final void Function(ResultHistoryItem) onItemTap;

  @override
  Widget build(BuildContext context) {
    if (history.results.isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.history_outlined),
        title: 'No results yet',
        subtitle: 'Your past attempt results will appear here.',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(
        horizontal: AimSpacing.screenPaddingMobile,
        vertical: AimSpacing.sectionGap,
      ),
      itemCount: history.results.length,
      separatorBuilder: (_, __) =>
          const SizedBox(height: AimSpacing.listItemGap),
      itemBuilder: (context, index) {
        final item = history.results[index];
        return _ResultHistoryTile(
          item: item,
          onTap: () => onItemTap(item),
        );
      },
    );
  }
}

class _ResultHistoryTile extends StatelessWidget {
  const _ResultHistoryTile({
    required this.item,
    required this.onTap,
  });

  final ResultHistoryItem item;
  final VoidCallback onTap;

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '--';
    try {
      final date = DateTime.parse(dateStr);
      final months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      final hour = date.hour % 12 == 0 ? 12 : date.hour % 12;
      final period = date.hour < 12 ? 'AM' : 'PM';
      final minute = date.minute.toString().padLeft(2, '0');
      return '${months[date.month - 1]} ${date.day}, ${date.year}, $hour:$minute $period';
    } catch (_) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    final passed = item.passed;

    return AIMCard(
      interactive: true,
      onTap: onTap,
      semanticLabel:
          'Attempt ${item.attemptNumber}, score ${item.score} out of ${item.maxScore}, ${passed ? "passed" : "failed"}',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Attempt ${item.attemptNumber}',
                style: AimTextStyles.title,
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AimSpacing.space8,
                  vertical: AimSpacing.space4,
                ),
                decoration: BoxDecoration(
                  color: passed
                      ? AimColors.success50
                      : AimColors.error50,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  passed ? 'Passed' : 'Failed',
                  style: AimTextStyles.label.copyWith(
                    color: passed
                        ? AimColors.success700
                        : AimColors.error700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            'Score: ${item.score} / ${item.maxScore}',
            style: AimTextStyles.bodyMd,
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            'Submitted: ${_formatDate(item.submittedAt)}',
            style: AimTextStyles.bodySm.copyWith(
              color: Theme.of(context)
                  .colorScheme
                  .onSurface
                  .withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }
}
