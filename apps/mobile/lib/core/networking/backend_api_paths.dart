class BackendApiPaths {
  const BackendApiPaths._();

  static const String health = '/health';
  static const String version = '/version';

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  static const String authMe = '/auth/me';
  static const String authSyncUser = '/auth/bootstrap';
  static const String authLogout = '/auth/logout';

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------

  static const String profileMe = '/profile/me';

  // ---------------------------------------------------------------------------
  // Placement Test — Phase 4 P4-063 + Phase 6 P6-022
  // Student-facing only. Admin/write endpoints are forbidden in Flutter.
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // AIM Engine outputs — Phase 6 P6-022
  // Read-only. Flutter never writes to these endpoints.
  // Backend computes all AIM values; Flutter only displays them.
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Curriculum — Phase 6 P6-022
  // Read-only list endpoints. Write/admin endpoints are forbidden in Flutter.
  // ---------------------------------------------------------------------------

  static const String curriculumCourses = '/curriculum/courses';
  static const String curriculumChapters = '/curriculum/chapters';
  static const String curriculumLessons = '/curriculum/lessons';
  static const String curriculumLessonAssets = '/curriculum/lesson-assets';

  /// GET /curriculum/courses/:courseId/sessions
  static String curriculumCourseSessions(String courseId) =>
      '/curriculum/courses/$courseId/sessions';

  /// GET /curriculum/lessons/:lessonId
  static String curriculumLessonDetail(String lessonId) =>
      '/curriculum/lessons/$lessonId';

  /// GET /curriculum/questions/:questionId
  static String curriculumQuestion(String questionId) =>
      '/curriculum/questions/$questionId';

  // ---------------------------------------------------------------------------
  // Sessions — Phase 6 P6-022
  // Answer submission flows through backend. Flutter never scores answers.
  // ---------------------------------------------------------------------------

  /// POST /sessions/start
  static const String sessionsStart = '/sessions/start';

  /// POST /sessions/:sessionId/attempt
  static String sessionAttempt(String sessionId) =>
      '/sessions/$sessionId/attempt';

  /// GET /aim/students/:studentId/sessions/:sessionId/state
  static String aimSessionState(String studentId, String sessionId) =>
      '/aim/students/$studentId/sessions/$sessionId/state';
}
