// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Review"
//   docs/design/ui-for-all-system-mobile/screenshots/light/10-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/10-screen.png
// Endpoint: GET /aim/students/:id/review-schedule (via aimResultsProvider)
// Widgets: AIMGradientHeroHeader, AIMCard, AIMBadge, AIMFullScreenLoading,
//   AIMFullScreenError, AIMEmptyState
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/entity/aim_review_schedule.dart'
    show formatAimIntervalDays;
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

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

    return Scaffold(
      body: Column(
        children: [
          const AIMGradientHeroHeader(
            title: 'Review',
            subtitle: 'Spaced repetition keeps it in memory',
          ),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading review schedule'),
              AppAsyncFailure(:final message) =>
                AIMFullScreenError(message: message, onRetry: _load),
              AppAsyncSuccess(:final data) => data.reviewSchedules.isEmpty
                  ? const AIMEmptyState(
                      icon: Icon(Icons.replay_outlined),
                      title: 'No reviews scheduled',
                      subtitle:
                          'Complete practice sessions to receive review reminders.',
                    )
                  : _ReviewContent(
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
String _dueDateLabel(String dueAtIso) {
  final dueAt = DateTime.tryParse(dueAtIso);
  if (dueAt == null) return 'Due: $dueAtIso';

  final now = DateTime.now().toUtc();
  final due = dueAt.toUtc();
  final startOfToday = DateTime.utc(now.year, now.month, now.day);
  final startOfDue = DateTime.utc(due.year, due.month, due.day);
  final dayDiff = startOfDue.difference(startOfToday).inDays;

  if (dayDiff == 0) return 'Due Today';
  if (dayDiff == 1) return 'Due Tomorrow';
  if (dayDiff == -1) return 'Due Yesterday';
  if (dayDiff > 1 && dayDiff < 7) return 'Due in $dayDiff days';
  if (dayDiff < -1 && dayDiff > -7) return 'Due ${-dayDiff} days ago';

  return 'Due ${_formatDate(due)}';
}

const _months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

String _formatDate(DateTime date) => '${_months[date.month - 1]} ${date.day}';

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

  String get _statusLabel => switch (model.status) {
        'due' => 'Due',
        'pending' => 'Pending',
        _ => model.status,
      };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final title = _prettifySkillId(model.skillId);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: '$title review due ${model.dueAt} — ${model.status}',
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
                child: Text(_statusLabel),
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
                  _dueDateLabel(model.dueAt),
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
                child: Text('Interval ${formatAimIntervalDays(model.intervalDays)}d'),
              ),
              AIMBadge(
                tone: AIMBadgeTone.neutral,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text('rep #${model.repetitionCount}'),
              ),
              AIMBadge(
                tone: AIMBadgeTone.neutral,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(_formatScheduledDate(model.scheduledAt)),
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
  String _formatScheduledDate(String scheduledAtIso) {
    final scheduledAt = DateTime.tryParse(scheduledAtIso);
    if (scheduledAt == null) return scheduledAtIso;
    return _formatDate(scheduledAt.toUtc());
  }
}
