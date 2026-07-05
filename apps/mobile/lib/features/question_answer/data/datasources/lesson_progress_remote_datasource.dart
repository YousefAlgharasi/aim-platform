// Bugfix: finishing all the questions delivered for a lesson previously only
// flipped a local "finished" flag — nothing was ever sent to the backend, so
// lesson_progress.percent never updated and lesson_progress.completed (the
// only gate for unlocking the next lesson/course — P20-011/P20-012) was
// never set. This datasource is the missing link: called once the practice
// session actually finishes.

abstract class LessonProgressRemoteDatasource {
  /// POST /lessons/:id/progress
  Future<void> recordProgress({
    required String bearerToken,
    required String lessonId,
    required int percent,
  });

  /// POST /lessons/:id/complete — the only backend call that ever sets
  /// lesson_progress.completed = true.
  Future<void> markComplete({
    required String bearerToken,
    required String lessonId,
  });
}
