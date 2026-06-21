// Phase 15 — P15-072
// AnalyticsSummaryPage — read-only student analytics summary view.
//
// Lists backend-approved report definitions visible to the authenticated
// student. Flutter never computes report content, mastery, or progress
// figures — these are backend outputs surfaced verbatim.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes report content. All values from
//   analyticsSummaryProvider.
// - bearerToken from authFlowProvider. Never user input.
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

    return Scaffold(
      appBar: const AIMTopAppBar(title: 'Analytics Summary'),
      body: switch (state) {
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
                child: Text(model.category),
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
