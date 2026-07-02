// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Progress"
//   docs/design/ui-for-all-system-mobile/screenshots/light/11-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/11-screen.png
// Endpoints: GET /aim/students/:id/skill-states, /weakness-records,
//   /recommendations, /review-schedule (via aimResultsProvider); Home
//   engagement summary (via homeProvider, for the day-streak stat only).
// Widgets: AIMGradientHeroHeader, AIMCard, AIMEmptyState, AIMFullScreenLoading,
//   AIMFullScreenError
//
// Phase 6 — P6-098 (restructured — TASK-14)
// ProgressPage — navigation hub screen.
//
// This is a deliberate architectural redesign (confirmed with the end user):
// Progress is now a summary/hub screen rather than an inline renderer of all
// four AIM sections. It shows two real stat cards (average mastery, day
// streak) and four tappable rows that navigate to the four dedicated detail
// screens (SkillStatePage, WeaknessSummaryPage, RecommendationsPage,
// ReviewSchedulePage) which already exist with real named routes.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes mastery, weakness, difficulty, or any AIM value.
//   The only local arithmetic in this file is a plain average of already
//   backend-computed masteryScore values, purely for hub-card display — it
//   does not create, alter, or infer any new AIM signal.
// - All displayed values come from the backend verbatim via
//   aimResultsProvider and homeProvider.
// - studentId sourced from authContextProvider (JWT-resolved).
// - Bearer token from authFlowProvider; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
//
// RTL/Arabic rules:
// - EdgeInsetsDirectional / EdgeInsets.symmetric — RTL-safe.
// - AIMGradientHeroHeader mirrors RTL internally (no back button — tab root).
// - CrossAxisAlignment.start in Column — direction-aware.
// - Chevron icon uses Icons.chevron_right, which Flutter mirrors
//   automatically for RTL via Directionality/IconTheme.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/logic/entity/aim_results_data.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/home/data/models/home_models.dart';
import 'package:aim_mobile/features/home/logic/provider/home_provider.dart';

class ProgressPage extends ConsumerStatefulWidget {
  const ProgressPage({super.key});

  @override
  ConsumerState<ProgressPage> createState() => _ProgressPageState();
}

class _ProgressPageState extends ConsumerState<ProgressPage> {
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
    // Day-streak stat is sourced from homeProvider (HomeData.goal), loaded
    // alongside aimResultsProvider using the same auth-guard pattern already
    // established in home_page.dart's _load().
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

    await ref.read(aimResultsProvider.notifier).refresh(
          bearerToken: token,
          studentId: contextData.user.id,
        );
    await ref.read(homeProvider.notifier).refresh(
          bearerToken: token,
          studentId: contextData.user.id,
        );
  }

  @override
  Widget build(BuildContext context) {
    final aimState = ref.watch(aimResultsProvider);
    final homeState = ref.watch(homeProvider);

    // Combining two providers' async states for one top-level switch:
    // - aimResultsProvider is PRIMARY — every count on this hub (skill
    //   states, weaknesses, recommendations, review schedule) depends on it,
    //   so its loading/error states drive the full-screen switch below.
    // - homeProvider only backs the secondary day-streak stat. Its failure
    //   is handled gracefully inside the hub content (streak card omitted /
    //   zeroed) rather than blocking the whole page, since a broken
    //   engagement call shouldn't hide real, already-loaded AIM progress
    //   data. While homeProvider is still loading (and aimResultsProvider
    //   has already succeeded), we still show the full-screen loader so the
    //   two stat cards don't pop in separately — a small UX smoothing this
    //   page is uniquely positioned to do since it renders both stats side
    //   by side up top.
    final homeStillLoading =
        homeState is AppAsyncLoading || homeState is AppAsyncIdle;

    return Scaffold(
      body: Column(
        children: [
          const AIMGradientHeroHeader(
            title: 'Your progress',
            subtitle: 'A snapshot of how you are doing',
          ),
          Expanded(
            child: switch (aimState) {
              AppAsyncLoading() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading progress data'),
              AppAsyncFailure(:final message) =>
                AIMFullScreenError(message: message, onRetry: _load),
              AppAsyncSuccess(:final data) => homeStillLoading
                  ? const AIMFullScreenLoading(
                      semanticLabel: 'Loading progress data')
                  : _ProgressContent(
                      data: data,
                      goal: switch (homeState) {
                        AppAsyncSuccess(:final data) => data.goal,
                        _ => null,
                      },
                      onRefresh: _refresh,
                    ),
              AppAsyncIdle() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading progress data'),
            },
          ),
        ],
      ),
    );
  }
}

