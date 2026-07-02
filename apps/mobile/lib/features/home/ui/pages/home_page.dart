// Phase 6 — P6-062
// HomePage — Student home screen MVP.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Home"
//   docs/design/ui-for-all-system-mobile/screenshots/light/05-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/05-screen.png
// Widgets: AIMCard, AIMBadge, AIMProgressBar, AIMCircularProgress,
//   AIMGradientButton, AIMNotificationsSheet, home_widgets.dart cards
//
// Renders backend-sourced data sections via [homeProvider]:
//   greeting header (auth context + engagement streak), continue-learning
//   hero, daily challenges, quick start, recommended course, and the four
//   AIM lists (skill states, weaknesses, review schedule, recommendations).
//
// Flutter never calculates or infers any AIM value. All values come from the
// backend verbatim through HomeNotifier → HomeRepository → backend API.
//
// Level / XP / badges / rank hero card — 100% REAL, via
// GET /student/engagement/stats (features/engagement on the backend):
// level, XP-to-next-level, and levelProgressPercent are computed from an
// xp_levels threshold table against the student's real lifetime XP (sum of
// xp_value across completed lesson_progress rows); badgeCount is the real
// count of unlocked student_achievements; rankPercentile is a real
// PERCENT_RANK() of the student's total XP among all students. None of it
// is computed in Flutter. The streak pill in the header is also REAL
// (goal.streakDays), as are the continue-learning percent and challenge
// progress.
//
// Security rules:
// - studentId sourced from authContextProvider (JWT-resolved).
// - Bearer token from authFlowProvider. Never stored in this widget.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
// - No secrets in this file.
//
// RTL/Arabic rules:
// - Uses Directionality-aware widgets only (Row, Column, CrossAxisAlignment).
// - Text widgets respect ambient directionality; no explicit LTR overrides.
// - Padding uses symmetric EdgeInsets / EdgeInsetsDirectional so it mirrors
//   correctly under RTL.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/home/logic/entity/home_data.dart';
import 'package:aim_mobile/features/home/logic/provider/home_provider.dart';
import 'package:aim_mobile/features/notifications/data/models/notification_event_model.dart';
import 'package:aim_mobile/features/notifications/logic/provider/notification_providers.dart';
import 'package:aim_mobile/features/shell/logic/main_shell_tab_provider.dart';
import 'package:aim_mobile/features/home/logic/entity/home_continue_learning.dart';
import 'package:aim_mobile/features/home/logic/entity/home_engagement.dart';
import 'package:aim_mobile/features/home/logic/entity/home_quick_start_lesson.dart';
import 'package:aim_mobile/features/home/logic/entity/home_recommended_course.dart';
import '../widgets/home_widgets.dart';

