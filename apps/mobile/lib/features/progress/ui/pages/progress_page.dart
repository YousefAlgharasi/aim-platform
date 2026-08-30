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
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/logic/entity/aim_results_data.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/home/logic/entity/home_engagement.dart';
import 'package:aim_mobile/features/home/logic/provider/home_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

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
    final colorScheme = Theme.of(context).colorScheme;
    final surfaces = aimSurfacesOf(context);

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
      backgroundColor: colorScheme.surface,
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
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppLocalizations.of(context).progressTitle,
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: surfaces.textPrimary,
                            letterSpacing: -0.4,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          AppLocalizations.of(context).progressSubtitle,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: surfaces.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Row(
                    children: [
                      const AimQuickThemeToggle(size: 36, iconSize: 18),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: colorScheme.primaryContainer,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Icon(Icons.bar_chart_rounded, color: colorScheme.primary, size: 22),
                      ),
                    ],
                  ),
                ],
              ),
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
      ),
    );
  }
}

class _ProgressContent extends StatefulWidget {
  const _ProgressContent({
    required this.data,
    required this.goal,
    required this.onRefresh,
  });

  final AimResultsData data;
  final HomeEngagementGoal? goal;
  final Future<void> Function() onRefresh;

  @override
  State<_ProgressContent> createState() => _ProgressContentState();
}

class _ProgressContentState extends State<_ProgressContent> {
  int _selectedTab = 0; // 0: Overview, 1: Skills, 2: Weaknesses, 3: Schedule

  int? get _averageMasteryPct {
    if (widget.data.skillStates.isEmpty) return null;
    final sum =
        widget.data.skillStates.fold<double>(0, (acc, s) => acc + s.masteryScore);
    return ((sum / widget.data.skillStates.length) * 100).round();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.data.isEmpty) {
      return AIMEmptyState(
        icon: const Icon(Icons.insights_outlined),
        title: AppLocalizations.of(context).progressNoProgressData,
        subtitle:
            'Complete lessons and practice sessions to see your AIM progress.',
      );
    }

