// P10-054: AssessmentListPage — displays available quizzes/exams.
// All data is backend-supplied; Flutter never computes deadline status.
//
// TASK-21: restyled to match design screen 24 — gradient header (back +
// "Assessments" + a "Deadlines" link to the existing deadlines route).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
import 'package:aim_mobile/features/assessments/logic/entity/assessment_entities.dart';
import 'package:aim_mobile/features/assessments/logic/provider/assessment_provider.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';
import '../widgets/assessment_widgets.dart';

class AssessmentListPage extends ConsumerStatefulWidget {
  const AssessmentListPage({super.key});

  @override
  ConsumerState<AssessmentListPage> createState() => _AssessmentListPageState();
}

class _AssessmentListPageState extends ConsumerState<AssessmentListPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  void _load() {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    ref.read(assessmentListProvider.notifier).load(bearerToken: token);
  }

  Future<void> _refresh() async {
    final token = ref.read(authFlowProvider).accessToken;
    if (token == null || token.isEmpty) return;
    await ref.read(assessmentListProvider.notifier).refresh(bearerToken: token);
  }

  void _onAssessmentTap(AssessmentListItem item) {
    context.push(
      '/student/assessments/detail',
      extra: {'assessmentId': item.id, 'assessmentTitle': item.title},
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(assessmentListProvider);
    final surfaces = aimSurfacesOf(context);

    return Scaffold(
      backgroundColor: surfaces.background,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const _AssessmentListHeader(),
          Expanded(
            child: switch (state) {
              AppAsyncLoading() => AIMFullScreenLoading(
                  semanticLabel: AppLocalizations.of(context).assessmentsLoadingListSemantic,
                ),
              AppAsyncFailure(:final message) => AIMFullScreenError(
                  message: message,
                  onRetry: _load,
                ),
              AppAsyncSuccess(:final data) => _AssessmentListContent(
                  items: data,
                  onRefresh: _refresh,
                  onTap: _onAssessmentTap,
                ),
              AppAsyncIdle() => AIMFullScreenLoading(
                  semanticLabel: AppLocalizations.of(context).assessmentsLoadingListSemantic,
                ),
            },
          ),
        ],
      ),
    );
  }
}

// ── Gradient header ─────────────────────────────────────────────────────────

/// Hero header mirroring [DeadlinesPage]'s back-button/title pattern (design
/// screen 24's top bar), plus a "Deadlines" link to the existing deadlines
/// route.
class _AssessmentListHeader extends StatelessWidget {
  const _AssessmentListHeader();

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
              label: AppLocalizations.of(context).commonBack,
              child: InkWell(
                onTap: () {
                  if (context.canPop()) context.pop();
                },
                customBorder: const CircleBorder(),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AimColors.neutral0.withValues(alpha: 0.18),
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(AimSpacing.space12),
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
            Expanded(
              child: Text(
                AppLocalizations.of(context).assessmentsListTitle,
                style: AimTextStyles.h3.copyWith(color: AimColors.neutral0),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Semantics(
              button: true,
              label: AppLocalizations.of(context).assessmentsDeadlinesTitle,
              child: InkWell(
                onTap: () => context.push(AppRoutePaths.assessmentDeadlines),
                borderRadius: AimRadius.borderSm,
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AimSpacing.space8,
                    vertical: AimSpacing.space4,
                  ),
                  child: Text(
                    AppLocalizations.of(context).assessmentsDeadlinesTitle,
                    style: AimTextStyles.label.copyWith(
                      color: AimColors.neutral0,
                      fontWeight: AimFontWeights.semibold,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AssessmentListContent extends StatelessWidget {
  const _AssessmentListContent({
    required this.items,
    required this.onRefresh,
    required this.onTap,
  });

  final List<AssessmentListItem> items;
  final Future<void> Function() onRefresh;
  final void Function(AssessmentListItem) onTap;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      final loc = AppLocalizations.of(context);
      return AIMEmptyState(
        icon: const Icon(Icons.quiz_outlined),
        title: loc.assessmentsEmptyTitle,
        subtitle: loc.assessmentsEmptySubtitle,
      );
    }

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(
          horizontal: AimSpacing.screenPaddingMobile,
          vertical: AimSpacing.sectionGap,
        ),
        itemCount: items.length,
        separatorBuilder: (_, __) =>
            const SizedBox(height: AimSpacing.listItemGap),
        itemBuilder: (context, index) {
          final item = items[index];
          return AssessmentListTile(
            item: item,
            onTap: () => onTap(item),
          );
        },
      ),
    );
  }
}
