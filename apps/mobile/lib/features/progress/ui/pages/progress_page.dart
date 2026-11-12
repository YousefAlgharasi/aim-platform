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

import 'package:aim_mobile/core/localization/inline_tr.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/logic/entity/aim_results_data.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/home/logic/entity/home_engagement.dart';
import 'package:aim_mobile/features/home/logic/provider/home_provider.dart';
import 'package:aim_mobile/features/learner_tools/data/learner_tools_api.dart';
import 'package:aim_mobile/features/reviews/ui/due_review_actions.dart';
import 'package:aim_mobile/features/reviews/ui/widgets/due_review_tile.dart';
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
    ref.invalidate(dueReviewsProvider);
  }

  @override
  Widget build(BuildContext context) {
    final aimState = ref.watch(aimResultsProvider);
    final homeState = ref.watch(homeProvider);
    final colorScheme = Theme.of(context).colorScheme;

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
            // A main screen: the heading sits under the app frame's AIM bar
            // (the light/dark switch lives in the menu).
            Padding(
              padding: const EdgeInsetsDirectional.fromSTEB(20, 16, 20, 8),
              child: PageTitleBar(
                title: AppLocalizations.of(context).progressTitle,
                subtitle: AppLocalizations.of(context).progressSubtitle,
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
                        weekly: switch (homeState) {
                          AppAsyncSuccess(:final data) => data.engagementStats?.weeklyActivity,
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

class _ProgressContent extends ConsumerStatefulWidget {
  const _ProgressContent({
    required this.data,
    required this.goal,
    required this.weekly,
    required this.onRefresh,
  });

  final AimResultsData data;
  final HomeEngagementGoal? goal;

  /// Backend XP per day for the current week, or null when unavailable.
  final List<HomeWeeklyActivityDay>? weekly;
  final Future<void> Function() onRefresh;

  @override
  ConsumerState<_ProgressContent> createState() => _ProgressContentState();
}

class _ProgressContentState extends ConsumerState<_ProgressContent> {
  int _tab = 0; // 0 Overview, 1 Skills, 2 Focus areas, 3 Reviews

  @override
  Widget build(BuildContext context) {
    if (widget.data.isEmpty) {
      return AIMEmptyState(
        icon: const Icon(Icons.insights_outlined),
        title: AppLocalizations.of(context).progressNoProgressData,
        subtitle: context.tr(
          'Complete lessons and practice sessions to see your AIM progress.',
          'أكمل الدروس وجلسات التدريب لترى تقدّمك.',
        ),
      );
    }

    final titles = ref.watch(skillTitlesProvider).valueOrNull ?? const <String, String>{};
    final due = ref.watch(dueReviewsProvider);

    final tabs = [
      (Icons.dashboard_rounded, context.tr('Overview', 'نظرة عامة')),
      (Icons.auto_stories_rounded, context.tr('Skills', 'المهارات')),
      (Icons.flag_rounded, context.tr('Focus Areas', 'نقاط التركيز')),
      (Icons.replay_rounded, context.tr('Reviews', 'المراجعات')),
    ];

    return RefreshIndicator(
      onRefresh: widget.onRefresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 72),
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (var i = 0; i < tabs.length; i++)
                  _TabPill(
                    icon: tabs[i].$1,
                    label: tabs[i].$2,
                    selected: _tab == i,
                    onTap: () => setState(() => _tab = i),
                  ),
              ],
            ),
          ),
          const SizedBox(height: AimSpacing.sectionGap),
          if (_tab == 0) ..._overview(titles, due),
          if (_tab == 1) ..._skills(titles),
          if (_tab == 2) ..._focus(titles),
          if (_tab == 3) ..._reviews(titles, due),
        ],
      ),
    );
  }

  // ── Overview ──────────────────────────────────────────────────────────────

  List<Widget> _overview(Map<String, String> titles, AsyncValue<List<DueReview>> due) {
    final l10n = AppLocalizations.of(context);
    final surfaces = aimSurfacesOf(context);
    final weak = widget.data.weaknessRecords
        .where((w) => w.status.toLowerCase() != 'resolved')
        .toList();
    final dueList = due.valueOrNull ?? const <DueReview>[];

    return [
      _TileGrid(
        tiles: [
          _Tile(
            icon: Icons.auto_stories_rounded,
            tone: AimColors.primary500,
            value: '${widget.data.skillStates.length}',
            label: context.tr('Skills tracked', 'مهارات متابَعة'),
          ),
          _Tile(
            icon: Icons.local_fire_department_rounded,
            tone: const Color(0xFFFF7A1A),
            value: '${widget.goal?.streakDays ?? 0}',
            label: l10n.progressDayStreak,
          ),
        ],
      ),
      const SizedBox(height: AimSpacing.sectionGap),
      _NavRow(
        icon: Icons.auto_stories_outlined,
        title: l10n.progressSkillStates,
        subtitle: '${widget.data.skillStates.length} skills tracked',
        onTap: () => context.push(AppRoutePaths.skillState),
      ),
      const SizedBox(height: AimSpacing.componentGap),
      _NavRow(
        icon: Icons.flag_outlined,
        title: l10n.progressWeaknesses,
        subtitle: '${widget.data.weaknessRecords.length} focus areas',
        onTap: () => context.push(AppRoutePaths.weaknessSummary),
      ),
      const SizedBox(height: AimSpacing.componentGap),
      _NavRow(
        icon: Icons.lightbulb_outline,
        title: l10n.progressRecommendations,
        subtitle: '${widget.data.recommendations.length} from AIM',
        onTap: () => context.push(AppRoutePaths.recommendations),
      ),
      const SizedBox(height: AimSpacing.componentGap),
      _NavRow(
        icon: Icons.schedule_outlined,
        title: l10n.progressReviewSchedule,
        subtitle: due.hasValue
            ? fill(context.tr('{n} due now', '{n} مستحقة الآن'), {'n': dueList.length})
            : context.tr('Checking…', 'جارٍ التحقق…'),
        onTap: () => context.push(AppRoutePaths.reviewSchedule),
      ),
      if (widget.weekly != null && widget.weekly!.any((d) => d.xp > 0)) ...[
        const SizedBox(height: AimSpacing.sectionGap),
        _WeeklyXp(days: widget.weekly!),
      ],
      if (weak.isNotEmpty) ...[
        const SizedBox(height: AimSpacing.sectionGap),
        _SectionHeader(
          icon: Icons.flag_rounded,
          title: context.tr('Focus areas', 'نقاط التركيز'),
          actionLabel: context.tr('See all', 'عرض الكل'),
          onAction: () => setState(() => _tab = 2),
        ),
        const SizedBox(height: AimSpacing.componentGap),
        for (final w in weak.take(3)) ...[
          _WeaknessRow(name: skillName(titles, w.skillId), severity: w.severity),
          const SizedBox(height: AimSpacing.componentGap),
        ],
      ],
      if (dueList.isNotEmpty) ...[
        const SizedBox(height: AimSpacing.space8),
        _SectionHeader(
          icon: Icons.replay_rounded,
          title: context.tr('Reviews due', 'مراجعات مستحقة'),
          actionLabel: context.tr('See all', 'عرض الكل'),
          onAction: () => setState(() => _tab = 3),
        ),
        const SizedBox(height: AimSpacing.componentGap),
        for (final r in dueList.take(3)) ...[
          DueReviewTile(
            name: dueReviewName(r, titles),
            dueAt: r.dueAt,
            severity: r.severity,
            onTap: () => openDueReview(context, ref, r),
          ),
          const SizedBox(height: AimSpacing.componentGap),
        ],
      ],
      SizedBox(height: AimSpacing.space4, child: ColoredBox(color: surfaces.background)),
    ];
  }

  // ── Skills ────────────────────────────────────────────────────────────────

  List<Widget> _skills(Map<String, String> titles) {
    final skills = widget.data.skillStates;
    if (skills.isEmpty) {
      return [
        AIMEmptyState(
          icon: const Icon(Icons.auto_stories_outlined),
          title: context.tr('No skills tracked yet', 'لا توجد مهارات بعد'),
          subtitle: context.tr(
            'Practise a lesson and your skills appear here.',
            'تدرّب على درس لتظهر مهاراتك هنا.',
          ),
        ),
      ];
    }
    return [
      for (final s in skills) ...[
        _SkillRow(
          name: skillName(titles, s.skillId),
          mastery: s.masteryScore,
          trend: s.masteryTrend,
        ),
        const SizedBox(height: AimSpacing.componentGap),
      ],
    ];
  }

  // ── Focus areas ───────────────────────────────────────────────────────────

  List<Widget> _focus(Map<String, String> titles) {
    final all = widget.data.weaknessRecords;
    if (all.isEmpty) {
      return [
        AIMEmptyState(
          icon: const Icon(Icons.flag_outlined),
          title: AppLocalizations.of(context).progressNoWeaknesses,
        ),
      ];
    }
    return [
      for (final w in all) ...[
        _WeaknessRow(
          name: skillName(titles, w.skillId),
          severity: w.severity,
          resolved: w.status.toLowerCase() == 'resolved',
        ),
        const SizedBox(height: AimSpacing.componentGap),
      ],
    ];
  }

  // ── Reviews (due, weak skills only) ───────────────────────────────────────

  List<Widget> _reviews(Map<String, String> titles, AsyncValue<List<DueReview>> due) {
    return due.when(
      loading: () => [const SizedBox(height: 160, child: AIMFullScreenLoading())],
      error: (e, _) => [
        SizedBox(
          height: 260,
          child: AIMFullScreenError(
            message: context.tr('Could not load your reviews.', 'تعذّر تحميل مراجعاتك.'),
            onRetry: () => ref.invalidate(dueReviewsProvider),
          ),
        ),
      ],
      data: (list) {
        if (list.isEmpty) {
          return [
            AIMEmptyState(
              icon: const Icon(Icons.check_circle_outline_rounded),
              title: context.tr('No reviews due', 'لا توجد مراجعات مستحقة'),
              subtitle: context.tr(
                'Reviews appear here for your weak skills when they are due.',
                'تظهر هنا مراجعات مهاراتك الضعيفة عندما يحين موعدها.',
              ),
            ),
          ];
        }
        return [
          Text(
            context.tr(
              'Tap a review to practise that skill.',
              'اضغط على مراجعة لتتدرّب على هذه المهارة.',
            ),
            style: AimTextStyles.bodySm.copyWith(color: aimSurfacesOf(context).textMuted),
          ),
          const SizedBox(height: AimSpacing.componentGap),
          for (final r in list) ...[
            DueReviewTile(
              name: dueReviewName(r, titles),
              dueAt: r.dueAt,
              severity: r.severity,
              onTap: () => openDueReview(context, ref, r),
            ),
            const SizedBox(height: AimSpacing.componentGap),
          ],
        ];
      },
    );
  }
}

