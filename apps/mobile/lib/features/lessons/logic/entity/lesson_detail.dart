// Phase 6 — P6-076
// LessonDetail — aggregate domain entity: lesson summary + its published assets.
//
// Combines the LessonSummary (id, chapterId, title, description, status,
// sortOrder) with the list of published LessonAsset content items.
//
// Flutter never computes status, sortOrder, or asset ordering.
// All values are backend-supplied verbatim.

import 'package:aim_mobile/features/lessons/logic/entity/lesson.dart';
import 'lesson_asset.dart';

/// Aggregate entity for the lesson detail screen.
///
/// [lesson] is the LessonSummary from GET /curriculum/lessons/:id.
/// [assets] is the list of published assets from
/// GET /curriculum/lesson-assets?lessonId=:id&status=published.
class LessonDetail {
  const LessonDetail({
    required this.lesson,
    required this.assets,
  });

  final Lesson lesson;
  final List<LessonAsset> assets;

  /// True when the lesson has no published assets.
  bool get hasNoContent => assets.isEmpty;
}
