// Phase 6 — P6-101
// RecommendationsPage — dedicated read-only view for backend-approved AIM
// recommendations.
//
// All recommendation data (kind, rank, reason, targetSkillId) is AIM Engine
// output persisted by the backend. Flutter displays verbatim; never
// re-ranks, filters, or generates recommendations locally.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes or mutates recommendations.
// - All values come from backend via aimResultsProvider.
// - studentId sourced from authContextProvider (JWT-resolved).
// - Bearer token from authFlowProvider; never stored locally.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
//
// RTL/Arabic rules:
// - EdgeInsets.symmetric — RTL-safe.
// - CrossAxisAlignment.start in Column — direction-aware.
// - AIMTopAppBar mirrors RTL back icon internally.
// - Icons.arrow_forward_ios uses Directionality-aware mirroring via IconTheme.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class RecommendationsPage extends ConsumerStatefulWidget {
  const RecommendationsPage({super.key});

  @override
  ConsumerState<RecommendationsPage> createState() =>
      _RecommendationsPageState();
}

class _RecommendationsPageState extends ConsumerState<RecommendationsPage> {
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
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AIMTopAppBar(title: l10n.progressRecommendationsNavTitle),
      body: switch (state) {
        AppAsyncLoading() => AIMFullScreenLoading(
            semanticLabel: l10n.progressRecommendationsLoadingSemantic),
        AppAsyncFailure(:final message) =>
          AIMFullScreenError(message: message, onRetry: _load),
        AppAsyncSuccess(:final data) => data.recommendations.isEmpty
            ? AIMEmptyState(
                icon: const Icon(Icons.auto_awesome_outlined),
                title: l10n.progressNoRecommendationsTitle,
                subtitle: l10n.progressNoRecommendationsSubtitle,
              )
            : _RecommendationsList(
                recommendations: data.recommendations,
                onRefresh: _refresh,
              ),
        AppAsyncIdle() => AIMFullScreenLoading(
            semanticLabel: l10n.progressRecommendationsLoadingSemantic),
      },
    );
  }
}

class _RecommendationsList extends StatelessWidget {
  const _RecommendationsList({
    required this.recommendations,
    required this.onRefresh,
  });

  final List<AimRecommendationModel> recommendations;
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
        itemCount: recommendations.length,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AimSpacing.listItemGap),
        itemBuilder: (_, i) =>
            _RecommendationDetailCard(model: recommendations[i]),
      ),
    );
  }
}

class _RecommendationDetailCard extends StatelessWidget {
  const _RecommendationDetailCard({required this.model});
  final AimRecommendationModel model;

  AIMBadgeTone get _kindTone => switch (model.kind) {
        'lesson' => AIMBadgeTone.primary,
        'targeted_practice' => AIMBadgeTone.warning,
        'review_session' => AIMBadgeTone.neutral,
        _ => AIMBadgeTone.neutral,
      };

  AIMBadgeTone get _statusTone => switch (model.status) {
        'active' => AIMBadgeTone.success,
        'expired' => AIMBadgeTone.error,
        'dismissed' => AIMBadgeTone.neutral,
        _ => AIMBadgeTone.neutral,
      };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final l10n = AppLocalizations.of(context);

    return AIMCard(
      variant: AIMCardVariant.ai,
      semanticLabel: l10n.progressRecommendationRankSemantic(
        model.rank,
        model.kind,
        model.targetSkillId,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.auto_awesome_outlined,
                size: AimSizes.iconSm,
                color: AimColors.primary400,
              ),
              const SizedBox(width: AimSpacing.space4),
              Expanded(
                child: Text(
                  model.targetSkillId,
                  style: AimTextStyles.label
                      .copyWith(color: AimColors.primary500),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              AIMBadge(
                tone: AIMBadgeTone.neutral,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(l10n.progressRankBadge(model.rank)),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space8),
          Row(
            children: [
              AIMBadge(
                tone: _kindTone,
                variant: AIMBadgeVariant.soft,
                child: Text(model.kind.replaceAll('_', ' ')),
              ),
              const SizedBox(width: AimSpacing.space8),
              AIMBadge(
                tone: _statusTone,
                variant: AIMBadgeVariant.soft,
                child: Text(model.status),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.componentGap),
          Text(
            model.reason,
            style: AimTextStyles.bodySm.copyWith(color: surfaces.textPrimary),
          ),
          if (model.targetLessonId != null) ...[
            const SizedBox(height: AimSpacing.space8),
            Text(
              l10n.progressLessonLabel(model.targetLessonId!),
              style:
                  AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            ),
          ],
          if (model.expiresAt != null) ...[
            const SizedBox(height: AimSpacing.space4),
            Text(
              l10n.progressExpiresLabel(model.expiresAt!),
              style:
                  AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            ),
          ],
          const SizedBox(height: AimSpacing.space4),
          Text(
            l10n.progressGeneratedLabel(model.generatedAt),
            style:
                AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
        ],
      ),
    );
  }
}