// ── Building blocks ──────────────────────────────────────────────────────────

class _TabPill extends StatelessWidget {
  const _TabPill({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final primary = Theme.of(context).colorScheme.primary;
    final fg = selected ? Colors.white : surfaces.textSecondary;
    return Padding(
      padding: const EdgeInsetsDirectional.only(end: 10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: selected ? primary : surfaces.surface,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: selected ? primary : surfaces.border),
            boxShadow: [
              BoxShadow(
                color: primary.withValues(alpha: selected ? 0.28 : 0.06),
                blurRadius: selected ? 12 : 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 18, color: fg),
              const SizedBox(width: 7),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: selected ? FontWeight.bold : FontWeight.w600,
                  color: fg,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Two equal tiles side by side.
class _TileGrid extends StatelessWidget {
  const _TileGrid({required this.tiles});

  final List<Widget> tiles;

  @override
  Widget build(BuildContext context) {
    final scale = MediaQuery.textScalerOf(context).scale(1).clamp(1.0, 2.0);
    return SizedBox(
      height: 76 * scale,
      child: Row(
        children: [
          Expanded(child: tiles[0]),
          const SizedBox(width: AimSpacing.componentGap),
          Expanded(child: tiles[1]),
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({
    required this.icon,
    required this.tone,
    required this.value,
    required this.label,
  });

  final IconData icon;
  final Color tone;
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final dark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsetsDirectional.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Color.alphaBlend(tone.withValues(alpha: dark ? 0.14 : 0.08), surfaces.surface),
        borderRadius: BorderRadius.circular(AimRadius.lg),
        border: Border.all(color: tone.withValues(alpha: dark ? 0.30 : 0.22)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: tone.withValues(alpha: dark ? 0.25 : 0.16),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 22, color: tone),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AimTextStyles.h3.copyWith(
                    color: surfaces.textPrimary,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Text(
                  label,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.icon,
    required this.title,
    required this.actionLabel,
    required this.onAction,
  });

  final IconData icon;
  final String title;
  final String actionLabel;
  final VoidCallback onAction;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    return Row(
      children: [
        Icon(icon, size: 22, color: AimColors.primary500),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AimTextStyles.h3.copyWith(
              color: surfaces.textPrimary,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        TextButton(onPressed: onAction, child: Text(actionLabel)),
      ],
    );
  }
}

/// "Title + subtitle + arrow" row for the four sub-pages, in the same card
/// style as the rest of the app.
class _NavRow extends StatelessWidget {
  const _NavRow({
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
    final dark = Theme.of(context).brightness == Brightness.dark;
    final rtl = Directionality.of(context) == TextDirection.rtl;
    return Semantics(
      button: true,
      label: '$title, $subtitle',
      child: Material(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(AimRadius.lg),
        child: InkWell(
          borderRadius: BorderRadius.circular(AimRadius.lg),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsetsDirectional.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AimRadius.lg),
              border: Border.all(color: surfaces.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AimColors.primary500.withValues(alpha: dark ? 0.22 : 0.12),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, size: 22, color: AimColors.primary500),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AimTextStyles.bodyMd.copyWith(
                          color: surfaces.textPrimary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        subtitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                      ),
                    ],
                  ),
                ),
                Icon(
                  rtl ? Icons.chevron_left_rounded : Icons.chevron_right_rounded,
                  color: surfaces.textMuted,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// One weakness: the skill's real name and how serious it is.
class _WeaknessRow extends StatelessWidget {
  const _WeaknessRow({required this.name, required this.severity, this.resolved = false});

  final String name;
  final String severity;
  final bool resolved;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final sev = severity.toLowerCase();
    final (String label, Color tone) = resolved
        ? (context.tr('Fixed', 'تم الإصلاح'), AimColors.success500)
        : switch (sev) {
            'critical' => (context.tr('Needs focus', 'يحتاج تركيزاً'), AimColors.error500),
            'developing' => (context.tr('Getting there', 'في تحسّن'), const Color(0xFFE08A00)),
            _ => (context.tr('Just spotted', 'اكتُشف للتو'), surfaces.textMuted),
          };
    return Container(
      padding: const EdgeInsetsDirectional.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(AimRadius.lg),
        border: Border.all(color: surfaces.border),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: tone.withValues(alpha: 0.16),
              shape: BoxShape.circle,
            ),
            child: Icon(
              resolved ? Icons.check_rounded : Icons.flag_rounded,
              size: 22,
              color: tone,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              name,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AimTextStyles.bodyMd.copyWith(
                color: surfaces.textPrimary,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: tone.withValues(alpha: 0.14),
              borderRadius: BorderRadius.circular(100),
            ),
            child: Text(
              label,
              style: AimTextStyles.caption.copyWith(color: tone, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

/// One skill with its backend mastery and trend.
class _SkillRow extends StatelessWidget {
  const _SkillRow({required this.name, required this.mastery, required this.trend});

  final String name;
  final double mastery;
  final String trend;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final pct = (mastery * 100).round().clamp(0, 100);
    final t = trend.toLowerCase();
    final trendIcon = t.contains('improv')
        ? Icons.trending_up_rounded
        : t.contains('declin')
            ? Icons.trending_down_rounded
            : Icons.trending_flat_rounded;
    final trendColor = t.contains('improv')
        ? AimColors.success500
        : t.contains('declin')
            ? AimColors.error500
            : surfaces.textMuted;
    return Container(
      padding: const EdgeInsetsDirectional.all(12),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(AimRadius.lg),
        border: Border.all(color: surfaces.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: AimTextStyles.bodyMd.copyWith(
                    color: surfaces.textPrimary,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Icon(trendIcon, size: 20, color: trendColor),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: LinearProgressIndicator(
                    value: (pct < 3 ? 3 : pct) / 100,
                    minHeight: 8,
                    color: AimColors.primary500,
                    backgroundColor: surfaces.surfaceSunken,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                '$pct%',
                textDirection: TextDirection.ltr,
                style: AimTextStyles.bodySm.copyWith(
                  color: surfaces.textPrimary,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// This week's XP per day, from the backend (no invented numbers).
class _WeeklyXp extends StatelessWidget {
  const _WeeklyXp({required this.days});

  final List<HomeWeeklyActivityDay> days;

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final maxXp = days.fold<int>(1, (m, d) => d.xp > m ? d.xp : m);
    const names = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return Container(
      padding: const EdgeInsetsDirectional.all(14),
      decoration: BoxDecoration(
        color: surfaces.surface,
        borderRadius: BorderRadius.circular(AimRadius.lg),
        border: Border.all(color: surfaces.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            context.tr('XP this week', 'نقاط الخبرة هذا الأسبوع'),
            style: AimTextStyles.bodyMd.copyWith(
              color: surfaces.textPrimary,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 90,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                for (var i = 0; i < days.length; i++)
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          days[i].xp > 0 ? '${days[i].xp}' : '',
                          style: AimTextStyles.caption.copyWith(color: surfaces.textMuted, fontSize: 10),
                        ),
                        const SizedBox(height: 2),
                        Container(
                          width: 14,
                          height: 6 + 54 * (days[i].xp / maxXp),
                          decoration: BoxDecoration(
                            color: days[i].xp > 0
                                ? AimColors.primary500
                                : surfaces.surfaceSunken,
                            borderRadius: BorderRadius.circular(5),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          names[i % 7],
                          style: AimTextStyles.caption.copyWith(color: surfaces.textMuted),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
