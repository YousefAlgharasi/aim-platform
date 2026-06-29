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
import 'package:aim_mobile/features/shell/logic/main_shell_tab_provider.dart';
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

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(homeProvider);

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'Home'),
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
    const SizedBox(height: AimSpacing.sectionGap),
    Icon(
      Icons.school_outlined,
      size: 64,
      color: surfaces.textMuted,
    ),
    const SizedBox(height: AimSpacing.componentGap),
    Text(
      'Welcome to AIM',
      style: AimTextStyles.h2.copyWith(color: surfaces.textPrimary),
      textAlign: TextAlign.center,
    ),
    const SizedBox(height: AimSpacing.space8),
    Text(
      'Get started by taking a placement test or browsing courses.',
      style: AimTextStyles.bodyMd.copyWith(color: surfaces.textSecondary),
      textAlign: TextAlign.center,
    ),
    const SizedBox(height: AimSpacing.sectionGap),
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