class _ProgressContent extends StatelessWidget {
  const _ProgressContent({
    required this.data,
    required this.goal,
    required this.onRefresh,
  });

  final AimResultsData data;

  /// Backend-computed engagement goal/streak, or null if the engagement
  /// call failed independently (per HomeData's own doc comment) — the
  /// streak stat is simply omitted in that case rather than crashing.
  final HomeEngagementGoalModel? goal;

  final Future<void> Function() onRefresh;

  /// Average of real, backend-computed masteryScore values (0.0–1.0),
  /// displayed as a whole-number percentage. This is a plain arithmetic
  /// mean for display purposes only — it does not invent or infer any new
  /// AIM signal. Returns null (rendered as "--") when there are no skill
  /// states, avoiding a divide-by-zero.
  int? get _averageMasteryPct {
    if (data.skillStates.isEmpty) return null;
    final sum =
        data.skillStates.fold<double>(0, (acc, s) => acc + s.masteryScore);
    return ((sum / data.skillStates.length) * 100).round();
  }

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return const AIMEmptyState(
        icon: Icon(Icons.insights_outlined),
        title: 'No progress data yet',
        subtitle:
            'Complete lessons and practice sessions to see your AIM progress.',
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        children: [
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  value: _averageMasteryPct?.toString() ?? '--',
                  label: 'Avg mastery',
                ),
              ),
              const SizedBox(width: AimSpacing.componentGap),
              Expanded(
                child: _StatCard(
                  value: '${goal?.streakDays ?? 0}',
                  label: 'Day streak',
                  trailingEmoji: '🔥',
                ),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          _ProgressNavRow(
            icon: Icons.auto_stories_outlined,
            title: 'Skill States',
            subtitle: '${data.skillStates.length} skills tracked',
            onTap: () =>
                Navigator.of(context).pushNamed(AppRoutePaths.skillState),
          ),
          const SizedBox(height: AimSpacing.listItemGap),
          _ProgressNavRow(
            icon: Icons.flag_outlined,
            title: 'Weaknesses',
            subtitle: '${data.weaknessRecords.length} focus areas',
            onTap: () => Navigator.of(context)
                .pushNamed(AppRoutePaths.weaknessSummary),
          ),
          const SizedBox(height: AimSpacing.listItemGap),
          _ProgressNavRow(
            icon: Icons.lightbulb_outline,
            title: 'Recommendations',
            subtitle: '${data.recommendations.length} from AIM',
            onTap: () => Navigator.of(context)
                .pushNamed(AppRoutePaths.recommendations),
          ),
          const SizedBox(height: AimSpacing.listItemGap),
          _ProgressNavRow(
            icon: Icons.schedule_outlined,
            title: 'Review Schedule',
            subtitle: '${data.reviewSchedules.length} reviews scheduled',
            onTap: () => Navigator.of(context)
                .pushNamed(AppRoutePaths.reviewSchedule),
          ),
        ],
      ),
    );
  }
}

/// Small stat card for the hub's top row (average mastery / day streak),
/// matching the mockup's two side-by-side white cards with a large numeric
/// value and a small label beneath.
class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.value,
    required this.label,
    this.trailingEmoji,
  });

  final String value;
  final String label;
  final String? trailingEmoji;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: '$value $label',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            trailingEmoji == null ? value : '$value $trailingEmoji',
            style:
                AimTextStyles.h2.copyWith(color: AimColors.primary600),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            label,
            style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

/// Tappable "title + subtitle + chevron" navigation row used for the hub's
/// four destination links. Built as a clean, simple row on top of [AIMCard]
/// (interactive) rather than reusing [AIMAppDrawer]'s item widget, which is
/// specific to the side-drawer's Material/selected-state styling.
class _ProgressNavRow extends StatelessWidget {
  const _ProgressNavRow({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      interactive: true,
      onTap: onTap,
      semanticLabel: '$title, $subtitle',
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: AimSizes.touchTarget),
        child: Row(
          children: [
            Icon(
              icon,
              size: AimSizes.iconMd,
              color: AimColors.primary500,
            ),
            const SizedBox(width: AimSpacing.componentGap),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    style: AimTextStyles.title
                        .copyWith(color: surfaces.textPrimary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: AimSpacing.space4),
                  Text(
                    subtitle,
                    style: AimTextStyles.bodySm
                        .copyWith(color: surfaces.textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
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
    );
  }
}
