class BackendApiPaths {
  const BackendApiPaths._();

  static const String health = '/health';
  static const String version = '/version';

  static const String authMe = '/auth/me';
  static const String authSyncUser = '/auth/sync-user';
  static const String authLogout = '/auth/logout';

  static const String profileMe = '/profile/me';

  // Phase 4 — P4-063: Placement Test endpoints (student-facing)
  static const String placementActive = '/placement/active';
  static const String placementActiveSections = '/placement/active/sections';
  static const String placementQuestions = '/placement/questions';
  static const String placementAttempts = '/placement/attempts';

  /// GET /placement/attempts/:id/result
  static String placementAttemptResult(String attemptId) =>
      '/placement/attempts/$attemptId/result';

  /// POST /placement/attempts/:id/answers
  static String placementAttemptAnswers(String attemptId) =>
      '/placement/attempts/$attemptId/answers';

  /// POST /placement/attempts/:id/complete
  static String placementAttemptComplete(String attemptId) =>
      '/placement/attempts/$attemptId/complete';

  // Phase 6 — P6-060: Home screen AIM endpoints
  /// GET /aim/students/:studentId/skill-states
  static String aimSkillStates(String studentId) =>
      '/aim/students/$studentId/skill-states';

  /// GET /aim/students/:studentId/weakness-records
  static String aimWeaknessRecords(String studentId) =>
      '/aim/students/$studentId/weakness-records';

  /// GET /aim/students/:studentId/review-schedules
  static String aimReviewSchedules(String studentId) =>
      '/aim/students/$studentId/review-schedules';

  /// GET /aim/students/:studentId/recommendations
  static String aimRecommendations(String studentId) =>
      '/aim/students/$studentId/recommendations';

  // Phase 6 — P6-071: Curriculum endpoints (student-facing read)

  /// GET /curriculum/courses?status=published
  static const String curriculumCourses = '/curriculum/courses';

  /// GET /curriculum/chapters?levelId=:levelId
  static const String curriculumChapters = '/curriculum/chapters';

  /// GET /curriculum/lessons?chapterId=:chapterId
  static const String curriculumLessons = '/curriculum/lessons';
}