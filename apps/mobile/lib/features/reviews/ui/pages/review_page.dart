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
import 'package:aim_mobile/core/localization/inline_tr.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
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
/// - Back arrow icon direction-aware: arrow_forward for RTL, arrow_back for LTR.
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
    final l10n = Localizations.of<AppLocalizations>(context, AppLocalizations);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // A main screen: the heading sits under the app frame's AIM bar.
            Padding(
              padding: const EdgeInsetsDirectional.fromSTEB(20, 16, 20, 8),
              child: PageTitleBar(
                title: l10n?.reviewsTitle ?? 'Review',
                subtitle: l10n?.reviewsSpacedRepetitionDue ??
                    'Spaced-repetition flashcards due today',
              ),
            ),
            Expanded(
              child: switch (state) {
                AppAsyncLoading() => AIMFullScreenLoading(
                    semanticLabel: l10n?.reviewsLoadingSemantic ??
                        'Loading review schedule'),
                AppAsyncFailure(:final message) =>
                  AIMFullScreenError(message: message, onRetry: _load),
                AppAsyncSuccess(:final data) => data.reviewSchedules.isEmpty
                    ? AIMEmptyState(
                        icon: const Icon(Icons.replay_outlined),
                        title: l10n?.reviewsNoScheduleTitle ??
                            'No reviews scheduled',
                        subtitle: l10n?.reviewsNoScheduleSubtitle ??
                            'Complete practice sessions to receive review reminders.',
                      )
                    : _ReviewContent(
                        schedules: data.reviewSchedules,
                        recommendations: data.recommendations,
                        onRefresh: _refresh,
                      ),
                AppAsyncIdle() => AIMFullScreenLoading(
                    semanticLabel: l10n?.reviewsLoadingSemantic ??
                        'Loading review schedule'),
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
    required this.recommendations,
    required this.onRefresh,
  });

  final List<AimReviewScheduleModel> schedules;
  final List<AimRecommendationModel> recommendations;
  final Future<void> Function() onRefresh;

  /// Starts a real review: practice the lesson the backend recommends for the
  /// first skill that is due; if none has one, retry the student's mistakes.
  void _start(BuildContext context) {
    final dueSkills = schedules
        .where((s) => s.status == 'due')
        .map((s) => s.skillId)
        .toList();
    final ranked = [...recommendations]
      ..sort((a, b) => a.rank.compareTo(b.rank));
    for (final skill in dueSkills) {
      for (final r in ranked) {
        if (r.targetSkillId == skill && r.targetLessonId != null) {
          context.push(AppRoutePaths.practiceSession, extra: {
            'lessonId': r.targetLessonId,
            'lessonTitle': _prettifySkillId(skill),
          });
          return;
        }
      }
    }
    context.push('${AppRoutePaths.mistakes}?quick=1');
  }

  @override
  Widget build(BuildContext context) {
    // Status comes from the backend, which derives it from the due date on
    // every read, so these counts are always current.
    final dueNowCount = schedules.where((s) => s.status == 'due').length;
    final upcomingCount = schedules.where((s) => s.status == 'pending').length;
    final skillCount = schedules.map((s) => s.skillId).toSet().length;
    final l10n = Localizations.of<AppLocalizations>(context, AppLocalizations);

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
                        label: l10n?.reviewsStatDueNow ?? 'Due now',
                        color: AimColors.error500,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildStatCard(
                        context: context,
                        val: '$upcomingCount',
                        label: context.tr('Upcoming', 'قادمة'),
                        color: AimColors.primary500,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildStatCard(
                        context: context,
                        val: '$skillCount',
                        label: context.tr('Skills', 'مهارات'),
                        color: AimColors.warning500,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                Builder(
                  builder: (context) {
                    final surfaces = aimSurfacesOf(context);
                    return Text(
                      l10n?.reviewsScheduleHeader ?? 'REVIEW SCHEDULE',
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
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Container(
              width: double.infinity,
              height: 52,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AimColors.primary500, AimColors.primary400, AimColors.primary600],
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AimColors.primary500.withValues(alpha: 0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => _start(context),
                  borderRadius: BorderRadius.circular(16),
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.style_rounded, color: Colors.white, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          l10n?.reviewsStartSession ?? 'Start Review Session',
                          style: const TextStyle(
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

/// Formats a real, backend-supplied `dueAt` ISO timestamp into a localized
/// relative label (e.g. "مستحقة اليوم", "Due Today", "Due in 3 days").
/// Falls further out to a plain formatted date. Uses l10n keys for proper
/// Arabic/English output.
String _dueDateLabel(String dueAtIso, AppLocalizations? l10n) {
  final dueAt = DateTime.tryParse(dueAtIso);
  if (dueAt == null) return l10n?.reviewsDueDate(dueAtIso) ?? 'Due: $dueAtIso';

  final now = DateTime.now().toUtc();
  final due = dueAt.toUtc();
  final startOfToday = DateTime.utc(now.year, now.month, now.day);
  final startOfDue = DateTime.utc(due.year, due.month, due.day);
  final dayDiff = startOfDue.difference(startOfToday).inDays;

  if (dayDiff == 0) return l10n?.reviewsDueToday ?? 'Due Today';
  if (dayDiff == 1) return l10n?.reviewsDueTomorrow ?? 'Due Tomorrow';
  if (dayDiff == -1) return l10n?.reviewsDueYesterday ?? 'Due Yesterday';
  if (dayDiff > 1 && dayDiff < 7) {
    return l10n?.reviewsDueInDays(dayDiff) ?? 'Due in $dayDiff days';
  }
  if (dayDiff < -1 && dayDiff > -7) {
    return l10n?.reviewsDueDaysAgo(-dayDiff) ?? 'Due ${-dayDiff} days ago';
  }

  return l10n?.reviewsDueDate(_formatDate(due)) ?? 'Due ${_formatDate(due)}';
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

  String _statusLabel(AppLocalizations? l10n) => switch (model.status) {
        'due' => l10n?.reviewsStatusDue ?? 'Due',
        'pending' => l10n?.reviewsStatusPending ?? 'Pending',
        _ => model.status,
      };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final title = _prettifySkillId(model.skillId);
    final l10n = Localizations.of<AppLocalizations>(context, AppLocalizations);

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
              const SizedBox(width: AimSpacing.space8),
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
                  _dueDateLabel(model.dueAt, l10n),
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
                child: Text(l10n?.reviewsIntervalDays(
                        formatAimIntervalDays(model.intervalDays)) ??
                    'Interval ${formatAimIntervalDays(model.intervalDays)}d'),
              ),
              AIMBadge(
                tone: AIMBadgeTone.neutral,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(l10n?.reviewsRepetitionNumber(
                        model.repetitionCount) ??
                    'rep #${model.repetitionCount}'),
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
