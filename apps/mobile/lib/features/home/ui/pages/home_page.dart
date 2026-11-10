// HomePage — the student dashboard, laid out like the web dashboard on a phone.
//
// Order (the order the web uses on a phone): greeting and date, notices,
// Word of the Day, the current course roadmap, stats, top learners, daily
// goal, daily challenges, this week's activity, upcoming deadlines.
//
// Flutter never calculates or infers any AIM value. All values come from the
// backend verbatim (level, XP, rank, streak, goal and challenge progress,
// leaderboard, deadlines).
//
// Security rules:
// - studentId sourced from authContextProvider (JWT-resolved).
// - Bearer token from authFlowProvider. Never stored in this widget.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
//
// RTL/Arabic: Directionality-aware widgets only.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/home/logic/entity/home_data.dart';
import 'package:aim_mobile/features/home/logic/provider/home_provider.dart';
import 'package:aim_mobile/core/localization/inline_tr.dart';
import 'package:aim_mobile/features/home/logic/provider/dashboard_extras_provider.dart';
import 'package:aim_mobile/features/home/logic/provider/home_courses_provider.dart';
import '../widgets/dashboard_sections.dart';
import '../widgets/home_course_path_section.dart';
import '../widgets/home_page_skeleton.dart';

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

    ref.invalidate(homeCoursesProvider);
    await ref.read(homeProvider.notifier).refresh(
          bearerToken: token,
          studentId: contextData.user.id,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(homeProvider);
    final loadingLabel = context.tr('Loading', 'جارٍ التحميل');

    ref.listen<AppAsyncState<HomeData>>(homeProvider, (_, next) {
      if (next is AppAsyncSuccess) {
        setState(() => _lastUpdatedAt = DateTime.now());
      }
    });

    ref.listen(authContextProvider, (_, next) {
      if (next is AppAsyncSuccess) {
        _load();
      }
    });

    if (state is AppAsyncIdle) {
      final authContext = ref.read(authContextProvider);
      if (authContext is AppAsyncSuccess) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted && ref.read(homeProvider) is AppAsyncIdle) {
            _load();
          }
        });
      }
    }

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

/// Main content — only rendered on the success state.
class _HomeContent extends ConsumerWidget {
  const _HomeContent({
    required this.data,
    required this.onRefresh,
    this.lastUpdatedAt,
  });

  final HomeData data;
  final Future<void> Function() onRefresh;
  final DateTime? lastUpdatedAt;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authContextProvider);
    final displayName = switch (authState) {
      AppAsyncSuccess(:final data) =>
        data.profile?.displayName ?? '',
      _ => '',
    };
    final firstName = displayName.trim().split(RegExp(r'\s+')).first;
    const gap = SizedBox(height: AimSpacing.sectionGap);

    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(dashboardExtrasProvider);
        ref.invalidate(homeCoursesProvider);
        await onRefresh();
      },
      child: ListView(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.space16,
        ),
        children: [
          DashboardGreeting(firstName: firstName),
          const SizedBox(height: AimSpacing.sectionGap),
          DashboardBanners(
            hasFailedSections: data.hasFailedSections,
            onRetry: onRefresh,
          ),
          DailyGoalCard(
            goal: data.goal,
            xpToday: data.engagementStats?.xpToday,
          ),
          gap,
          const WordOfDayCard(),
          gap,
          const HomeCoursePathSection(),
          gap,
          StatsGrid(stats: data.engagementStats),
          gap,
          const LeaderboardCard(),
          gap,
          ChallengesCard(fallback: data.dailyChallenge),
          if (data.dailyChallenge != null) gap,
          WeeklyActivityCard(stats: data.engagementStats),
          gap,
          const DeadlinesCard(),
          const SizedBox(height: 72),
        ],
      ),
    );
  }
}