/// Student home screen MVP.
///
/// Auto-loads home data on first build by reading studentId from
/// [authContextProvider] (JWT-resolved by backend) and the bearer token from
/// [authFlowProvider].
class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  @override
  void initState() {
    super.initState();
    // Kick off the load after the first frame so providers are settled.
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final authContext = ref.read(authContextProvider);
    final authFlow = ref.read(authFlowProvider);

    // Only load when auth context has resolved and a token is available.
    final contextData = switch (authContext) {
      AppAsyncSuccess(:final data) => data,
      _ => null,
    };
    if (contextData == null) return;
    final token = authFlow.accessToken;
    if (token == null || token.isEmpty) return;

    ref.read(homeProvider.notifier).load(
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

    await ref.read(homeProvider.notifier).refresh(
          bearerToken: token,
          studentId: contextData.user.id,
        );
  }

  /// Ensures the inbox has been loaded (or is loading) before/while the
  /// notifications sheet is shown, then presents the sheet so it can react
  /// to the provider's state as it resolves.
  void _openNotifications(BuildContext context, WidgetRef ref) {
    final state = ref.read(notificationInboxProvider);
    if (state is! AppAsyncSuccess && state is! AppAsyncLoading) {
      final token = ref.read(authFlowProvider).accessToken;
      if (token != null && token.isNotEmpty) {
        ref.read(notificationInboxProvider.notifier).load(bearerToken: token);
      }
    }

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) => Consumer(
        builder: (context, ref, _) {
          final inboxState = ref.watch(notificationInboxProvider);

          return switch (inboxState) {
            AppAsyncSuccess(:final data) => AIMNotificationsSheet(
                notifications: data
                    .where((event) => event.dismissedAt == null)
                    .map((event) => _toNotificationItemData(event))
                    .toList(),
                headerIcon: const _NotificationBellAvatar(),
                subtitle: _unreadSubtitle(data),
                onTapItem: (item) {
                  Navigator.of(sheetContext).pop();
                  final event = data.firstWhere((e) => e.id == item.id);
                  Navigator.of(context).pushNamed(
                    AppRoutePaths.notificationDetail,
                    arguments: event,
                  );
                },
                // onDismissItem intentionally left unset: mirroring
                // NotificationInboxPage's real dismiss flow here would need
                // this sheet to also own bearer-token lookups + notifier
                // wiring for a call site that's meant to be a lightweight
                // preview; the full dismiss flow already exists on the
                // dedicated inbox page, so it's safer to omit it here than
                // risk a half-correct reimplementation.
                // onMarkAllRead intentionally left unset: no bulk
                // mark-all-as-read method exists on NotificationRepository
                // or NotificationInboxNotifier today (only per-item
                // markAsRead) — omitted rather than inventing an endpoint.
              ),
            AppAsyncFailure(:final message) => AIMNotificationsSheet(
                notifications: const [],
                emptyMessage: message,
              ),
            _ => const AIMNotificationsSheet(
                notifications: [],
                loading: true,
              ),
          };
        },
      ),
    );
  }

  /// Real subtitle computed from the same backend-returned list shown in
  /// the sheet — counts unread, non-dismissed events, not a fabricated
  /// figure.
  String _unreadSubtitle(List<NotificationEventModel> events) {
    final unread = events.where((e) => e.isUnread).length;
    if (unread == 0) return 'No new notifications';
    return unread == 1 ? '1 new notification' : '$unread new notifications';
  }

  AIMNotificationItemData _toNotificationItemData(NotificationEventModel event) {
    return AIMNotificationItemData(
      id: event.id,
      title: event.title ?? '',
      body: event.body,
      timeLabel: _relativeTimeLabel(event.createdAt),
      read: !event.isUnread,
    );
  }

  /// Computes a real relative-time label (e.g. "1h ago", "Yesterday") from
  /// the backend-supplied `createdAt` ISO timestamp. No time-formatting
  /// utility already existed elsewhere in this codebase (searched), so this
  /// is a small real computation from real data, not a fabricated value.
  String _relativeTimeLabel(String createdAtIso) {
    final createdAt = DateTime.tryParse(createdAtIso);
    if (createdAt == null) return '';

    final diff = DateTime.now().toUtc().difference(createdAt.toUtc());
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays == 1) return 'Yesterday';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${diff.inDays ~/ 7}w ago';
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(homeProvider);

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: switch (state) {
          AppAsyncLoading() => const AIMFullScreenLoading(
              semanticLabel: 'Loading home data',
            ),
          AppAsyncFailure(:final message) => AIMFullScreenError(
              message: message,
              onRetry: _load,
            ),
          AppAsyncSuccess(:final data) => _HomeContent(
              data: data,
              onRefresh: _refresh,
              onOpenNotifications: () => _openNotifications(context, ref),
            ),
          AppAsyncIdle() => const AIMFullScreenLoading(
              semanticLabel: 'Loading home data',
            ),
        },
      ),
    );
  }
}

