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
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart' hide TextDirection;

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

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
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      body: Column(
        children: [
          AIMGradientHeroHeader(
            title: l10n.homeReviewScheduleTitle,
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
                      ? Icons.chevron_right_rounded
                      : Icons.chevron_left_rounded,
                ),
                tooltip: MaterialLocalizations.of(context).backButtonTooltip,
                onPressed: () {
                  if (context.canPop()) context.pop();
                },
              ),
            ),
          ),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() => AIMFullScreenLoading(
                  semanticLabel: l10n.reviewsLoadingScheduleSemantic),
              AppAsyncFailure(:final message) =>
                AIMFullScreenError(message: message, onRetry: _load),
              AppAsyncSuccess(:final data) => data.reviewSchedules.isEmpty
                  ? AIMEmptyState(
                      icon: const Icon(Icons.schedule_outlined),
                      title: l10n.reviewsNoReviewsScheduledTitle,
                      subtitle: l10n.progressNoReviewsSubtitle,
                    )
                  : _ReviewScheduleList(
                      schedules: data.reviewSchedules,
                      onRefresh: _refresh,
                    ),
              AppAsyncIdle() => AIMFullScreenLoading(
                  semanticLabel: l10n.reviewsLoadingScheduleSemantic),
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

  ({AIMBadgeTone tone, String label}) _status(AppLocalizations l10n) =>
      switch (model.status) {
        'due' => (tone: AIMBadgeTone.primary, label: l10n.progressReviewStatusDue),
        'pending' => (
            tone: AIMBadgeTone.neutral,
            label: l10n.progressReviewStatusPending,
          ),
        'completed' => (
            tone: AIMBadgeTone.success,
            label: l10n.progressReviewStatusCompleted,
          ),
        'skipped' => (
            tone: AIMBadgeTone.warning,
            label: l10n.progressReviewStatusSkipped,
          ),
        'overdue' => (
            tone: AIMBadgeTone.error,
            label: l10n.progressReviewStatusOverdue,
          ),
        final other => (
            tone: AIMBadgeTone.neutral,
            label: other.isEmpty ? '—' : other[0].toUpperCase() + other.substring(1),
          ),
      };

  /// Pure date-formatting of the backend-supplied [AimReviewScheduleModel.dueAt].
  /// Derives no new business data — Flutter never computes review timing.
  String _dueLabel(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final dueAt = DateTime.tryParse(model.dueAt);
    if (dueAt == null) return l10n.progressDueRawLabel(model.dueAt);

    final now = DateTime.now();
    final due = DateTime(dueAt.year, dueAt.month, dueAt.day);
    final today = DateTime(now.year, now.month, now.day);
    final diffDays = due.difference(today).inDays;

    if (diffDays == 0) return l10n.reviewsDueTodayLabel;
    if (diffDays == 1) return l10n.reviewsDueTomorrowLabel;
    if (diffDays > 1) return l10n.reviewsDueInDaysLabel(diffDays);
    if (diffDays == -1) return l10n.reviewsDueDaysAgoLabel(1);
    if (diffDays > -7) return l10n.reviewsDueDaysAgoLabel(-diffDays);

    final locale = Localizations.localeOf(context).toString();
    return l10n.reviewsDueFormattedLabel(DateFormat.MMMd(locale).format(dueAt));
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final soft = aimSoftFillsOf(context);
    final l10n = AppLocalizations.of(context);
    final status = _status(l10n);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: l10n.progressReviewCardSemantic(
        model.skillId,
        model.dueAt,
        status.label,
      ),
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
                  l10n.progressReviewMetaLabel(
                    _dueLabel(context),
                    model.intervalDays,
                    model.repetitionCount,
                  ),
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
