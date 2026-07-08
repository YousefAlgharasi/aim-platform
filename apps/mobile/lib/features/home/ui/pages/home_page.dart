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
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
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
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';
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
  /// Device-local timestamp of the last successful load/refresh — shown as
  /// "Last updated" so the student can tell how fresh the screen is,
  /// especially useful if a refresh silently fails and stale data is left
  /// on screen. Never sent to or read from the backend; purely a local UX
  /// signal derived from this device's own clock at fetch time.
  DateTime? _lastUpdatedAt;

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

  /// Presents the notifications sheet. Triggering the load is owned by
  /// [_NotificationsSheetBody] itself, *after* it has already subscribed via
  /// ref.watch — [notificationInboxProvider] is autoDispose, so calling
  /// load()/setFailure() via a bare ref.read() here (before any widget was
  /// watching it) let the provider be disposed and silently reset back to
  /// idle before the sheet's own Consumer ever saw the result, leaving the
  /// sheet stuck on its loading state forever.
  void _openNotifications(BuildContext context, WidgetRef ref) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) => _NotificationsSheetBody(
        onTapItem: (event) {
          sheetContext.pop();
          context.push(AppRoutePaths.notificationDetail, extra: event);
        },
      ),
    );
  }


  @override
  Widget build(BuildContext context) {
    final state = ref.watch(homeProvider);
    final loadingLabel = AppLocalizations.of(context).homeLoadingSemantic;

    ref.listen<AppAsyncState<HomeData>>(homeProvider, (_, next) {
      if (next is AppAsyncSuccess) {
        setState(() => _lastUpdatedAt = DateTime.now());
      }
    });

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: switch (state) {
          AppAsyncLoading() => Semantics(
              label: loadingLabel,
              child: const HomePageSkeleton(),
            ),
          AppAsyncFailure(:final message) => AIMFullScreenError(
              message: message,
              onRetry: _load,
            ),
          AppAsyncSuccess(:final data) => _HomeContent(
              data: data,
              onRefresh: _refresh,
              onOpenNotifications: () => _openNotifications(context, ref),
              lastUpdatedAt: _lastUpdatedAt,
            ),
          AppAsyncIdle() => Semantics(
              label: loadingLabel,
              child: const HomePageSkeleton(),
            ),
        },
      ),
    );
  }
}

/// Notifications sheet body — a real widget (not a bare Consumer) so it can
/// subscribe to [notificationInboxProvider] via ref.watch in its own build()
/// *before* triggering a load/failure via ref.read in initState. Doing the
/// trigger first (the old approach) raced the provider's autoDispose: a
/// bare ref.read() with no listener yet let Riverpod dispose and silently
/// reset the notifier back to idle before this sheet ever saw the result,
/// leaving it stuck on its loading state forever with no error and no retry.
class _NotificationsSheetBody extends ConsumerStatefulWidget {
  const _NotificationsSheetBody({required this.onTapItem});

  final void Function(NotificationEventModel event) onTapItem;

  @override
  ConsumerState<_NotificationsSheetBody> createState() =>
      _NotificationsSheetBodyState();
}

