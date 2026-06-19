// Phase 6 — P6-102
// ReviewSchedulePage — dedicated read-only view for backend-approved AIM
// review schedules.
//
// All review schedule data (dueAt, intervalDays, repetitionCount, status) is
// AIM Engine output persisted by the backend. Flutter displays verbatim;
// never modifies, reschedules, or recalculates intervals locally.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes or mutates review schedules.
// - All values come from backend via aimResultsProvider.
// - studentId sourced from authContextProvider (JWT-resolved).
// - Bearer token from authFlowProvider; never stored locally.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
//
// RTL/Arabic rules:
// - EdgeInsets.symmetric — RTL-safe.
// - CrossAxisAlignment.start in Column — direction-aware.
// - AIMTopAppBar mirrors RTL back icon internally.
// - Row children — reversed automatically by Directionality in RTL.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

class ReviewSchedulePage extends ConsumerStatefulWidget {
  const ReviewSchedulePage({super.key});

  @override
  ConsumerState<ReviewSchedulePage> createState() => _ReviewSchedulePageState();
}

class _ReviewSchedulePageState extends ConsumerState<ReviewSchedulePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final authContext = ref.read(authContextProvider);
    final authFlow = ref.read(authFlowProvider);
    final contextData = switch (authContext) {
      AppAsyncSuccess(:final data) => data,
      _ => null,
    };
    if (contextData == null) return;
    final token = authFlow.accessToken;
    if (token == null || token.isEmpty) return;

    ref.read(aimResultsProvider.notifier).load(
          bearerToken: token,
          studentId: contextData.user.id,
        );
  }

  Future<void> _refresh() async {
    final authContext = ref.read(authContextProvider);
    final authFlow = ref.read(authFlowProvider);
    final contextData = switch (authContext) {
      AppAsyncSuccess(:final data) => data,
      _ => null,
    };
    if (contextData == null) return;
    final token = authFlow.accessToken;
    if (token == null || token.isEmpty) return;

    await ref.read(aimResultsProvider.notifier).refresh(
          bearerToken: token,
          studentId: contextData.user.id,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(aimResultsProvider);

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'Review Schedule'),
      body: switch (state) {
        AppAsyncLoading() => const AIMFullScreenLoading(
            semanticLabel: 'Loading review schedule'),
        AppAsyncFailure(:final message) =>
          AIMFullScreenError(message: message, onRetry: _load),
        AppAsyncSuccess(:final data) => data.reviewSchedules.isEmpty
            ? const AIMEmptyState(
                icon: Icon(Icons.schedule_outlined),
                title: 'No reviews scheduled',
                subtitle:
                    'Complete practice sessions to receive AIM-computed review reminders.',
              )
            : _ReviewScheduleList(
                schedules: data.reviewSchedules,
                onRefresh: _refresh,
              ),
        AppAsyncIdle() => const AIMFullScreenLoading(
            semanticLabel: 'Loading review schedule'),
      },
    );
  }
}

class _ReviewScheduleList extends StatelessWidget {
  const _ReviewScheduleList({
    required this.schedules,
    required this.onRefresh,
  });

  final List<AimReviewScheduleModel> schedules;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        itemCount: schedules.length,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AimSpacing.listItemGap),
        itemBuilder: (_, i) => _ReviewScheduleDetailCard(model: schedules[i]),
      ),
    );
  }
}

class _ReviewScheduleDetailCard extends StatelessWidget {
  const _ReviewScheduleDetailCard({required this.model});
  final AimReviewScheduleModel model;

  AIMBadgeTone get _statusTone => switch (model.status) {
        'pending' => AIMBadgeTone.warning,
        'completed' => AIMBadgeTone.success,
        'skipped' => AIMBadgeTone.neutral,
        'overdue' => AIMBadgeTone.error,
        _ => AIMBadgeTone.neutral,
      };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel:
          '${model.skillId} review due ${model.dueAt} — ${model.status}',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.schedule_outlined,
                size: AimSizes.iconSm,
                color: AimColors.primary500,
              ),
              const SizedBox(width: AimSpacing.space8),
              Expanded(
                child: Text(
                  model.skillId,
                  style: AimTextStyles.title
                      .copyWith(color: surfaces.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              AIMBadge(
                tone: _statusTone,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(model.status),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.componentGap),
          Row(
            children: [
              Icon(
                Icons.calendar_today_outlined,
                size: AimSizes.iconSm,
                color: surfaces.textSecondary,
              ),
              const SizedBox(width: AimSpacing.space4),
              Text(
                'Due: ${model.dueAt}',
                style:
                    AimTextStyles.bodySm.copyWith(color: surfaces.textPrimary),
              ),
              const Spacer(),
              AIMBadge(
                tone: AIMBadgeTone.primary,
                variant: AIMBadgeVariant.soft,
                child: Text('${model.intervalDays}d interval'),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Repetition #${model.repetitionCount}',
                style: AimTextStyles.bodySm
                    .copyWith(color: surfaces.textSecondary),
              ),
              Text(
                'Scheduled: ${model.scheduledAt}',
                style: AimTextStyles.bodySm
                    .copyWith(color: surfaces.textSecondary),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