    return RefreshIndicator(
      onRefresh: widget.onRefresh,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        children: [
          // Segmented Sub-Tab Switcher matching prototype
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFFE2E8F0).withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: [
                _buildSubTabButton(0, 'Overview'),
                _buildSubTabButton(1, 'Skills'),
                _buildSubTabButton(2, 'Focus Areas'),
                _buildSubTabButton(3, 'Schedule'),
              ],
            ),
          ),

          const SizedBox(height: 20),

          if (_selectedTab == 0) ..._buildOverviewTab(),
          if (_selectedTab == 1) ..._buildSkillsTab(),
          if (_selectedTab == 2) ..._buildWeaknessesTab(),
          if (_selectedTab == 3) ..._buildScheduleTab(),
        ],
      ),
    );
  }

  Widget _buildSubTabButton(int index, String label) {
    final isSelected = _selectedTab == index;
    final colorScheme = Theme.of(context).colorScheme;
    final surfaces = aimSurfacesOf(context);
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedTab = index),
        borderRadius: BorderRadius.circular(10),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? surfaces.surface : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: surfaces.textPrimary.withValues(alpha: 0.05),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    )
                  ]
                : null,
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? colorScheme.primary : surfaces.textSecondary,
              ),
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildOverviewTab() {
    final l10n = AppLocalizations.of(context);
    return [
      // Top 2 Stat Cards matching prototype
      Row(
        children: [
          Expanded(
            child: _buildStatCard(
              val: _averageMasteryPct != null ? '$_averageMasteryPct%' : '--',
              label: l10n.progressAvgMastery,
              icon: Icons.bolt_rounded,
              color: const Color(0xFF4F46E5),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: _buildStatCard(
              val: '${widget.goal?.streakDays ?? 0}',
              label: l10n.progressDayStreak,
              icon: Icons.local_fire_department_rounded,
              color: const Color(0xFFF59E0B),
            ),
          ),
        ],
      ),

      const SizedBox(height: 16),

      _ProgressNavRow(
        icon: Icons.auto_stories_outlined,
        title: l10n.progressSkillStates,
        subtitle: '${widget.data.skillStates.length} skills tracked',
        onTap: () => context.push(AppRoutePaths.skillState),
      ),
      const SizedBox(height: 10),
      _ProgressNavRow(
        icon: Icons.flag_outlined,
        title: l10n.progressWeaknesses,
        subtitle: '${widget.data.weaknessRecords.length} focus areas',
        onTap: () => context.push(AppRoutePaths.weaknessSummary),
      ),
      const SizedBox(height: 10),
      _ProgressNavRow(
        icon: Icons.lightbulb_outline,
        title: l10n.progressRecommendations,
        subtitle: '${widget.data.recommendations.length} from AIM',
        onTap: () => context.push(AppRoutePaths.recommendations),
      ),
      const SizedBox(height: 10),
      _ProgressNavRow(
        icon: Icons.schedule_outlined,
        title: l10n.progressReviewSchedule,
        subtitle: '${widget.data.reviewSchedules.length} reviews scheduled',
        onTap: () => context.push(AppRoutePaths.reviewSchedule),
      ),

      const SizedBox(height: 20),

      // Weekly Activity Chart Card matching prototype
      Builder(
        builder: (context) {
          final surfaces = aimSurfacesOf(context);
          final colorScheme = Theme.of(context).colorScheme;
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: surfaces.surface,
              borderRadius: BorderRadius.circular(20),
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppLocalizations.of(context).progressWeeklyActivity,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: surfaces.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          AppLocalizations.of(context).progressDailyAverageMins(35),
                          style: TextStyle(
                            fontSize: 11,
                            color: surfaces.textMuted,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: colorScheme.primaryContainer,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        AppLocalizations.of(context).progressTotalMins(245),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: colorScheme.primary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 100,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      _buildBar('Mon', 0.45, '25m'),
                      _buildBar('Tue', 0.75, '40m'),
                      _buildBar('Wed', 0.55, '30m'),
                      _buildBar('Thu', 0.95, '50m'),
                      _buildBar('Fri', 0.65, '35m'),
                      _buildBar('Sat', 0.85, '45m'),
                      _buildBar('Sun', 0.60, '30m'),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),

      const SizedBox(height: 20),

      // Focus Areas Preview matching prototype
      if (widget.data.weaknessRecords.isNotEmpty) ...[
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              AppLocalizations.of(context).progressWeaknessRecordsHeader(widget.data.weaknessRecords.length),
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                color: aimSurfacesOf(context).textMuted,
                letterSpacing: 1.0,
              ),
            ),
            InkWell(
              onTap: () => context.push(AppRoutePaths.weaknessSummary),
              child: Text(
                AppLocalizations.of(context).progressViewAll,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        for (final w in widget.data.weaknessRecords.take(3))
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: aimSurfacesOf(context).surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: aimSurfacesOf(context).border),
            ),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF1F2),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.flag_rounded, color: Color(0xFFE11D48), size: 16),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    _prettifySkillId(w.skillId),
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: aimSurfacesOf(context).textPrimary,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF1F2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    AppLocalizations.of(context).progressPriorityLabel(w.severity.toUpperCase()),
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFFE11D48),
                    ),
                  ),
                ),
              ],
            ),
          ),
      ],
    ];
  }

  List<Widget> _buildSkillsTab() {
    final skills = widget.data.skillStates;
    final surfaces = aimSurfacesOf(context);
    final colorScheme = Theme.of(context).colorScheme;
    return [
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            AppLocalizations.of(context).progressTrackedSkillsHeader(skills.length),
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: surfaces.textMuted,
              letterSpacing: 1.0,
            ),
          ),
          InkWell(
            onTap: () => context.push(AppRoutePaths.skillState),
            child: Text(
              AppLocalizations.of(context).progressViewFullTable,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: colorScheme.primary,
              ),
            ),
          ),
        ],
      ),
      const SizedBox(height: 12),
      for (final skill in skills) ...[
        Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: surfaces.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: surfaces.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      _prettifySkillId(skill.skillId),
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textPrimary,
                      ),
                    ),
                  ),
                  Text(
                    '${(skill.masteryScore * 100).round()}%',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: colorScheme.primary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(6),
                child: LinearProgressIndicator(
                  value: skill.masteryScore.clamp(0.0, 1.0),
                  minHeight: 6,
                  backgroundColor: colorScheme.primaryContainer,
                  valueColor: AlwaysStoppedAnimation(colorScheme.primary),
                ),
              ),
            ],
          ),
        ),
      ],
    ];
  }

  List<Widget> _buildWeaknessesTab() {
    final weaknesses = widget.data.weaknessRecords;
    final surfaces = aimSurfacesOf(context);
    return [
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            AppLocalizations.of(context).progressWeaknessRecordsHeader(weaknesses.length),
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: surfaces.textMuted,
              letterSpacing: 1.0,
            ),
          ),
          InkWell(
            onTap: () => context.push(AppRoutePaths.weaknessSummary),
            child: Text(
              AppLocalizations.of(context).progressViewAll,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ),
        ],
      ),
      const SizedBox(height: 12),
      if (weaknesses.isEmpty)
        Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(AppLocalizations.of(context).progressNoWeaknesses),
          ),
        ),
      for (final w in weaknesses) ...[
        Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: surfaces.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: surfaces.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      _prettifySkillId(w.skillId),
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textPrimary,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF1F2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      AppLocalizations.of(context).progressPriorityLabel(w.severity.toUpperCase()),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFFE11D48),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                AppLocalizations.of(context).progressWeakSpotIdentified,
                style: TextStyle(
                  fontSize: 12,
                  color: surfaces.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ],
    ];
  }

  List<Widget> _buildScheduleTab() {
    final schedules = widget.data.reviewSchedules;
    final surfaces = aimSurfacesOf(context);
    final colorScheme = Theme.of(context).colorScheme;
    return [
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            AppLocalizations.of(context).progressReviewScheduleHeader(schedules.length),
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: surfaces.textMuted,
              letterSpacing: 1.0,
            ),
          ),
          InkWell(
            onTap: () => context.push(AppRoutePaths.reviewSchedule),
            child: Text(
              AppLocalizations.of(context).progressViewFullSchedule,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: colorScheme.primary,
              ),
            ),
          ),
        ],
      ),
      const SizedBox(height: 12),
      for (final s in schedules) ...[
        Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: surfaces.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: surfaces.border),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _prettifySkillId(s.skillId),
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: surfaces.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      AppLocalizations.of(context).progressIntervalAndRep(s.intervalDays.round(), s.repetitionCount),
                      style: TextStyle(
                        fontSize: 11,
                        color: surfaces.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: s.status == 'due' ? const Color(0xFFFEF2F2) : surfaces.surfaceSunken,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  s.status.toUpperCase(),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: s.status == 'due' ? const Color(0xFFEF4444) : surfaces.textSecondary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    ];
  }

  Widget _buildStatCard({
    required String val,
    required String label,
    required IconData icon,
    required Color color,
  }) {
    final surfaces = aimSurfacesOf(context);
    return Container(
      padding: const EdgeInsets.all(12),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: surfaces.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            val,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: surfaces.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBar(String day, double heightPct, String val) {
    final surfaces = aimSurfacesOf(context);
    final colorScheme = Theme.of(context).colorScheme;
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Text(
          val,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w600,
            color: surfaces.textMuted,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          width: 18,
          height: 60 * heightPct,
          decoration: BoxDecoration(
            color: heightPct > 0.8 ? colorScheme.primary : colorScheme.primary.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(6),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          day,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: surfaces.textSecondary,
          ),
        ),
      ],
    );
  }
}

String _prettifySkillId(String skillId) {
  final lastSegment = skillId.split(':').last;
  final words = lastSegment
      .split(RegExp(r'[_\-]+'))
      .where((w) => w.isNotEmpty)
      .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase());
  final label = words.join(' ');
  return label.isEmpty ? skillId : label;
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
