// ReviewPage — the reviews that are due now, for weak skills only.
//
// A main screen in the app frame. Tapping a review opens the practice for
// that skill. What is due and what counts as weak come from the backend.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/localization/inline_tr.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/reviews/ui/widgets/due_reviews_view.dart';

class ReviewPage extends StatelessWidget {
  const ReviewPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
          Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(20, 16, 20, 8),
            child: PageTitleBar(
              title: context.tr('Review', 'المراجعة'),
              subtitle: context.tr(
                'Weak skills that are due to practise',
                'المهارات الضعيفة التي حان وقت التدرّب عليها',
              ),
            ),
          ),
          const Expanded(child: DueReviewsView()),
          ],
        ),
      ),
    );
  }
}
