// Phase 6 — P6-098
// ProgressPage — Student progress summary screen MVP.
//
// Renders four backend-sourced AIM sections via [aimResultsProvider]:
//   1. Skill states     — AIM mastery scores per skill
//   2. Weaknesses       — AIM weakness records
//   3. Recommendations  — AIM-generated recommendation cards
//   4. Review schedule  — AIM-computed due dates
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes mastery, weakness, difficulty, or any AIM value.
// - All displayed values come from the backend verbatim via aimResultsProvider.
// - studentId sourced from authContextProvider (JWT-resolved).
// - Bearer token from authFlowProvider; never stored here.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
//
// RTL/Arabic rules:
// - EdgeInsets.symmetric — RTL-safe.
// - AIMTopAppBar mirrors RTL icon.
// - Wrap for weakness chips — mirrors in RTL.
// - CrossAxisAlignment.start in Column — direction-aware.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/logic/entity/aim_results_data.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import '../widgets/progress_widgets.dart';

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

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'Progress'),
      body: switch (state) {
        AppAsyncLoading() =>
          const AIMFullScreenLoading(semanticLabel: 'Loading progress data'),
        AppAsyncFailure(:final message) =>
          AIMFullScreenError(message: message, onRetry: _load),
        AppAsyncSuccess(:final data) =>
          _ProgressContent(data: data, onRefresh: _refresh),
        AppAsyncIdle() =>
          const AIMFullScreenLoading(semanticLabel: 'Loading progress data'),
      },
    );
  }
}

class _ProgressContent extends StatelessWidget {
  const _ProgressContent({required this.data, required this.onRefresh});

  final AimResultsData data;
  final Future<void> Function() onRefresh;

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
          if (data.skillStates.isNotEmpty) ...[
            const ProgressSectionHeader(title: 'Skill Mastery'),
            const SizedBox(height: AimSpacing.componentGap),
            ...data.skillStates.map(
              (m) => Padding(
                padding:
                    const EdgeInsets.only(bottom: AimSpacing.listItemGap),
                child: ProgressSkillStateCard(model: m),
              ),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.weaknessRecords.isNotEmpty) ...[
            const ProgressSectionHeader(title: 'Focus Areas'),
            const SizedBox(height: AimSpacing.componentGap),
            Wrap(
              spacing: AimSpacing.space8,
              runSpacing: AimSpacing.space8,
              children: data.weaknessRecords
                  .map((m) => ProgressWeaknessChip(model: m))
                  .toList(),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.recommendations.isNotEmpty) ...[
            const ProgressSectionHeader(title: 'AIM Recommendations'),
            const SizedBox(height: AimSpacing.componentGap),
            ...data.recommendations.map(
              (m) => Padding(
                padding:
                    const EdgeInsets.only(bottom: AimSpacing.listItemGap),
                child: ProgressRecommendationCard(model: m),
              ),
            ),
            const SizedBox(height: AimSpacing.sectionGap),
          ],
          if (data.reviewSchedules.isNotEmpty) ...[
            const ProgressSectionHeader(title: 'Review Schedule'),
            const SizedBox(height: AimSpacing.componentGap),
            ...data.reviewSchedules.map(
              (m) => Padding(
                padding:
                    const EdgeInsets.only(bottom: AimSpacing.listItemGap),
                child: ProgressReviewScheduleCard(model: m),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
