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
  static const String authLogin = '/auth/login';
  static const String authRefresh = '/auth/refresh';
  static const String authRegister = '/auth/register';

  /// POST /auth/test-login — non-production only. Backend returns 404 for
  /// this route when running in production.
  static const String authTestLogin = '/auth/test-login';

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

  /// GET /placement/questions/:id/audio
  static String placementQuestionAudio(String questionId) =>
      '/placement/questions/$questionId/audio';

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
  // Student Analytics Summary — Phase 15 P15-072
  // Read-only. Returns backend-approved report definitions visible to the
  // student role; Flutter never computes mastery/progress figures here.
  // ---------------------------------------------------------------------------

  static const String studentAnalyticsSummary = '/student/analytics/summary';

  // ---------------------------------------------------------------------------
  // Achievements — Phase 13
  // Read-only. Achievement unlock criteria, badge logic, and milestone
  // tracking are never computed in Flutter.
  // ---------------------------------------------------------------------------

  /// GET /student/achievements
  static const String achievements = '/student/achievements';

  // ---------------------------------------------------------------------------
  // Student Courses — enriched course list (level, lesson count, real
  // per-student progress) for the mobile Courses screen. Distinct from
  // /curriculum/courses (admin-facing content listing).
  // ---------------------------------------------------------------------------

  /// GET /student/courses
  static const String studentCourses = '/student/courses';

  /// POST /courses/:id/enroll — explicit "start this course" action, making
  /// it the student's one active course (any previous active enrollment
  /// transitions to 'switched').
  static String courseEnroll(String courseId) => '/courses/$courseId/enroll';

  /// GET /enrollment/current — the student's current active enrollment, or
  /// found: false if they haven't started any course yet.
  static const String enrollmentCurrent = '/enrollment/current';

  /// GET /student/chapters?levelId= — published chapters under a level with
  /// real per-student progress (percent, completedLessonCount, status).
  /// Distinct from /curriculum/chapters (admin-facing content listing).
  static const String studentChapters = '/student/chapters';

  /// GET /student/lessons?chapterId= — published lessons under a chapter
  /// with real per-student completed/current markers. Distinct from
  /// /curriculum/lessons (admin-facing content listing).
  static const String studentLessons = '/student/lessons';

  // ---------------------------------------------------------------------------
  // Engagement — daily goal, streak, and daily challenge.
  // Read-only summary; goal target is the only client-writable field.
  // Streak and challenge progress are always backend-computed.
  // ---------------------------------------------------------------------------

  static const String engagementSummary = '/student/engagement/summary';
  static const String engagementGoal = '/student/engagement/goal';

  /// GET /student/engagement/stats — level, XP, badge count, rank, and
  /// weekly activity for the Home hero card. Read-only; all computed
  /// backend-side.
  static const String engagementStats = '/student/engagement/stats';

  // ---------------------------------------------------------------------------
  // Lessons — student-facing progress endpoints.
  // ---------------------------------------------------------------------------

  /// GET /lessons/continue — most recently active, incomplete lesson.
  static const String lessonsContinue = '/lessons/continue';

  /// GET /lessons/quick-start — next lesson to start, derived from placement result.
  static const String lessonsQuickStart = '/lessons/quick-start';

  /// GET /lessons/recommended-course — course recommended from placement result.
  static const String lessonsRecommendedCourse = '/lessons/recommended-course';

  /// POST /lessons/:id/progress — record in-progress percent for a lesson.
  static String lessonProgress(String lessonId) => '/lessons/$lessonId/progress';

  /// POST /lessons/:id/complete — mark a lesson as completed (P20-011/P20-012
  /// unlock gate). The only place lesson_progress.completed is ever set true.
  static String lessonComplete(String lessonId) => '/lessons/$lessonId/complete';

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

  /// GET /curriculum/courses/:courseId/levels
  static String curriculumCourseLevels(String courseId) =>
      '/curriculum/courses/$courseId/levels';

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

  /// GET /sessions/:sessionId/questions?lessonId=
  static String sessionQuestions(String sessionId) =>
      '/sessions/$sessionId/questions';

  /// POST /sessions/:sessionId/attempt
  static String sessionAttempt(String sessionId) =>
      '/sessions/$sessionId/attempt';

  /// GET /aim/students/:studentId/sessions/:sessionId/state
  static String aimSessionState(String studentId, String sessionId) =>
      '/aim/students/$studentId/sessions/$sessionId/state';

  // ---------------------------------------------------------------------------
  // AI Teacher chat — Phase 8 P8-082
  // Backend-only. Flutter never calls an AI provider directly.
  // ---------------------------------------------------------------------------

  /// POST /ai-teacher/sessions (P8-071)
  /// GET  /ai-teacher/sessions (P8-074)
  static const String aiTeacherSessions = '/ai-teacher/sessions';

  /// POST /ai-teacher/sessions/:id/messages (P8-072)
  /// GET  /ai-teacher/sessions/:id/messages (P8-073)
  static String aiTeacherSessionMessages(String sessionId) =>
      '/ai-teacher/sessions/$sessionId/messages';

  /// POST /ai-teacher/messages/:id/feedback (P8-075)
  static String aiTeacherMessageFeedback(String messageId) =>
      '/ai-teacher/messages/$messageId/feedback';

  /// POST /ai-teacher/sessions/:id/messages/stream (P18-043, SSE) (P18-061)
  static String aiTeacherSessionMessagesStream(String sessionId) =>
      '/ai-teacher/sessions/$sessionId/messages/stream';

  /// GET /ai-teacher/sessions/:id/safety-status (P18-047) (P18-064)
  static String aiTeacherSessionSafetyStatus(String sessionId) =>
      '/ai-teacher/sessions/$sessionId/safety-status';

  // ---------------------------------------------------------------------------
  // Assessments — Phase 10 P10-051
  // Student-facing only. Backend is the final authority for grading, deadlines,
  // attempt eligibility, and results. Flutter displays backend values as-is.
  // ---------------------------------------------------------------------------

  /// GET /student/assessments
  static const String studentAssessments = '/student/assessments';

  /// GET /student/assessments/deadlines
  static const String studentAssessmentDeadlines =
      '/student/assessments/deadlines';

  /// GET /student/assessments/:id
  static String studentAssessmentDetail(String assessmentId) =>
      '/student/assessments/$assessmentId';

  /// GET /student/assessments/:id/history
  static String studentAssessmentHistory(String assessmentId) =>
      '/student/assessments/$assessmentId/history';

  /// POST /student/assessments/:id/attempts
  static String studentStartAttempt(String assessmentId) =>
      '/student/assessments/$assessmentId/attempts';

  /// GET /student/assessments/attempts/:attemptId/resume
  static String studentResumeAttempt(String attemptId) =>
      '/student/assessments/attempts/$attemptId/resume';

  /// POST /student/assessments/attempts/:attemptId/submit
  static String studentSubmitAttempt(String attemptId) =>
      '/student/assessments/attempts/$attemptId/submit';

  /// GET /student/assessments/attempts/:attemptId/result
  static String studentAttemptResult(String attemptId) =>
      '/student/assessments/attempts/$attemptId/result';

  // ---------------------------------------------------------------------------
  // Notifications — Phase 13 P13-042..P13-046
  // Backend is the final authority for eligibility, delivery state, quiet
  // hours, and token validity. Flutter only displays and requests changes.
  // ---------------------------------------------------------------------------

  static const String notificationDeviceTokens =
      '/api/v1/notifications/device-tokens';

  /// DELETE /api/v1/notifications/device-tokens/:tokenId
  static String notificationDeviceToken(String tokenId) =>
      '/api/v1/notifications/device-tokens/$tokenId';

  static const String notificationPreferences =
      '/api/v1/notifications/preferences';

  static const String notificationInbox = '/api/v1/notifications/inbox';

  static const String notificationInboxUnreadCount =
      '/api/v1/notifications/inbox/unread-count';

  /// PATCH /api/v1/notifications/inbox/:eventId/read
  static String notificationMarkRead(String eventId) =>
      '/api/v1/notifications/inbox/$eventId/read';

  /// PATCH /api/v1/notifications/inbox/:eventId/dismiss
  static String notificationDismiss(String eventId) =>
      '/api/v1/notifications/inbox/$eventId/dismiss';

  static const String notificationReminders =
      '/api/v1/notifications/reminders';

  /// PATCH /api/v1/notifications/reminders/:scheduleId/pause
  static String notificationPauseReminder(String scheduleId) =>
      '/api/v1/notifications/reminders/$scheduleId/pause';

  /// PATCH /api/v1/notifications/reminders/:scheduleId/resume
  static String notificationResumeReminder(String scheduleId) =>
      '/api/v1/notifications/reminders/$scheduleId/resume';

  /// PATCH /api/v1/notifications/reminders/:scheduleId/cancel
  static String notificationCancelReminder(String scheduleId) =>
      '/api/v1/notifications/reminders/$scheduleId/cancel';

  static const String notificationQuietHours =
      '/api/v1/notifications/quiet-hours';

  // ---------------------------------------------------------------------------
  // Voice Teacher — Phase 9 / Phase 18 P18-065 P18-066
  // Backend-only. Flutter never calls an STT/TTS/AI provider directly.
  // ---------------------------------------------------------------------------

  /// POST /voice-teacher/sessions
  /// GET  /voice-teacher/sessions
  static const String voiceTeacherSessions = '/voice-teacher/sessions';

  /// GET /voice-teacher/sessions/:id/messages
  static String voiceTeacherSessionMessages(String sessionId) =>
      '/voice-teacher/sessions/$sessionId/messages';

  /// POST /voice-teacher/sessions/:id/audio
  static String voiceTeacherSessionAudio(String sessionId) =>
      '/voice-teacher/sessions/$sessionId/audio';

  /// POST /voice-teacher/sessions/:id/feedback
  static String voiceTeacherSessionFeedback(String sessionId) =>
      '/voice-teacher/sessions/$sessionId/feedback';

  /// GET /voice-teacher/audio/:audioRef
  static String voiceTeacherAudio(String audioRef) =>
      '/voice-teacher/audio/$audioRef';

  // ---------------------------------------------------------------------------
  // Billing — subscriptions, pricing, invoices
  // Backend is the final authority for plan/price/entitlement state. Flutter
  // only displays and requests changes (checkout, cancel).
  // ---------------------------------------------------------------------------

  /// GET /billing/pricing/plans
  static const String billingPlans = '/billing/pricing/plans';

  /// GET /billing/pricing/prices
  static const String billingPrices = '/billing/pricing/prices';

  /// POST /billing/checkout
  static const String billingCheckout = '/billing/checkout';

  /// GET /billing/checkout/:sessionId/status
  static String billingCheckoutStatus(String sessionId) =>
      '/billing/checkout/$sessionId/status';

  /// GET /billing/subscriptions
  static const String billingSubscriptions = '/billing/subscriptions';

  /// GET /billing/subscriptions/:id
  static String billingSubscription(String id) =>
      '/billing/subscriptions/$id';

  /// POST /billing/subscriptions/:id/cancel
  static String billingSubscriptionCancel(String id) =>
      '/billing/subscriptions/$id/cancel';

  /// GET /billing/invoices
  static const String billingInvoices = '/billing/invoices';

  /// GET /billing/invoices/:id
  static String billingInvoice(String id) => '/billing/invoices/$id';
}
