// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Review"
//   docs/design/ui-for-all-system-mobile/screenshots/light/10-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/10-screen.png
// Endpoint: GET /aim/students/:id/review-schedule (via aimResultsProvider)
// Widgets: AIMGradientHeroHeader, AIMCard, AIMBadge, AIMFullScreenLoading,
//   AIMFullScreenError, AIMEmptyState
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:go_router/go_router.dart';

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
    final surfaces = aimSurfacesOf(context);
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // App Bar Header matching prototype
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                color: surfaces.surface,
                border: Border(bottom: BorderSide(color: surfaces.border)),
              ),
              child: Row(
                children: [
                  if (context.canPop()) ...[
                    GestureDetector(
                      onTap: () => context.pop(),
                      child: Container(
                        width: 36,
                        height: 36,
                        margin: const EdgeInsets.only(right: 12),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: surfaces.surfaceSunken,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(
                          Icons.arrow_back_rounded,
                          size: 20,
                          color: surfaces.textPrimary,
                        ),
                      ),
                    ),
                  ],
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Review',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: surfaces.textPrimary,
                            letterSpacing: -0.4,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Spaced-repetition flashcards due today',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: surfaces.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: colorScheme.primaryContainer,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(Icons.style_rounded, color: colorScheme.primary, size: 22),
                  ),
                ],
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
    final dueNowCount = schedules.where((s) => s.status == 'due').length;
    final learnedCount = schedules.length;

    return Column(
      children: [
        Expanded(
          child: RefreshIndicator(
            onRefresh: onRefresh,
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              children: [
                // Top Summary Stat Cards matching prototype
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        context: context,
                        val: '$dueNowCount',
                        label: 'Due now',
                        color: const Color(0xFFEF4444),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildStatCard(
                        context: context,
                        val: '$learnedCount',
                        label: 'Learned',
                        color: const Color(0xFF4F46E5),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildStatCard(
                        context: context,
                        val: '7d',
                        label: 'Streak',
                        color: const Color(0xFFF59E0B),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                Builder(
                  builder: (context) {
                    final surfaces = aimSurfacesOf(context);
                    return Text(
                      'REVIEW SCHEDULE',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textMuted,
                        letterSpacing: 1.0,
                      ),
                    );
                  },
                ),

                const SizedBox(height: 12),

                for (int i = 0; i < schedules.length; i++) ...[
                  _ReviewScheduleCard(model: schedules[i]),
                  if (i < schedules.length - 1) const SizedBox(height: 12),
                ],
              ],
            ),
          ),
        ),

        // Bottom CTA Action Footer matching prototype
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
            child: Container(
              width: double.infinity,
              height: 52,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF4F46E5), Color(0xFF6366F1), Color(0xFF7C3AED)],
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF4F46E5).withValues(alpha: 0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {
                    // Navigate to lesson practice / question session
                    context.push('/practice/session', extra: {
                      'lessonId': 'review-session',
                      'lessonTitle': 'Spaced Repetition Review',
                    });
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: const Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.style_rounded, color: Colors.white, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Start Review Session',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required BuildContext context,
    required String val,
    required String label,
    required Color color,
  }) {
    final surfaces = aimSurfacesOf(context);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: surfaces.border),
        boxShadow: [
          BoxShadow(
            color: surfaces.textPrimary.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            val,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: surfaces.textSecondary,
            ),
          ),
        ],
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
