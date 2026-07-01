// Phase 6 — P6-062
// HomePage — Student home screen MVP.
//
// Renders four backend-sourced data sections via [homeProvider]:
//   1. Skill states   — AIM band / mastery summary cards
//   2. Weaknesses     — AIM weakness topic chips
//   3. Review schedule — AIM due-date reminder cards
//   4. Recommendations — AIM-generated action cards
//
// Flutter never calculates or infers any AIM value. All values come from the
// backend verbatim through HomeNotifier → HomeRepository → backend API.
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
// - AIMTopAppBar handles RTL navigation icon mirroring internally.
// - Padding uses symmetric EdgeInsets so it mirrors correctly under RTL.

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
      appBar: AIMTopAppBar(
        title: 'Home',
        actions: [
          AIMIconButton(
            icon: const Icon(Icons.notifications_outlined),
            semanticLabel: 'Notifications',
            onPressed: () => _openNotifications(context, ref),
          ),
        ],
      ),
      body: switch (state) {
        AppAsyncLoading() => const AIMFullScreenLoading(
            semanticLabel: 'Loading home data',
          ),
        AppAsyncFailure(:final message) =>  AIMFullScreenError(
            message: message,
            onRetry: _load,
          ),
        AppAsyncSuccess(:final data) => _HomeContent(
            data: data,
            onRefresh: _refresh,
          ),
        AppAsyncIdle() => const AIMFullScreenLoading(
            semanticLabel: 'Loading home data',
          ),
      },
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
  });

  final HomeData data;
  final Future<void> Function() onRefresh;

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
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        children: [
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
          if (data.continueLearning != null) ...[
            const HomeSectionHeader(title: 'Continue Learning'),
            const SizedBox(height: AimSpacing.componentGap),
            HomeContinueLearningCard(lesson: data.continueLearning!),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.goal != null) ...[
            const HomeSectionHeader(title: 'Goal'),
            const SizedBox(height: AimSpacing.componentGap),
            HomeGoalCard(goal: data.goal!),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.dailyChallenge != null) ...[
            const HomeSectionHeader(title: 'Daily Challenge'),
            const SizedBox(height: AimSpacing.componentGap),
            HomeDailyChallengeCard(challenge: data.dailyChallenge!),
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
