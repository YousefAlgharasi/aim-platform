// The list of reviews that are due now, for the student's weak skills only.
// Each row opens the practice for that skill. Used by the Review screens.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/localization/inline_tr.dart';
import '../../../../core/widgets/widgets.dart';
import '../../../learner_tools/data/learner_tools_api.dart';
import '../due_review_actions.dart';
import 'due_review_tile.dart';

class DueReviewsView extends ConsumerWidget {
  const DueReviewsView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final due = ref.watch(dueReviewsProvider);
    final titles = ref.watch(skillTitlesProvider).valueOrNull ?? const <String, String>{};
    final surfaces = aimSurfacesOf(context);

    return due.when(
      loading: () => AIMFullScreenLoading(
        semanticLabel: context.tr('Loading reviews', 'جارٍ تحميل المراجعات'),
      ),
      error: (_, __) => AIMFullScreenError(
        message: context.tr('Could not load your reviews.', 'تعذّر تحميل مراجعاتك.'),
        onRetry: () => ref.invalidate(dueReviewsProvider),
      ),
      data: (list) => RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(dueReviewsProvider);
          await ref.read(dueReviewsProvider.future);
        },
        child: list.isEmpty
            ? ListView(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 72),
                children: [
                  AIMEmptyState(
                    icon: const Icon(Icons.check_circle_outline_rounded),
                    title: context.tr('No reviews due', 'لا توجد مراجعات مستحقة'),
                    subtitle: context.tr(
                      'Reviews appear here for your weak skills when they are due.',
                      'تظهر هنا مراجعات مهاراتك الضعيفة عندما يحين موعدها.',
                    ),
                  ),
                ],
              )
            : ListView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 72),
                children: [
                  Text(
                    fill(
                      context.tr('{n} to review. Tap one to practise it.',
                          '{n} للمراجعة. اضغط على واحدة لتتدرّب عليها.'),
                      {'n': list.length},
                    ),
                    style: AimTextStyles.bodySm.copyWith(color: surfaces.textMuted),
                  ),
                  const SizedBox(height: AimSpacing.componentGap),
                  for (final r in list) ...[
                    DueReviewTile(
                      name: dueReviewName(r, titles),
                      dueAt: r.dueAt,
                      severity: r.severity,
                      onTap: () => openDueReview(context, ref, r),
                    ),
                    const SizedBox(height: AimSpacing.componentGap),
                  ],
                ],
              ),
      ),
    );
  }
}
