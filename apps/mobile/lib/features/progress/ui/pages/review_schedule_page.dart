// ReviewSchedulePage — the reviews that are due now, for weak skills only.
//
// Reached from the Progress hub's "Review Schedule" row. It lists only the
// reviews that are due for skills the student is weak at (the backend decides
// what is due and what is weak); tapping one opens the practice for that skill.

import 'package:flutter/material.dart';

import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/reviews/ui/widgets/due_reviews_view.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

class ReviewSchedulePage extends StatelessWidget {
  const ReviewSchedulePage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
          // On menu and detail screens the app frame's top bar shows this title.
          Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(20, 8, 20, 0),
            child: PageTitleBar(title: l10n.reviewScheduleTitle),
          ),
          const Expanded(child: DueReviewsView()),
          ],
        ),
      ),
    );
  }
}
