// What a due review does when it is tapped, and what it is called.
//
// A due review is for a weak skill. Tapping it practises that skill: it opens
// the practice session of a lesson that teaches it (the backend picks the
// lesson). If the skill has no lesson yet it opens Courses to choose one.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/app_route_paths.dart';
import '../../learner_tools/data/learner_tools_api.dart';
import '../../shell/logic/main_shell_tab_provider.dart';

/// The readable name: the catalogue title from the backend, else the titles
/// map, else a tidied key.
String dueReviewName(DueReview review, Map<String, String> titles) {
  final t = review.skillTitle?.trim();
  if (t != null && t.isNotEmpty) return t;
  return skillName(titles, review.skillId);
}

/// Opens the right place for [review] and, when the student comes back from
/// practising, re-reads what is due.
Future<void> openDueReview(BuildContext context, WidgetRef ref, DueReview review) async {
  final lessonId = review.lessonId;
  if (lessonId == null || lessonId.isEmpty) {
    ref.read(mainShellTabIndexProvider.notifier).state = 1;
    context.go(AppRoutePaths.mainShell);
    return;
  }
  await context.push(
    AppRoutePaths.practiceSession,
    extra: {'lessonId': lessonId, 'lessonTitle': review.lessonTitle ?? ''},
  );
  // Progress changed: what is still due may have changed too.
  if (context.mounted) ref.invalidate(dueReviewsProvider);
}
