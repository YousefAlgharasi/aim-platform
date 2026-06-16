class BackendApiPaths {
  const BackendApiPaths._();

  static const String health = '/health';
  static const String version = '/version';

  static const String authMe = '/auth/me';
  static const String authSyncUser = '/auth/sync-user';
  static const String authLogout = '/auth/logout';

  static const String profileMe = '/profile/me';

  // Phase 4 — P4-063: Placement Test endpoints (student-facing)
  // Mirrors the API map from P4-006 and the endpoint contracts from P4-038–P4-048.
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
}