/// Small colored bell-icon avatar shown beside the sheet's title, matching
/// the mockup's notification-sheet header treatment. Purely decorative —
/// carries no data of its own.
class _NotificationBellAvatar extends StatelessWidget {
  const _NotificationBellAvatar();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: AimSizes.avatarMd,
      height: AimSizes.avatarMd,
      alignment: Alignment.center,
      decoration: const BoxDecoration(
        color: AimColors.error500,
        shape: BoxShape.circle,
      ),
      child: const Icon(
        Icons.notifications_rounded,
        color: AimColors.neutral0,
        size: AimSizes.iconMd,
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Main content — only rendered on success state.
// ---------------------------------------------------------------------------

class _HomeContent extends ConsumerWidget {
  const _HomeContent({
    required this.data,
    required this.onRefresh,
    required this.onOpenNotifications,
  });

  final HomeData data;
  final Future<void> Function() onRefresh;
  final VoidCallback onOpenNotifications;

  void _navigateToLesson(BuildContext context, HomeQuickStartLesson lesson) {
    Navigator.of(context).pushNamed(
      AppRoutePaths.lessonDetail,
      arguments: {'lessonId': lesson.lessonId},
    );
  }

  void _navigateToCourse(BuildContext context, HomeRecommendedCourse course) {
    Navigator.of(context).pushNamed(
      AppRoutePaths.courseChapters,
      arguments: {'courseId': course.courseId},
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.componentGap,
        ),
        children: [
          _HomeGreetingHeader(
            streakDays: data.goal?.streakDays ?? 0,
            onOpenNotifications: onOpenNotifications,
          ),
          if (data.engagementStats != null) ...[
            const SizedBox(height: AimSpacing.componentGap),
            _HomeLevelHeroCard(stats: data.engagementStats!),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.continueLearning != null) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Continue learning',
                  style: AimTextStyles.h3
                      .copyWith(color: surfaces.textPrimary),
                ),
                _LinkButton(
                  label: 'Library',
                  onTap: () =>
                      ref.read(mainShellTabIndexProvider.notifier).state = 1,
                ),
              ],
            ),
            const SizedBox(height: AimSpacing.componentGap),
            _ContinueLearningHeroCard(lesson: data.continueLearning!),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.dailyChallenge != null) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.local_fire_department_rounded,
                      size: AimSizes.iconMd,
                      color: AimColors.warning500,
                    ),
                    const SizedBox(width: AimSpacing.space8),
                    Text(
                      'Daily challenges',
                      style: AimTextStyles.h3
                          .copyWith(color: surfaces.textPrimary),
                    ),
                  ],
                ),
                Text(
                  data.dailyChallenge!.completed ? '1 / 1 done' : '0 / 1 done',
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textMuted),
                ),
              ],
            ),
            const SizedBox(height: AimSpacing.componentGap),
            _DailyChallengeRow(
              challenge: data.dailyChallenge!,
              onStart: () =>
                  ref.read(mainShellTabIndexProvider.notifier).state = 1,
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.quickStartLesson != null) ...[
            const HomeSectionHeader(title: 'Quick Start'),
            const SizedBox(height: AimSpacing.componentGap),
            HomeQuickStartLessonCard(
              lesson: data.quickStartLesson!,
              onTap: () => _navigateToLesson(context, data.quickStartLesson!),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.recommendedCourse != null) ...[
            const HomeSectionHeader(title: 'Recommended Course'),
            const SizedBox(height: AimSpacing.componentGap),
            HomeRecommendedCourseCard(
              course: data.recommendedCourse!,
              onTap: () => _navigateToCourse(context, data.recommendedCourse!),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.goal != null) ...[
            const HomeSectionHeader(title: 'Goal'),
            const SizedBox(height: AimSpacing.componentGap),
            HomeGoalCard(goal: data.goal!),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.isEmpty) ..._gettingStartedCards(context, ref),
          if (data.skillStates.isNotEmpty) ...[
            const HomeSectionHeader(title: 'Skill States'),
            const SizedBox(height: AimSpacing.componentGap),
            ...data.skillStates.map(
              (m) => Padding(
                padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
                child: HomeSkillStateCard(model: m),
              ),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.weaknessRecords.isNotEmpty) ...[
            const HomeSectionHeader(title: 'Focus Areas'),
            const SizedBox(height: AimSpacing.componentGap),
            Wrap(
              spacing: AimSpacing.space8,
              runSpacing: AimSpacing.space8,
              children: data.weaknessRecords
                  .map((m) => HomeWeaknessChip(model: m))
                  .toList(),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.reviewSchedules.isNotEmpty) ...[
            const HomeSectionHeader(title: 'Review Schedule'),
            const SizedBox(height: AimSpacing.componentGap),
            ...data.reviewSchedules.map(
              (m) => Padding(
                padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
                child: HomeReviewScheduleCard(model: m),
              ),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.recommendations.isNotEmpty) ...[
            const HomeSectionHeader(title: 'AIM Recommendations'),
            const SizedBox(height: AimSpacing.componentGap),
            ...data.recommendations.map(
              (m) => Padding(
                padding: const EdgeInsets.only(bottom: AimSpacing.listItemGap),
                child: HomeRecommendationCard(model: m),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Promo cards shown in place of the four core AIM sections when the
/// student has no skill/weakness/schedule/recommendation/continue-learning
/// data yet. Rendered inline within [_HomeContent] so Goal/Daily Challenge
/// above are never hidden behind this state.
List<Widget> _gettingStartedCards(BuildContext context, WidgetRef ref) {
  final surfaces = aimSurfacesOf(context);

  return [
    const HomeSectionHeader(title: 'Get Started'),
    const SizedBox(height: AimSpacing.componentGap),
    AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: () => Navigator.of(context).pushNamed(
        AppRoutePaths.placementStart,
      ),
      child: Row(
        children: [
          const Icon(
            Icons.assignment_outlined,
            color: AimColors.primary600,
            size: AimSizes.iconMd,
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Placement Test',
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  'Find your level and get personalised recommendations.',
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Icon(
            Icons.chevron_right,
            color: surfaces.textMuted,
          ),
        ],
      ),
    ),
    const SizedBox(height: AimSpacing.componentGap),
    AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: () => ref.read(mainShellTabIndexProvider.notifier).state = 1,
      child: Row(
        children: [
          const Icon(
            Icons.menu_book_outlined,
            color: AimColors.primary600,
            size: AimSizes.iconMd,
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Browse Courses',
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  'Explore available courses and start learning.',
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Icon(
            Icons.chevron_right,
            color: surfaces.textMuted,
          ),
        ],
      ),
    ),
    const SizedBox(height: AimSpacing.componentGap),
    AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: () => Navigator.of(context).pushNamed(
        AppRoutePaths.assessments,
      ),
      child: Row(
        children: [
          const Icon(
            Icons.quiz_outlined,
            color: AimColors.primary600,
            size: AimSizes.iconMd,
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Assessments',
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  'View and take available assessments.',
                  style: AimTextStyles.bodySm.copyWith(
                    color: surfaces.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Icon(
            Icons.chevron_right,
            color: surfaces.textMuted,
          ),
        ],
      ),
    ),
  ];
}

// ── Greeting header ─────────────────────────────────────────────────────────

/// Top greeting row: avatar, weekday tagline, "Hey {name} ✦", streak pill
/// (REAL — goal.streakDays), and the notifications bell.
class _HomeGreetingHeader extends ConsumerWidget {
  const _HomeGreetingHeader({
    required this.streakDays,
    required this.onOpenNotifications,
  });

  final int streakDays;
  final VoidCallback onOpenNotifications;

  static const _weekdays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday', 'Sunday',
  ];

  String _initials(String? value) {
    if (value == null || value.isEmpty) return '?';
    final parts = value.trim().split(RegExp(r'[\s@.]+'));
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return value[0].toUpperCase();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final authState = ref.watch(authContextProvider);
    final displayName = switch (authState) {
      AppAsyncSuccess(:final data) =>
        data.profile?.displayName ?? data.user.email ?? '',
      _ => '',
    };
    final firstName = displayName.split(RegExp(r'[\s@]+')).first;
    final weekday = _weekdays[DateTime.now().weekday - 1];

    return Row(
      children: [
        Container(
          width: AimSizes.avatarMd,
          height: AimSizes.avatarMd,
          alignment: Alignment.center,
          decoration: const BoxDecoration(
            gradient: AimGradients.gzHero,
            shape: BoxShape.circle,
          ),
          child: Text(
            _initials(displayName),
            style: AimTextStyles.label.copyWith(color: AimColors.neutral0),
          ),
        ),
        const SizedBox(width: AimSpacing.componentGap),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "$weekday · let's go",
                style: AimTextStyles.caption
                    .copyWith(color: surfaces.textMuted),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                'Hey $firstName ✦',
                style: AimTextStyles.title
                    .copyWith(color: surfaces.textPrimary),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        if (streakDays > 0) ...[
          const SizedBox(width: AimSpacing.innerGap),
          Semantics(
            label: '$streakDays day streak',
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: AimGradients.gzFire,
                borderRadius: AimRadius.borderPill,
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AimSpacing.space12,
                  vertical: AimSpacing.space4,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.local_fire_department_rounded,
                      size: AimSizes.iconSm,
                      color: AimColors.neutral0,
                    ),
                    const SizedBox(width: AimSpacing.space4),
                    Text(
                      '$streakDays',
                      style: AimTextStyles.caption.copyWith(
                        color: AimColors.neutral0,
                        fontWeight: AimFontWeights.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
        AIMIconButton(
          icon: const Icon(Icons.notifications_outlined),
          semanticLabel: 'Notifications',
          onPressed: onOpenNotifications,
        ),
      ],
    );
  }
}

// ── Level hero card (REAL — GET /student/engagement/stats) ─────────────────

class _HomeLevelHeroCard extends StatelessWidget {
  const _HomeLevelHeroCard({required this.stats});

  final HomeEngagementStats stats;

  /// Thousands-separator formatting of an already-real backend integer —
  /// pure presentation, no computation of the value itself.
  static String _withThousandsSeparator(int value) {
    final digits = value.abs().toString();
    final buffer = StringBuffer();
    for (var i = 0; i < digits.length; i++) {
      if (i > 0 && (digits.length - i) % 3 == 0) buffer.write(',');
      buffer.write(digits[i]);
    }
    return (value < 0 ? '-' : '') + buffer.toString();
  }

  @override
  Widget build(BuildContext context) {
    final nextLevelXp = stats.nextLevelMinXp;
    final xpFraction = stats.levelProgressPercent / 100;

    return Semantics(
      label: 'Level ${stats.level}, ${stats.totalXp} XP'
          '${nextLevelXp != null ? ', $nextLevelXp XP to level ${stats.nextLevel}' : ' (max level)'}',
      child: Container(
        padding: const EdgeInsets.all(AimSpacing.cardPaddingLg),
        decoration: BoxDecoration(
          gradient: AimGradients.gzHero,
          borderRadius: AimRadius.borderX2l,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "You're crushing your goals 🚀",
              style: AimTextStyles.caption.copyWith(
                color: AimColors.neutral0.withValues(alpha: 0.9),
                fontWeight: AimFontWeights.semibold,
              ),
            ),
            const SizedBox(height: AimSpacing.space8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Padding(
                        padding: const EdgeInsetsDirectional.only(
                          bottom: AimSpacing.space8,
                        ),
                        child: Text(
                          'LEVEL',
                          style: AimTextStyles.caption.copyWith(
                            color: AimColors.neutral0.withValues(alpha: 0.85),
                            fontWeight: AimFontWeights.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: AimSpacing.space8),
                      Text(
                        '${stats.level}',
                        style: AimTextStyles.display
                            .copyWith(color: AimColors.neutral0, height: 1),
                      ),
                    ],
                  ),
                ),
                DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.2),
                    borderRadius: AimRadius.borderLg,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AimSpacing.space12,
                      vertical: AimSpacing.space8,
                    ),
                    child: Column(
                      children: [
                        Text(
                          '+${_withThousandsSeparator(stats.xpToday)}',
                          style: AimTextStyles.h3
                              .copyWith(color: AimColors.neutral0),
                        ),
                        Text(
                          'XP TODAY',
                          style: AimTextStyles.caption.copyWith(
                            color: AimColors.neutral0.withValues(alpha: 0.85),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AimSpacing.componentGap),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  nextLevelXp != null
                      ? '${_withThousandsSeparator(stats.totalXp)} / ${_withThousandsSeparator(nextLevelXp)} XP'
                      : '${_withThousandsSeparator(stats.totalXp)} XP',
                  style: AimTextStyles.caption.copyWith(
                    color: AimColors.neutral0.withValues(alpha: 0.9),
                  ),
                ),
                if (stats.nextLevel != null)
                  Text(
                    'Level ${stats.nextLevel} →',
                    style: AimTextStyles.caption.copyWith(
                      color: AimColors.neutral0.withValues(alpha: 0.9),
                      fontWeight: AimFontWeights.semibold,
                    ),
                  )
                else
                  Text(
                    'Max level',
                    style: AimTextStyles.caption.copyWith(
                      color: AimColors.neutral0.withValues(alpha: 0.9),
                      fontWeight: AimFontWeights.semibold,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: AimSpacing.space8),
            ClipRRect(
              borderRadius: AimRadius.borderPill,
              child: LinearProgressIndicator(
                value: xpFraction,
                minHeight: AimSpacing.space8,
                backgroundColor: AimColors.neutral0.withValues(alpha: 0.25),
                valueColor:
                    const AlwaysStoppedAnimation<Color>(AimColors.gzLime),
              ),
            ),
            const SizedBox(height: AimSpacing.componentGap),
            Row(
              children: [
                _HeroPill(
                  icon: Icons.emoji_events_outlined,
                  label: stats.badgeCount == 1
                      ? '1 badge'
                      : '${stats.badgeCount} badges',
                ),
                const SizedBox(width: AimSpacing.innerGap),
                _HeroPill(
                  icon: Icons.star_rounded,
                  label: 'Top ${stats.rankPercentile}%',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _HeroPill extends StatelessWidget {
  const _HeroPill({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AimColors.neutral0.withValues(alpha: 0.18),
        borderRadius: AimRadius.borderPill,
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.space12,
          vertical: AimSpacing.space4,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: AimSizes.iconSm, color: AimColors.neutral0),
            const SizedBox(width: AimSpacing.space4),
            Text(
              label,
              style: AimTextStyles.caption.copyWith(
                color: AimColors.neutral0,
                fontWeight: AimFontWeights.semibold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Continue-learning hero card ─────────────────────────────────────────────

/// Design-style continue-learning card: lesson title, percent ring (REAL —
/// backend-stored progress percent), and a gradient Resume CTA.
class _ContinueLearningHeroCard extends StatelessWidget {
  const _ContinueLearningHeroCard({required this.lesson});

  final HomeContinueLearning lesson;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel:
          'Continue ${lesson.lessonTitle}, ${lesson.percent} percent complete',
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  lesson.lessonTitle,
                  style: AimTextStyles.h3.copyWith(color: surfaces.textPrimary),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  '${lesson.percent}% complete',
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                ),
                const SizedBox(height: AimSpacing.componentGap),
                AIMGradientButton(
                  label: 'Resume',
                  icon: const Icon(Icons.play_arrow_rounded),
                  onPressed: () => Navigator.of(context).pushNamed(
                    AppRoutePaths.lessonDetail,
                    arguments: {'lessonId': lesson.lessonId},
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          AIMCircularProgress(
            value: lesson.percent.toDouble(),
            size: 72,
            thickness: 7,
          ),
        ],
      ),
    );
  }
}

// ── Daily challenge row ─────────────────────────────────────────────────────

/// Design-style challenge row: colored icon square, title/description
/// (REAL — backend-selected challenge), and a lime Start/Done trailing pill.
/// No claim endpoint exists, so a completed challenge shows a "Done" pill
/// rather than a fake "Claim" action.
class _DailyChallengeRow extends StatelessWidget {
  const _DailyChallengeRow({required this.challenge, required this.onStart});

  final HomeDailyChallenge challenge;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      padding: const EdgeInsets.all(AimSpacing.componentGap),
      semanticLabel: 'Daily challenge: ${challenge.title}, '
          '${challenge.progressCount} of ${challenge.targetCount}',
      child: Row(
        children: [
          Container(
            width: AimSizes.avatarMd,
            height: AimSizes.avatarMd,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              gradient: AimGradients.gzCoral,
              borderRadius: AimRadius.borderMd,
            ),
            child: const Icon(
              Icons.menu_book_outlined,
              size: AimSizes.iconSm,
              color: AimColors.neutral0,
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  challenge.title,
                  style: AimTextStyles.bodyMd.copyWith(
                    color: surfaces.textPrimary,
                    fontWeight: AimFontWeights.semibold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AimSpacing.space2),
                Text(
                  challenge.description,
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: AimSpacing.componentGap),
          if (challenge.completed)
            const AIMBadge(
              tone: AIMBadgeTone.success,
              variant: AIMBadgeVariant.solid,
              pill: true,
              child: Text('Done'),
            )
          else
            SizedBox(
              height: AimSizes.buttonSm,
              child: FilledButton(
                onPressed: onStart,
                style: FilledButton.styleFrom(
                  backgroundColor: AimColors.gzLime,
                  foregroundColor: AimColors.neutral900,
                  shape: const RoundedRectangleBorder(
                    borderRadius: AimRadius.borderPill,
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: AimSpacing.space16,
                  ),
                  textStyle: AimTextStyles.caption.copyWith(
                    fontWeight: AimFontWeights.bold,
                  ),
                ),
                child: const Text('Start'),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Link button ─────────────────────────────────────────────────────────────

class _LinkButton extends StatelessWidget {
  const _LinkButton({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: AimRadius.borderSm,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.space8,
          vertical: AimSpacing.space4,
        ),
        child: Text(
          label,
          style: AimTextStyles.bodySm.copyWith(
            color: AimColors.primary600,
            fontWeight: AimFontWeights.semibold,
          ),
        ),
      ),
    );
  }
}
