// P10-056: DeadlinesPage — displays upcoming, active, late, missed, and closed deadlines.
// All deadline grouping is backend-derived; Flutter never computes status.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';

class DeadlinesPage extends ConsumerStatefulWidget {
  const DeadlinesPage({super.key});

  @override
  ConsumerState<DeadlinesPage> createState() => _DeadlinesPageState();
}

class _DeadlinesPageState extends ConsumerState<DeadlinesPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(deadlinesProvider.notifier).load(bearerToken: token);
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(deadlinesProvider.notifier).refresh(bearerToken: token);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(deadlinesProvider);

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'Deadlines'),
      body: switch (state) {
        AppAsyncLoading() => const AIMFullScreenLoading(
            semanticLabel: 'Loading deadlines',
          ),
        AppAsyncFailure(:final message) => AIMFullScreenError(
            message: message,
            onRetry: _load,
          ),
        AppAsyncSuccess(:final data) => _DeadlinesContent(
            deadlines: data,
            onRefresh: _refresh,
          ),
        AppAsyncIdle() => const AIMFullScreenLoading(
            semanticLabel: 'Loading deadlines',
          ),
      },
    );
  }
}

class _DeadlinesContent extends StatelessWidget {
  const _DeadlinesContent({
    required this.deadlines,
    required this.onRefresh,
  });

  final StudentDeadlines deadlines;
  final Future<void> Function() onRefresh;

  bool get _isEmpty =>
      deadlines.active.isEmpty &&
      deadlines.upcoming.isEmpty &&
      deadlines.late.isEmpty &&
      deadlines.missed.isEmpty &&
      deadlines.closed.isEmpty;

  @override
  Widget build(BuildContext context) {
    if (_isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.event_available_outlined),
        title: 'No deadlines',
        subtitle: 'Your assessment deadlines will appear here.',
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        children: [
          if (deadlines.active.isNotEmpty)
            _DeadlineSection(
              title: 'Active',
              color: AimColors.success500,
              items: deadlines.active,
            ),
          if (deadlines.upcoming.isNotEmpty)
            _DeadlineSection(
              title: 'Upcoming',
              color: AimColors.info500,
              items: deadlines.upcoming,
            ),
          if (deadlines.late.isNotEmpty)
            _DeadlineSection(
              title: 'Late',
              color: AimColors.warning500,
              items: deadlines.late,
            ),
          if (deadlines.missed.isNotEmpty)
            _DeadlineSection(
              title: 'Missed',
              color: AimColors.error500,
              items: deadlines.missed,
            ),
          if (deadlines.closed.isNotEmpty)
            _DeadlineSection(
              title: 'Closed',
              color: AimColors.neutral500,
              items: deadlines.closed,
            ),
        ],
      ),
    );
  }
}

class _DeadlineSection extends StatelessWidget {
  const _DeadlineSection({
    required this.title,
    required this.color,
    required this.items,
  });

  final String title;
  final Color color;
  final List<StudentDeadlineItem> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(
            bottom: AimSpacing.space8,
            top: AimSpacing.space8,
          ),
          child: Row(
            children: [
              Container(
                width: AimSpacing.space8,
                height: AimSpacing.space8,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: AimSpacing.space8),
              Text(
                '$title (${items.length})',
                style: AimTextStyles.title.copyWith(color: color),
              ),
            ],
          ),
        ),
        ...items.map(
          (item) => Padding(
            padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
            child: _DeadlineTile(item: item, statusColor: color),
          ),
        ),
        const SizedBox(height: AimSpacing.space8),
      ],
    );
  }
}

class _DeadlineTile extends StatelessWidget {
  const _DeadlineTile({
    required this.item,
    required this.statusColor,
  });

  final StudentDeadlineItem item;
  final Color statusColor;

  @override
  Widget build(BuildContext context) {
    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: 'Deadline: ${item.assessmentTitle}',
      child: Row(
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.12),
              borderRadius: AimRadius.borderX2l,
            ),
            child: Padding(
              padding: const EdgeInsets.all(AimSpacing.space12),
              child: Icon(
                Icons.event_outlined,
                size: AimSizes.iconMd,
                color: statusColor,
              ),
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.assessmentTitle,
                  style: Theme.of(context).textTheme.titleMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AimSpacing.space4),
                  child: Text(
                    'Opens: ${item.opensAt}',
                    style: Theme.of(context).textTheme.bodySmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AimSpacing.space2),
                  child: Text(
                    'Closes: ${item.closesAt}',
                    style: Theme.of(context).textTheme.bodySmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                _StatusChip(status: item.status),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final (color, label) = switch (status) {
      'open' => (AimColors.success500, 'Open'),
      'upcoming' => (AimColors.info500, 'Upcoming'),
      'closed' || 'expired' => (AimColors.neutral500, 'Closed'),
      'late' => (AimColors.warning500, 'Late'),
      'missed' => (AimColors.error500, 'Missed'),
      _ => (AimColors.neutral500, status),
    };

    return Padding(
      padding: const EdgeInsets.only(top: AimSpacing.space4),
      child: Container(
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
    );
  }
}
