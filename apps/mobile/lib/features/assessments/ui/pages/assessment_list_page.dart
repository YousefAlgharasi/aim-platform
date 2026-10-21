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
      appBar: AIMTopAppBar(
        title: 'Assessments',
        onBack: () {
          if (context.canPop()) {
            context.pop();
          } else {
            context.go('/main');
          }
        },
        actions: [
          Padding(
            padding: const EdgeInsetsDirectional.only(end: AimSpacing.space8),
            child: Semantics(
              button: true,
              label: 'Deadlines',
              child: TextButton.icon(
                onPressed: () => context.push(AppRoutePaths.assessmentDeadlines),
                icon: const Icon(
                  Icons.calendar_today_outlined,
                  size: AimSizes.iconSm,
                  color: AimColors.primary500,
                ),
                label: Text(
                  'Deadlines',
                  style: AimTextStyles.label.copyWith(
                    color: AimColors.primary500,
                    fontWeight: AimFontWeights.semibold,
                  ),
                ),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: AimSpacing.space8),
                  shape: const RoundedRectangleBorder(
                    borderRadius: AimRadius.borderSm,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: switch (state) {
        AppAsyncLoading() => const AIMFullScreenLoading(
            semanticLabel: 'Loading assessments',
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
        AppAsyncIdle() => const AIMFullScreenLoading(
            semanticLabel: 'Loading assessments',
          ),
      },
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
      return AIMEmptyState(
        icon: const Icon(Icons.quiz_outlined),
        title: AppLocalizations.of(context).assessmentsNoAssessmentsTitle,
        subtitle: AppLocalizations.of(context).assessmentsNoAssessmentsSubtitle,
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
