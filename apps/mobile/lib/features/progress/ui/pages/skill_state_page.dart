// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Skill states"
//   docs/design/ui-for-all-system-mobile/screenshots/light/12-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/12-screen.png
// Endpoint: GET /aim/students/:id/skill-states
// Widgets: AIMTopAppBar, AIMCard, AIMBadge, AIMProgressBar, AIMEmptyState,
//   AIMFullScreenLoading, AIMFullScreenError
//
// Phase 6 — P6-099
// SkillStatePage — read-only skill state view.
//
// Dedicated page showing all backend-persisted AIM skill states for the
// student. masteryScore, masteryConfidence, masteryTrend, and
// previousMasteryScore are AIM Engine outputs; Flutter displays verbatim.
//
// The per-skill card's "tier" badge (Strong / Developing / Needs work) is a
// UI-only bucketing of masteryScore for display purposes — it is NOT the
// same as masteryTrend (which is the AIM Engine's own directional signal and
// is shown separately, verbatim, as the inline trend indicator). Thresholds:
// >=0.8 Strong, >=0.5 Developing, else Needs work.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes mastery. All values from aimResultsProvider.
// - studentId from authContextProvider (JWT-resolved). Never user input.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
//
// RTL/Arabic rules:
// - EdgeInsets.symmetric — RTL-safe.
// - CrossAxisAlignment.start in Column — direction-aware.
// - Header back icon swaps chevron_left_rounded/chevron_right_rounded based
//   on Directionality.of(context).
//
// TASK (full-screen audit): restyled the header to match design screen 12 —
// gradient hero header ("Skill States") with a back button. Was previously
// a flat AIMTopAppBar with no onBack wired, so no back button rendered at
// all (a broken navigation affordance, not just a color mismatch).

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
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _SkillStateHeader(),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading skill states'),
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
              AppAsyncIdle() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading skill states'),
            },
          ),
        ],
      ),
    );
  }
}

class _SkillStateHeader extends StatelessWidget {
  const _SkillStateHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsetsDirectional.fromSTEB(
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
        AimSpacing.screenPaddingMobile,
        AimSpacing.space16,
      ),
      decoration: const BoxDecoration(gradient: AimGradients.gzHero),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            Semantics(
              button: true,
              label: 'Back',
              child: InkWell(
                onTap: () => Navigator.of(context).maybePop(),
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Directionality.of(context) == TextDirection.rtl
                          ? Icons.chevron_right_rounded
                          : Icons.chevron_left_rounded,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Text(
              'Skill States',
              style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
            ),
          ],
        ),
      ),
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

/// UI-only mastery tier bucketing for the tier badge. NOT the same signal as
/// [AimSkillStateModel.masteryTrend] (which is the AIM Engine's own
/// directional trend, shown separately/verbatim as the trend indicator).
enum _SkillMasteryTier { strong, developing, needsWork }

/// Buckets a real, backend-computed masteryScore (0.0–1.0) into a display
/// tier. Thresholds chosen to match the design mock: >=0.8 Strong,
/// >=0.5 Developing, else Needs work. Flutter never computes masteryScore
/// itself — this only labels an already-computed value for display.
_SkillMasteryTier _tierOf(double masteryScore) {
  if (masteryScore >= 0.8) return _SkillMasteryTier.strong;
  if (masteryScore >= 0.5) return _SkillMasteryTier.developing;
  return _SkillMasteryTier.needsWork;
}

/// Converts a raw, machine-oriented `skillId` slug (e.g.
/// `"skill:arabic:p1:vocab"` or `"past_simple"`) into a readable label by
/// taking the last colon-delimited segment, replacing underscores/hyphens
/// with spaces, and title-casing each word. This is a real-data display
/// transform, not a fabricated name — it won't always match a curated
/// display name (e.g. it can't know "vocab" should render as "Vocabulary"),
/// and that's expected/acceptable since the backend has no reliable
/// slug-to-display-name mapping available to students.
String _prettifySkillId(String skillId) {
  final lastSegment = skillId.split(':').last;
  final words = lastSegment
      .split(RegExp(r'[_\-]+'))
      .where((w) => w.isNotEmpty)
      .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase());
  final label = words.join(' ');
  return label.isEmpty ? skillId : label;
}

class _SkillStateDetailCard extends StatelessWidget {
  const _SkillStateDetailCard({required this.model});
  final AimSkillStateModel model;

  ({AIMBadgeTone tone, AIMProgressBarTone barTone, String label}) get _tier {
    return switch (_tierOf(model.masteryScore)) {
      _SkillMasteryTier.strong => (
          tone: AIMBadgeTone.success,
          barTone: AIMProgressBarTone.success,
          label: 'Strong',
        ),
      _SkillMasteryTier.developing => (
          tone: AIMBadgeTone.primary,
          barTone: AIMProgressBarTone.primary,
          label: 'Developing',
        ),
      _SkillMasteryTier.needsWork => (
          tone: AIMBadgeTone.warning,
          barTone: AIMProgressBarTone.warning,
          label: 'Needs work',
        ),
    };
  }

  ({IconData icon, Color color, String label}) _trendDisplay(
    AimSurfaceTheme surfaces,
  ) {
    return switch (model.masteryTrend) {
      'improving' => (
          icon: Icons.trending_up,
          color: AimColors.success500,
          label: 'Improving',
        ),
      'declining' => (
          icon: Icons.trending_down,
          color: AimColors.error500,
          label: 'Declining',
        ),
      'stable' => (
          icon: Icons.trending_flat,
          color: surfaces.textSecondary,
          label: 'Stable',
        ),
      _ => (
          icon: Icons.trending_flat,
          color: surfaces.textSecondary,
          label: 'Insufficient data',
        ),
    };
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);
    final masteryPct = (model.masteryScore * 100).round();
    final confidencePct = (model.masteryConfidence * 100).round();
    final prevPct = model.previousMasteryScore != null
        ? (model.previousMasteryScore! * 100).round()
        : null;
    final tier = _tier;
    final trend = _trendDisplay(surfaces);
    final title = _prettifySkillId(model.skillId);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: '$title mastery $masteryPct%, ${tier.label}',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: AimTextStyles.title
                      .copyWith(color: surfaces.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              AIMBadge(
                tone: tier.tone,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(tier.label),
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.componentGap),
          AIMProgressBar(
            value: masteryPct.toDouble(),
            max: 100,
            tone: tier.barTone,
            size: AIMProgressBarSize.lg,
          ),
          const SizedBox(height: AimSpacing.space8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text.rich(
                TextSpan(
                  style: AimTextStyles.bodySm
                      .copyWith(color: surfaces.textSecondary),
                  children: [
                    const TextSpan(text: 'Mastery '),
                    TextSpan(
                      text: '$masteryPct',
                      style: AimTextStyles.label
                          .copyWith(color: surfaces.textPrimary),
                    ),
                    if (prevPct != null) TextSpan(text: ' · was $prevPct'),
                  ],
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(trend.icon, size: AimSizes.iconSm, color: trend.color),
                  const SizedBox(width: AimSpacing.space4),
                  Text(
                    trend.label,
                    style:
                        AimTextStyles.label.copyWith(color: trend.color),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AimSpacing.space4),
          Text(
            'Confidence $confidencePct%',
            style:
                AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
          ),
          // lastEvaluatedAt intentionally dropped from this redesign: the
          // screenshot's card layout (docs/design/.../12-screen.png) has no
          // room/slot for it and does not show it. Real data (model itself
          // still carries lastEvaluatedAt) is simply not rendered here.
        ],
      ),
    );
  }
}
