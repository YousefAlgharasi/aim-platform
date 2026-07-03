// Phase 6 — P6-100
// WeaknessSummaryPage — read-only weakness summary view.
//
// Displays all backend-persisted AIM weakness records for the student.
// severity, status, and triggerAttemptIds are AIM Engine outputs.
// Flutter displays them verbatim; never derives or computes weakness locally.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes weakness. All values from aimResultsProvider.
// - studentId from authContextProvider (JWT-resolved). Never user input.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
//
// RTL/Arabic rules:
// - EdgeInsets.symmetric — RTL-safe.
// - AIMTopAppBar mirrors back icon.
// - CrossAxisAlignment.start — direction-aware.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_context_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class WeaknessSummaryPage extends ConsumerStatefulWidget {
  const WeaknessSummaryPage({super.key});

  @override
  ConsumerState<WeaknessSummaryPage> createState() =>
      _WeaknessSummaryPageState();
}

class _WeaknessSummaryPageState extends ConsumerState<WeaknessSummaryPage> {
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
      appBar: AIMTopAppBar(title: l10n.commonFocusAreas),
      body: switch (state) {
        AppAsyncLoading() => AIMFullScreenLoading(
            semanticLabel: l10n.progressWeaknessLoadingSemantic),
        AppAsyncFailure(:final message) =>
          AIMFullScreenError(message: message, onRetry: _load),
        AppAsyncSuccess(:final data) => data.weaknessRecords.isEmpty
            ? AIMEmptyState(
                icon: const Icon(Icons.check_circle_outline),
                title: l10n.progressNoFocusAreasTitle,
                subtitle: l10n.progressNoFocusAreasSubtitle,
              )
            : _WeaknessList(
                weaknessRecords: data.weaknessRecords, onRefresh: _refresh),
        AppAsyncIdle() => AIMFullScreenLoading(
            semanticLabel: l10n.progressWeaknessLoadingSemantic),
      },
    );
  }
}

class _WeaknessList extends StatelessWidget {
  const _WeaknessList({
    required this.weaknessRecords,
    required this.onRefresh,
  });

  final List<AimWeaknessRecordModel> weaknessRecords;
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
        itemCount: weaknessRecords.length,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AimSpacing.listItemGap),
        itemBuilder: (_, i) =>
            _WeaknessDetailCard(model: weaknessRecords[i]),
      ),
    );
  }
}

class _WeaknessDetailCard extends StatelessWidget {
  const _WeaknessDetailCard({required this.model});
  final AimWeaknessRecordModel model;

  AIMBadgeTone get _severityTone => switch (model.severity.toLowerCase()) {
        'high' => AIMBadgeTone.error,
        'medium' => AIMBadgeTone.warning,
        _ => AIMBadgeTone.neutral,
      };

  AIMBadgeTone get _statusTone => switch (model.status.toLowerCase()) {
        'open' => AIMBadgeTone.error,
        'improving' => AIMBadgeTone.warning,
        'resolved' => AIMBadgeTone.success,
        _ => AIMBadgeTone.neutral,
      };

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    final l10n = AppLocalizations.of(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: l10n.progressWeaknessDetailSemantic(
        model.skillId,
        model.severity,
        model.status,
      ),
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
                tone: _severityTone,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(model.severity),
              ),
              const SizedBox(width: AimSpacing.space8),
              AIMBadge(
                tone: _statusTone,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(model.status),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.componentGap),
          Text(
            l10n.progressDetectedLabel(model.detectedAt),
            style: AimTextStyles.bodySm
                .copyWith(color: surfaces.textSecondary),
          ),
          if (model.resolvedAt != null) ...[
            const SizedBox(height: AimSpacing.space2),
            Text(
              l10n.progressResolvedLabel(model.resolvedAt!),
              style: AimTextStyles.bodySm
                  .copyWith(color: surfaces.textSecondary),
            ),
          ],
        ],
      ),
    );
  }
}
