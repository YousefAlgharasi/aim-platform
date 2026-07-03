// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Review"
//   docs/design/ui-for-all-system-mobile/screenshots/light/10-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/10-screen.png
// Endpoint: GET /aim/students/:id/review-schedule (via aimResultsProvider)
// Widgets: AIMGradientHeroHeader, AIMCard, AIMBadge, AIMFullScreenLoading,
//   AIMFullScreenError, AIMEmptyState
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

/// Review — Spaced-repetition schedule tab.
///
/// This is a bottom-nav tab (no back button). It renders the student's
/// backend-computed review schedule via [aimResultsProvider], unchanged
/// data-layer wiring from the original implementation — only the visual
/// treatment and one status-badge display bug are fixed here.
///
/// CRITICAL SECURITY RULES:
/// - Flutter NEVER computes review due dates, intervals, or repetition
///   counts. All values come from the backend verbatim via
///   aimResultsProvider.
/// - studentId sourced from authContextProvider (JWT-resolved).
/// - Bearer token from authFlowProvider; never stored here.
/// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
///
/// RTL/Arabic rules:
/// - EdgeInsetsDirectional / EdgeInsets.symmetric only — RTL-safe.
/// - CrossAxisAlignment.start in Column — direction-aware.
/// - AIMGradientHeroHeader handles RTL internally (no back button used here).
class ReviewPage extends ConsumerStatefulWidget {
  const ReviewPage({super.key});

  @override
  ConsumerState<ReviewPage> createState() => _ReviewPageState();
}

class _ReviewPageState extends ConsumerState<ReviewPage> {
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
            title: l10n.reviewsPageTitle,
            subtitle: l10n.reviewsPageSubtitle,
          ),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() => AIMFullScreenLoading(
                  semanticLabel: l10n.reviewsLoadingScheduleSemantic),
              AppAsyncFailure(:final message) =>
                AIMFullScreenError(message: message, onRetry: _load),
              AppAsyncSuccess(:final data) => data.reviewSchedules.isEmpty
                  ? AIMEmptyState(
                      icon: const Icon(Icons.replay_outlined),
                      title: l10n.reviewsNoReviewsScheduledTitle,
                      subtitle: l10n.reviewsNoReviewsSubtitle,
                    )
                  : _ReviewContent(
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

class _ReviewContent extends StatelessWidget {
  const _ReviewContent({
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
        itemBuilder: (_, i) => _ReviewScheduleCard(model: schedules[i]),
      ),
    );
  }
}

/// Converts a raw, machine-oriented `skillId` slug (e.g.
/// `"skill:arabic:p1:vocab"` or `"past_simple"`) into a readable label by
/// taking the last colon-delimited segment, replacing underscores/hyphens
/// with spaces, and title-casing each word.
///
/// Identical logic to `_prettifySkillId` in
/// `features/progress/ui/pages/skill_state_page.dart` — duplicated here as a
/// local private function rather than imported, since that helper is private
/// to its own file.
String _prettifySkillId(String skillId) {
  final lastSegment = skillId.split(':').last;
  final words = lastSegment
      .split(RegExp(r'[_\-]+'))
      .where((w) => w.isNotEmpty)
      .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase());
  final label = words.join(' ');
  return label.isEmpty ? skillId : label;
}

/// Formats a real, backend-supplied `dueAt` ISO timestamp into a short
/// relative label (e.g. "Due Today", "Due 2 days ago", "Due in 3 days").
/// Falls further out to a plain formatted date. Adapted from the relative
/// time style established by `_relativeTimeLabel` in
/// `features/home/ui/pages/home_page.dart`, extended to handle near-future
/// dates since review due-dates are frequently in the future, not just the
/// past.
String _dueDateLabel(BuildContext context, String dueAtIso) {
  final l10n = AppLocalizations.of(context);
  final dueAt = DateTime.tryParse(dueAtIso);
  if (dueAt == null) return l10n.reviewsDueRawLabel(dueAtIso);

  final now = DateTime.now().toUtc();
  final due = dueAt.toUtc();
  final startOfToday = DateTime.utc(now.year, now.month, now.day);
  final startOfDue = DateTime.utc(due.year, due.month, due.day);
  final dayDiff = startOfDue.difference(startOfToday).inDays;

  if (dayDiff == 0) return l10n.reviewsDueTodayLabel;
  if (dayDiff == 1) return l10n.reviewsDueTomorrowLabel;
  if (dayDiff == -1) return l10n.reviewsDueYesterdayLabel;
  if (dayDiff > 1 && dayDiff < 7) return l10n.reviewsDueInDaysLabel(dayDiff);
  if (dayDiff < -1 && dayDiff > -7) {
    return l10n.reviewsDueDaysAgoLabel(-dayDiff);
  }

  return l10n.reviewsDueFormattedLabel(_formatDate(context, due));
}

String _formatDate(BuildContext context, DateTime date) {
  final locale = Localizations.localeOf(context).toString();
  return DateFormat.MMMd(locale).format(date);
}

class _ReviewScheduleCard extends StatelessWidget {
  const _ReviewScheduleCard({required this.model});
  final AimReviewScheduleModel model;

  /// Real statuses only — the backend's `computeStatus` can only ever return
  /// `'pending'` or `'due'` (confirmed via
  /// review-schedule-output.service.ts and its spec). `'due'` is the most
  /// urgent/common real state, so it gets a prominent tone; `'pending'` gets
  /// a calmer one. The `_` fallback is kept only as a defensive guard against
  /// an unexpected value — it is not designed around any fictional status.
  AIMBadgeTone get _statusTone => switch (model.status) {
        'due' => AIMBadgeTone.primary,
        'pending' => AIMBadgeTone.neutral,
        _ => AIMBadgeTone.neutral,
      };

  String _statusLabel(AppLocalizations l10n) => switch (model.status) {
        'due' => l10n.progressReviewStatusDue,
        'pending' => l10n.progressReviewStatusPending,
        _ => model.status,
      };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final title = _prettifySkillId(model.skillId);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel:
          l10n.reviewsCardSemantic(title, model.dueAt, model.status),
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
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              AIMBadge(
                tone: _statusTone,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(_statusLabel(l10n)),
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
              Expanded(
                child: Text(
                  _dueDateLabel(context, model.dueAt),
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textPrimary),
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Wrap(
            spacing: AimSpacing.space8,
            runSpacing: AimSpacing.space8,
            children: [
              AIMBadge(
                tone: AIMBadgeTone.neutral,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(l10n.reviewsIntervalDaysLabel(model.intervalDays)),
              ),
              AIMBadge(
                tone: AIMBadgeTone.neutral,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(l10n.reviewsRepBadge(model.repetitionCount)),
              ),
              AIMBadge(
                tone: AIMBadgeTone.neutral,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(_formatScheduledDate(context, model.scheduledAt)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Formats the real `scheduledAt` timestamp for the small pill badge.
  /// Falls back to the raw string if it isn't a parseable ISO date, so we
  /// never hide real data on a parse failure.
  String _formatScheduledDate(BuildContext context, String scheduledAtIso) {
    final scheduledAt = DateTime.tryParse(scheduledAtIso);
    if (scheduledAt == null) return scheduledAtIso;
    return _formatDate(context, scheduledAt.toUtc());
  }
}
