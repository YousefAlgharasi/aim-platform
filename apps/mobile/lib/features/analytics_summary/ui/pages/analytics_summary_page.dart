// Phase 15 — P15-072
// AnalyticsSummaryPage — read-only student analytics summary view.
//
// Design ref: docs/design/ui-for-all-system-mobile/SCREENS.md → "Analytics" (38)
//   docs/design/ui-for-all-system-mobile/screenshots/light/38-screen.png
//   docs/design/ui-for-all-system-mobile/screenshots/dark/38-screen.png
// Endpoint: GET /student/analytics/summary
//
// Lists backend-approved report definitions visible to the authenticated
// student. Flutter never computes report content, mastery, or progress
// figures — these are backend outputs surfaced verbatim.
//
// TASK-25: restyled to match design screen 38 — gradient header (back +
// "Analytics") and cards with title, soft category pill, and description.
//
// Deviations from the mockup (real-data-only rules):
// - The design's "Generated Jun 24, 2026" caption is OMITTED. This endpoint
//   returns report DEFINITIONS (via ReportDefinitionService.listVisibleToRole),
//   not report RUNS — there is no generated-at timestamp in the response, and
//   a definition's own createdAt would be semantically wrong (definition
//   creation ≠ report generation). Never fabricated.
// - The design's fictional Progress/Skills/Habits pills map to the backend's
//   real ReportCategory values ('learning', 'assessment', …). The real value
//   is shown title-cased in a neutral soft badge — a fixed color map keyed to
//   fictional categories would be meaningless.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes report content. All values from
//   analyticsSummaryProvider.
// - bearerToken from authFlowProvider. Never user input.
// - No AIM Engine, AI Teacher, or AI provider calls from Flutter.
//
// RTL/Arabic rules:
// - EdgeInsets.symmetric / EdgeInsetsDirectional — RTL-safe.
// - CrossAxisAlignment.start in Column — direction-aware.
// - Header back icon is a directional Icons.arrow_back (auto-mirrors in RTL).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/analytics_summary/data/models/analytics_summary_report_model.dart';
import 'package:aim_mobile/features/analytics_summary/logic/provider/analytics_summary_provider.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';

class AnalyticsSummaryPage extends ConsumerStatefulWidget {
  const AnalyticsSummaryPage({super.key});

  @override
  ConsumerState<AnalyticsSummaryPage> createState() =>
      _AnalyticsSummaryPageState();
}

class _AnalyticsSummaryPageState extends ConsumerState<AnalyticsSummaryPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final authFlow = ref.read(authFlowProvider);
    final token = authFlow.accessToken;
    if (token == null || token.isEmpty) return;

    ref.read(analyticsSummaryProvider.notifier).load(bearerToken: token);
  }

  Future<void> _refresh() async {
    final authFlow = ref.read(authFlowProvider);
    final token = authFlow.accessToken;
    if (token == null || token.isEmpty) return;

    await ref.read(analyticsSummaryProvider.notifier).refresh(
          bearerToken: token,
        );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(analyticsSummaryProvider);

    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _AnalyticsHeader(),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading analytics summary'),
              AppAsyncFailure(:final message) =>
                AIMFullScreenError(message: message, onRetry: _load),
              AppAsyncSuccess(:final data) => data.isEmpty
                  ? const AIMEmptyState(
                      icon: Icon(Icons.insights_outlined),
                      title: 'No reports available',
                      subtitle: 'There are no analytics reports for you yet.',
                    )
                  : _ReportList(reports: data, onRefresh: _refresh),
              AppAsyncIdle() => const AIMFullScreenLoading(
                  semanticLabel: 'Loading analytics summary'),
            },
          ),
        ],
      ),
    );
  }
}

// ── Gradient header ─────────────────────────────────────────────────────────

/// Hero header mirroring [DeadlinesPage]'s back-button/title pattern
/// (design screen 38's top bar).
class _AnalyticsHeader extends StatelessWidget {
  const _AnalyticsHeader();

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
                  child: const Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
                    child: Icon(
                      Icons.arrow_back,
                      size: AimSizes.iconMd,
                      color: AimColors.neutral0,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: AimSpacing.space12),
            Expanded(
              child: Text(
                'Analytics',
                style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReportList extends StatelessWidget {
  const _ReportList({
    required this.reports,
    required this.onRefresh,
  });

  final List<AnalyticsSummaryReportModel> reports;
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
        itemCount: reports.length,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AimSpacing.listItemGap),
        itemBuilder: (_, i) => _ReportCard(model: reports[i]),
      ),
    );
  }
}

class _ReportCard extends StatelessWidget {
  const _ReportCard({required this.model});
  final AnalyticsSummaryReportModel model;

  /// Display-only first-letter capitalisation of the REAL backend category
  /// value (e.g. 'learning' → 'Learning'). Mirrors achievements_page.dart's
  /// `_titleCase`; the underlying value is never altered or remapped.
  String _titleCase(String value) {
    if (value.isEmpty) return value;
    return value[0].toUpperCase() + value.substring(1);
  }

  @override
  Widget build(BuildContext context) {
    final surfaces = aimSurfacesOf(context);

    return AIMCard(
      variant: AIMCardVariant.elevated,
      semanticLabel: '${model.name} report',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  model.name,
                  style: AimTextStyles.title
                      .copyWith(color: surfaces.textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              AIMBadge(
                tone: AIMBadgeTone.neutral,
                variant: AIMBadgeVariant.soft,
                pill: true,
                child: Text(_titleCase(model.category)),
              ),
            ],
          ),
          if (model.description != null) ...[
            const SizedBox(height: AimSpacing.componentGap),
            Text(
              model.description!,
              style:
                  AimTextStyles.bodySm.copyWith(color: surfaces.textSecondary),
            ),
          ],
        ],
      ),
    );
  }
}