class _NotificationsSheetBodyState
    extends ConsumerState<_NotificationsSheetBody> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _ensureLoaded());
  }

  void _ensureLoaded() {
    final state = ref.read(notificationInboxProvider);
    if (state is AppAsyncSuccess || state is AppAsyncLoading) return;

    final token = ref.read(authFlowProvider).accessToken;
    if (token != null && token.isNotEmpty) {
      ref.read(notificationInboxProvider.notifier).load(bearerToken: token);
    } else {
      // No token yet — surface a retryable failure instead of silently
      // doing nothing, which previously left state stuck at its initial
      // AppAsyncIdle() forever (rendered identically to a loading spinner).
      ref.read(notificationInboxProvider.notifier).setFailure(
            message: 'Please sign in again to view notifications.',
            code: 'NO_SESSION',
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    final inboxState = ref.watch(notificationInboxProvider);

    return switch (inboxState) {
      AppAsyncSuccess(:final data) => AIMNotificationsSheet(
          notifications: data
              .where((event) => event.dismissedAt == null)
              .map((event) => _toNotificationItemData(context, event))
              .toList(),
          headerIcon: const _NotificationBellAvatar(),
          subtitle: _unreadSubtitle(context, data),
          onTapItem: (item) {
            final event = data.firstWhere((e) => e.id == item.id);
            widget.onTapItem(event);
          },
          // onDismissItem intentionally left unset: mirroring
          // NotificationInboxPage's real dismiss flow here would need this
          // sheet to also own bearer-token lookups + notifier wiring for a
          // call site that's meant to be a lightweight preview; the full
          // dismiss flow already exists on the dedicated inbox page, so
          // it's safer to omit it here than risk a half-correct
          // reimplementation.
          // onMarkAllRead intentionally left unset: no bulk
          // mark-all-as-read method exists on NotificationRepository or
          // NotificationInboxNotifier today (only per-item markAsRead) —
          // omitted rather than inventing an endpoint.
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
  }
}

/// Real subtitle computed from the same backend-returned list shown in the
/// sheet — counts unread, non-dismissed events, not a fabricated figure.
String _unreadSubtitle(
  BuildContext context,
  List<NotificationEventModel> events,
) {
  final unread = events.where((e) => e.isUnread).length;
  return AppLocalizations.of(context).homeUnreadNotificationsSubtitle(unread);
}

AIMNotificationItemData _toNotificationItemData(
  BuildContext context,
  NotificationEventModel event,
) {
  return AIMNotificationItemData(
    id: event.id,
    title: event.title ?? '',
    body: event.body,
    timeLabel: _relativeTimeLabel(context, event.createdAt),
    read: !event.isUnread,
  );
}

/// Computes a real relative-time label (e.g. "1h ago", "Yesterday") from the
/// backend-supplied `createdAt` ISO timestamp — a small real computation
/// from real data, not a fabricated value.
String _relativeTimeLabel(BuildContext context, String createdAtIso) {
  final createdAt = DateTime.tryParse(createdAtIso);
  if (createdAt == null) return '';
  final l10n = AppLocalizations.of(context);

  final diff = DateTime.now().toUtc().difference(createdAt.toUtc());
  if (diff.inMinutes < 1) return l10n.commonJustNow;
  if (diff.inMinutes < 60) return l10n.homeMinutesAgoLabel(diff.inMinutes);
  if (diff.inHours < 24) return l10n.homeHoursAgoLabel(diff.inHours);
  if (diff.inDays == 1) return l10n.commonYesterday;
  if (diff.inDays < 7) return l10n.homeDaysAgoLabel(diff.inDays);
  return l10n.homeWeeksAgoLabel(diff.inDays ~/ 7);
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
    this.lastUpdatedAt,
  });

  final HomeData data;
  final Future<void> Function() onRefresh;
  final VoidCallback onOpenNotifications;

  /// Device-local time of the last successful load/refresh, or null before
  /// the first one has completed this session. Purely a local UX signal —
  /// never a backend field.
  final DateTime? lastUpdatedAt;

  void _navigateToLesson(BuildContext context, HomeQuickStartLesson lesson) {
    context.push(
      AppRoutePaths.lessonDetail,
      extra: {
        'lessonId': lesson.lessonId,
        'lessonTitle': lesson.lessonTitle,
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

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
          if (lastUpdatedAt != null) ...[
            const SizedBox(height: AimSpacing.space4),
            _LastUpdatedLabel(updatedAt: lastUpdatedAt!),
          ],
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
                  l10n.homeContinueLearningTitle,
                  style: AimTextStyles.h3
                      .copyWith(color: surfaces.textPrimary),
                ),
                _LinkButton(
                  label: l10n.homeLibraryLink,
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
                      l10n.homeDailyChallengesTitle,
                      style: AimTextStyles.h3
                          .copyWith(color: surfaces.textPrimary),
                    ),
                  ],
                ),
                Text(
                  l10n.homeDailyChallengeCountLabel(
                    data.dailyChallenge!.completed ? 1 : 0,
                    1,
                  ),
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
            HomeSectionHeader(title: l10n.homeQuickStartTitle),
            const SizedBox(height: AimSpacing.componentGap),
            HomeQuickStartLessonCard(
              lesson: data.quickStartLesson!,
              onTap: () => _navigateToLesson(context, data.quickStartLesson!),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          const _HomeCurrentAssessmentSection(),
          if (data.goal != null) ...[
            HomeSectionHeader(title: l10n.homeGoalTitle),
            const SizedBox(height: AimSpacing.componentGap),
            HomeGoalCard(goal: data.goal!),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.isEmpty) ..._gettingStartedCards(context, ref),
          if (data.skillStates.isNotEmpty) ...[
            HomeSectionHeader(title: l10n.homeSkillStatesTitle),
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
            HomeSectionHeader(title: l10n.commonFocusAreas),
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
            HomeSectionHeader(title: l10n.homeReviewScheduleTitle),
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
            HomeSectionHeader(title: l10n.homeRecommendationsTitle),
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
  final l10n = AppLocalizations.of(context);

  return [
    HomeSectionHeader(title: l10n.homeGetStartedTitle),
    const SizedBox(height: AimSpacing.componentGap),
    AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: () => context.push(
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
                  l10n.homePlacementTestTitle,
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  l10n.homePlacementTestSubtitle,
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
                  l10n.homeBrowseCoursesTitle,
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                ),
                const SizedBox(height: AimSpacing.space4),
                Text(
                  l10n.homeBrowseCoursesSubtitle,
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

// ── Current assessment section ──────────────────────────────────────────────

/// Shows at most the student's single "current" assessment (backend-picked
/// via GET /student/assessments/next — the oldest unlocked, not-yet-attempted
/// one), never the full cross-course assessment list. Renders nothing when
/// there's no current assessment, so it never displaces the sections below
/// it with an empty placeholder.
class _HomeCurrentAssessmentSection extends ConsumerStatefulWidget {
  const _HomeCurrentAssessmentSection();

  @override
  ConsumerState<_HomeCurrentAssessmentSection> createState() =>
      _HomeCurrentAssessmentSectionState();
}

class _HomeCurrentAssessmentSectionState
    extends ConsumerState<_HomeCurrentAssessmentSection> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(nextAssessmentProvider.notifier).load(bearerToken: token);
  }

  void _openAssessment(AssessmentListItem item) {
    context.push(
      '/student/assessments/detail',
      extra: {'assessmentId': item.id, 'assessmentTitle': item.title},
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(nextAssessmentProvider);
    final l10n = AppLocalizations.of(context);

    final item = switch (state) {
      AppAsyncSuccess(:final data) => data,
      _ => null,
    };
    if (item == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        HomeSectionHeader(title: l10n.homeAssessmentsTitle),
        const SizedBox(height: AimSpacing.componentGap),
        _HomeAssessmentCard(
          item: item,
          onTap: () => _openAssessment(item),
        ),
        const SizedBox(height: AimSpacing.sectionGap),
      ],
    );
  }
}

class _HomeAssessmentCard extends StatelessWidget {
  const _HomeAssessmentCard({required this.item, required this.onTap});

  final AssessmentListItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      onTap: onTap,
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
                  item.title,
                  style: AimTextStyles.title.copyWith(
                    color: surfaces.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (item.description != null) ...[
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    item.description!,
                    style: AimTextStyles.bodySm.copyWith(
                      color: surfaces.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
          Icon(Icons.chevron_right, color: surfaces.textMuted),
        ],
      ),
    );
  }
}

// ── Last updated label ──────────────────────────────────────────────────────

/// Small "Last updated Xm ago" caption computed from a device-local
/// timestamp recorded at the moment the home data last successfully loaded.
/// This is a local UX signal only — it never reads or fabricates any
/// backend field, and exists so a student can tell how fresh the screen is
/// (e.g. after a silent background refresh failure leaves stale data
/// on-screen).
class _LastUpdatedLabel extends StatelessWidget {
  const _LastUpdatedLabel({required this.updatedAt});

  final DateTime updatedAt;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);
    final diff = DateTime.now().difference(updatedAt);

    final label = diff.inMinutes < 1
        ? l10n.homeLastUpdatedJustNow
        : diff.inMinutes < 60
            ? l10n.homeLastUpdatedMinutesAgo(diff.inMinutes)
            : l10n.homeLastUpdatedHoursAgo(diff.inHours);

    return Text(
      label,
      style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
    );
  }
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
    final l10n = AppLocalizations.of(context);
    final authState = ref.watch(authContextProvider);
    final displayName = switch (authState) {
      AppAsyncSuccess(:final data) =>
        data.profile?.displayName ?? data.user.email ?? '',
      _ => '',
    };
    final firstName = displayName.split(RegExp(r'[\s@]+')).first;
    final locale = Localizations.localeOf(context).toString();
    final weekday = DateFormat.EEEE(locale).format(DateTime.now());

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
                l10n.homeGreetingWeekdayLine(weekday),
                style: AimTextStyles.caption
                    .copyWith(color: surfaces.textMuted),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                l10n.homeGreetingHey(firstName),
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
            label: l10n.homeStreakDaysSemantic(streakDays),
            child: DecoratedBox(
              decoration: const BoxDecoration(
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
          semanticLabel: l10n.shellNotifications,
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
    final l10n = AppLocalizations.of(context);
    final nextLevelXp = stats.nextLevelMinXp;
    final xpFraction = stats.levelProgressPercent / 100;

    return Semantics(
      label: nextLevelXp != null
          ? l10n.homeLevelHeroSemanticNext(
              stats.level, stats.totalXp, nextLevelXp, stats.nextLevel!)
          : l10n.homeLevelHeroSemanticMax(stats.level, stats.totalXp),
      child: Container(
        padding: const EdgeInsets.all(AimSpacing.cardPaddingLg),
        decoration: const BoxDecoration(
          gradient: AimGradients.gzHero,
          borderRadius: AimRadius.borderX2l,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.homeCrushingGoalsTitle,
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
                          l10n.homeLevelLabel,
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
                          l10n.homeXpTodayLabel,
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
                      ? l10n.homeXpProgressWithNext(
                          _withThousandsSeparator(stats.totalXp),
                          _withThousandsSeparator(nextLevelXp),
                        )
                      : l10n.homeXpProgressMax(
                          _withThousandsSeparator(stats.totalXp),
                        ),
                  style: AimTextStyles.caption.copyWith(
                    color: AimColors.neutral0.withValues(alpha: 0.9),
                  ),
                ),
                if (stats.nextLevel != null)
                  Text(
                    l10n.homeNextLevelCta(stats.nextLevel!),
                    style: AimTextStyles.caption.copyWith(
                      color: AimColors.neutral0.withValues(alpha: 0.9),
                      fontWeight: AimFontWeights.semibold,
                    ),
                  )
                else
                  Text(
                    l10n.homeMaxLevelLabel,
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
                  label: l10n.homeBadgeCountLabel(stats.badgeCount),
                ),
                const SizedBox(width: AimSpacing.innerGap),
                _HeroPill(
                  icon: Icons.star_rounded,
                  label: l10n.homeTopPercentLabel(stats.rankPercentile),
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
    final l10n = AppLocalizations.of(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel:
          l10n.homeContinueSemanticLabel(lesson.lessonTitle, lesson.percent),
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
                  l10n.homePercentCompleteLabel(lesson.percent),
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                ),
                const SizedBox(height: AimSpacing.componentGap),
                AIMGradientButton(
                  label: l10n.homeResumeButton,
                  icon: const Icon(Icons.play_arrow_rounded),
                  onPressed: () => context.push(
                    AppRoutePaths.lessonDetail,
                    extra: {'lessonId': lesson.lessonId},
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
    final l10n = AppLocalizations.of(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      padding: const EdgeInsets.all(AimSpacing.componentGap),
      semanticLabel: l10n.homeDailyChallengeSemantic(
        challenge.title,
        challenge.progressCount,
        challenge.targetCount,
      ),
      child: Row(
        children: [
          Container(
            width: AimSizes.avatarMd,
            height: AimSizes.avatarMd,
            alignment: Alignment.center,
            decoration: const BoxDecoration(
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
            AIMBadge(
              tone: AIMBadgeTone.success,
              variant: AIMBadgeVariant.solid,
              pill: true,
              child: Text(l10n.commonDone),
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
                child: Text(l10n.commonStart),
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
