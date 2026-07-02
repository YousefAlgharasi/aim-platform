// Phase 6 — P6-102
// ReviewSchedulePage — dedicated read-only view for backend-approved AIM
// review schedules.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Review
//   Schedule"
//   docs/design/ui-for-all-system-mobile/screenshots/light/15-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/15-screen.png
// Endpoint: GET /aim/students/:id/review-schedules
// Widgets: AIMGradientHeroHeader, AIMCard, AIMBadge, AIMFullScreenLoading,
//   AIMFullScreenError, AIMEmptyState
//
// All review schedule data (dueAt, intervalDays, repetitionCount, status) is
// AIM Engine output persisted by the backend. Flutter displays verbatim;
// never modifies, reschedules, or recalculates intervals locally. The
// "Due today / Due in Nd / Due Nd ago" label is a pure date-formatting
// presentation of the backend-supplied dueAt — it derives no new business
// data.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes or mutates review schedules.
// - All values come from backend via aimResultsProvider.
// - studentId sourced from authContextProvider (JWT-resolved).
// - Bearer token from authFlowProvider; never stored locally.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
//
// RTL/Arabic rules:
// - EdgeInsetsDirectional/AlignmentDirectional — RTL-safe throughout.
// - CrossAxisAlignment.start in Column — direction-aware.
// - AIMGradientHeroHeader mirrors its leading/trailing slots via
//   Directionality.
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
      body: Column(
        children: [
          AIMGradientHeroHeader(
            title: 'Review Schedule',
            // IconButton resolves its own foreground colour from the
            // Material 3 colour scheme rather than the ambient IconTheme,
            // so it would otherwise ignore the header's white
            // IconTheme.merge — force it explicitly here.
            leading: IconButtonTheme(
              data: IconButtonThemeData(
                style:
                    IconButton.styleFrom(foregroundColor: AimColors.neutral0),
              ),
              child: IconButton(
                icon: Icon(
                  Directionality.of(context) == TextDirection.rtl
                      ? Icons.arrow_forward
                      : Icons.arrow_back,
                ),
                tooltip: MaterialLocalizations.of(context).backButtonTooltip,
                onPressed: () => Navigator.of(context).maybePop(),
              ),
            ),
          ),
          Expanded(
            child: switch (state) {
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
          ),
        ],
      ),
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
        itemBuilder: (_, i) => _ReviewScheduleRow(model: schedules[i]),
      ),
    );
  }
}

class _ReviewScheduleRow extends StatelessWidget {
  const _ReviewScheduleRow({required this.model});
  final AimReviewScheduleModel model;

  ({AIMBadgeTone tone, String label}) get _status => switch (model.status) {
        'due' => (tone: AIMBadgeTone.primary, label: 'Due'),
        'pending' => (tone: AIMBadgeTone.neutral, label: 'Pending'),
        'completed' => (tone: AIMBadgeTone.success, label: 'Completed'),
        'skipped' => (tone: AIMBadgeTone.warning, label: 'Skipped'),
        'overdue' => (tone: AIMBadgeTone.error, label: 'Overdue'),
        final other => (
            tone: AIMBadgeTone.neutral,
            label: other.isEmpty ? '—' : other[0].toUpperCase() + other.substring(1),
          ),
      };

  /// Pure date-formatting of the backend-supplied [AimReviewScheduleModel.dueAt].
  /// Derives no new business data — Flutter never computes review timing.
  String _dueLabel() {
    final dueAt = DateTime.tryParse(model.dueAt);
    if (dueAt == null) return 'Due ${model.dueAt}';

    final now = DateTime.now();
    final due = DateTime(dueAt.year, dueAt.month, dueAt.day);
    final today = DateTime(now.year, now.month, now.day);
    final diffDays = due.difference(today).inDays;

    if (diffDays == 0) return 'Due Today';
    if (diffDays == 1) return 'Due Tomorrow';
    if (diffDays > 1) return 'Due in $diffDays days';
    if (diffDays == -1) return 'Due 1 day ago';
    if (diffDays > -7) return 'Due ${-diffDays} days ago';

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return 'Due ${months[dueAt.month - 1]} ${dueAt.day}';
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final status = _status;

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel:
          '${model.skillId} review due ${model.dueAt} — ${status.label}',
      padding: const EdgeInsets.all(AimSpacing.componentGap),
      child: Row(
        children: [
          Container(
            width: AimSizes.avatarMd,
            height: AimSizes.avatarMd,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: soft.primary,
              borderRadius: AimRadius.borderMd,
            ),
            child: Icon(
              Icons.calendar_today_outlined,
              size: AimSizes.iconSm,
              color: soft.onPrimary,
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  model.skillId,
                  style: AimTextStyles.bodyMd.copyWith(
                    color: surfaces.textPrimary,
                    fontWeight: AimFontWeights.semibold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AimSpacing.space2),
                Text(
                  '${_dueLabel()} · ${model.intervalDays}d · rep #${model.repetitionCount}',
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          AIMBadge(
            tone: status.tone,
            variant: AIMBadgeVariant.solid,
            pill: true,
            child: Text(status.label),
          ),
        ],
      ),
    );
  }
}
