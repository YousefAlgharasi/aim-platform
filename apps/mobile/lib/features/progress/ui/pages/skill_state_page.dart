// Phase 6 — P6-099
// SkillStatePage — read-only skill state view.
//
// Dedicated page showing all backend-persisted AIM skill states for the
// student. masteryScore, masteryConfidence, masteryTrend, and
// previousMasteryScore are AIM Engine outputs; Flutter displays verbatim.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes mastery. All values from aimResultsProvider.
// - studentId from authContextProvider (JWT-resolved). Never user input.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
//
// RTL/Arabic rules:
// - EdgeInsets.symmetric — RTL-safe.
// - CrossAxisAlignment.start in Column — direction-aware.
// - AIMTopAppBar mirrors RTL back icon internally.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

class SkillStatePage extends ConsumerStatefulWidget {
  const SkillStatePage({super.key});

  @override
  ConsumerState<SkillStatePage> createState() => _SkillStatePageState();
}

class _SkillStatePageState extends ConsumerState<SkillStatePage> {
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
      appBar: const AIMTopAppBar(title: 'Skill States'),
      body: switch (state) {
        AppAsyncLoading() =>
          const AIMFullScreenLoading(semanticLabel: 'Loading skill states'),
        AppAsyncFailure(:final message) =>
          AIMFullScreenError(message: message, onRetry: _load),
        AppAsyncSuccess(:final data) => data.skillStates.isEmpty
            ? const AIMEmptyState(
                icon: Icon(Icons.auto_stories_outlined),
                title: 'No skill data yet',
                subtitle:
                    'Complete lessons and practice to build your skill profile.',
              )
            : _SkillStateList(
                skillStates: data.skillStates, onRefresh: _refresh),
        AppAsyncIdle() =>
          const AIMFullScreenLoading(semanticLabel: 'Loading skill states'),
      },
    );
  }
}

class _SkillStateList extends StatelessWidget {
  const _SkillStateList({
    required this.skillStates,
    required this.onRefresh,
  });

  final List<AimSkillStateModel> skillStates;
  final Future<void> Function() onRefresh;

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        itemCount: skillStates.length,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AimSpacing.listItemGap),
        itemBuilder: (_, i) => _SkillStateDetailCard(model: skillStates[i]),
      ),
    );
  }
}

class _SkillStateDetailCard extends StatelessWidget {
  const _SkillStateDetailCard({required this.model});
  final AimSkillStateModel model;

  AIMBadgeTone get _trendTone => switch (model.masteryTrend) {
        'improving' => AIMBadgeTone.success,
        'declining' => AIMBadgeTone.error,
        'stable' => AIMBadgeTone.neutral,
        _ => AIMBadgeTone.neutral,
      };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final masteryPct = (model.masteryScore * 100).roundToDouble();
    final confidencePct = (model.masteryConfidence * 100).roundToDouble();
    final prevPct = model.previousMasteryScore != null
        ? (model.previousMasteryScore! * 100).roundToDouble()
        : null;

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: '${model.skillId} mastery ${masteryPct.toInt()}%',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  model.skillId,
                  style: AimTextStyles.title
                      .copyWith(color: surfaces.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              AIMBadge(
                tone: _trendTone,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(model.masteryTrend),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.componentGap),
          AIMProgressBar(
            value: masteryPct,
            max: 100,
            showValue: true,
            label: 'Mastery',
            tone: AIMProgressBarTone.primary,
            size: AIMProgressBarSize.lg,
          ),
          const SizedBox(height: AimSpacing.space8),
          AIMProgressBar(
            value: confidencePct,
            max: 100,
            showValue: true,
            label: 'Confidence',
            tone: AIMProgressBarTone.gradient,
          ),
          if (prevPct != null) ...[
            const SizedBox(height: AimSpacing.componentGap),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Previous mastery',
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                ),
                Text(
                  '${prevPct.toInt()}%',
                  style: AimTextStyles.label
                      .copyWith(color: surfaces.textSecondary),
                ),
              ],
            ),
          ],
          const SizedBox(height: AimSpacing.space4),
          Text(
            'Last evaluated: ${model.lastEvaluatedAt}',
            style:
                AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
        ],
      ),
    );
  }
}
