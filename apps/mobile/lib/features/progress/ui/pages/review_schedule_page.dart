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

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/entity/aim_review_schedule.dart'
    show formatAimIntervalDays;
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

    final l10n = AppLocalizations.of(context);

    return Scaffold(
      body: Column(
        children: [
          AIMGradientHeroHeader(
            title: l10n.reviewScheduleTitle,
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
                  semanticLabel: l10n.reviewScheduleLoadingSemantic),
              AppAsyncFailure(:final message) =>
                AIMFullScreenError(message: message, onRetry: _load),
              AppAsyncSuccess(:final data) => data.reviewSchedules.isEmpty
                  ? AIMEmptyState(
                      icon: const Icon(Icons.schedule_outlined),
                      title: l10n.reviewScheduleNoTitle,
                      subtitle: l10n.reviewScheduleNoSubtitle,
                    )
                  : _ReviewScheduleList(
                      schedules: data.reviewSchedules,
                      onRefresh: _refresh,
                    ),
              AppAsyncIdle() => AIMFullScreenLoading(
                  semanticLabel: l10n.reviewScheduleLoadingSemantic),
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

  ({AIMBadgeTone tone, String label}) _status(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return switch (model.status) {
      'due' => (tone: AIMBadgeTone.primary, label: l10n.reviewsStatusDue),
      'pending' =>
        (tone: AIMBadgeTone.neutral, label: l10n.reviewsStatusPending),
      'completed' =>
        (tone: AIMBadgeTone.success, label: l10n.assessmentsStatusCompleted),
      'skipped' =>
        (tone: AIMBadgeTone.warning, label: l10n.progressStatusSkipped),
      'overdue' =>
        (tone: AIMBadgeTone.error, label: l10n.progressStatusOverdue),
      final other => (
          tone: AIMBadgeTone.neutral,
          label: other.isEmpty
              ? '—'
              : other[0].toUpperCase() + other.substring(1),
        ),
    };
  }

  /// Pure date-formatting of the backend-supplied [AimReviewScheduleModel.dueAt].
  /// Derives no new business data — Flutter never computes review timing.
  String _dueLabel(BuildContext context) {
    final dueAt = DateTime.tryParse(model.dueAt);
    final l10n = AppLocalizations.of(context);
    if (dueAt == null) return l10n.reviewsDueDate(model.dueAt);

    final now = DateTime.now();
    final due = DateTime(dueAt.year, dueAt.month, dueAt.day);
    final today = DateTime(now.year, now.month, now.day);
    final diffDays = due.difference(today).inDays;

    if (diffDays == 0) return l10n.reviewsDueToday;
    if (diffDays == 1) return l10n.reviewsDueTomorrow;
    if (diffDays > 1) return l10n.reviewsDueInDays(diffDays);
    if (diffDays == -1) return l10n.reviewsDueDaysAgo(1);
    if (diffDays > -7) return l10n.reviewsDueDaysAgo(-diffDays);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    final formattedDate = '${months[dueAt.month - 1]} ${dueAt.day}';
    return l10n.reviewsDueDate(formattedDate);
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final status = _status(context);
    final title = _prettifySkillId(model.skillId);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel:
          '${model.skillId} review due ${model.dueAt} — ${status.label}',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: AimTextStyles.title
                      .copyWith(color: surfaces.textPrimary),
                  textAlign: TextAlign.start,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: AimSpacing.space8),
              AIMBadge(
                tone: status.tone,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(status.label),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.componentGap),
          Row(
            children: [
              const Icon(Icons.calendar_today_outlined,
                  size: AimSizes.iconSm, color: AimColors.primary500),
              const SizedBox(width: AimSpacing.space8),
              Text(
                _dueLabel(context),
                style: AimTextStyles.bodyMd.copyWith(
                  color: surfaces.textPrimary,
                  fontWeight: AimFontWeights.semibold,
                ),
                textAlign: TextAlign.start,
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Text(
            l10n.reviewScheduleEveryInterval(
              formatAimIntervalDays(model.intervalDays),
              model.repetitionCount,
            ),
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            textAlign: TextAlign.start,
          ),
        ],
      ),
    );
  }
}

/// Converts a raw, machine-oriented `skillId` slug into a readable label —
/// same real-data display transform used by SkillStatePage, kept consistent
/// across the two detail views rather than reinvented here.
String _prettifySkillId(String skillId) {
  final lastSegment = skillId.split(':').last;
  final words = lastSegment
      .split(RegExp(r'[_\-]+'))
      .where((w) => w.isNotEmpty)
      .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase());
  final label = words.join(' ');
  return label.isEmpty ? skillId : label;
}
