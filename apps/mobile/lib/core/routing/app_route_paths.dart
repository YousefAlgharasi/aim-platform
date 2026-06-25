class AppRoutePaths {
  const AppRoutePaths._();

  static const String splash = '/';
  static const String signIn = '/auth/sign-in';
  static const String register = '/auth/register';
  static const String mainShell = '/main';
  static const String home = '/main/home';
  static const String learn = '/main/learn';
  static const String review = '/main/review';
  static const String progress = '/main/progress';
  static const String profile = '/main/profile';

  // Phase 6 — P6-073: Curriculum browser routes
  static const String courseChapters = '/lessons/chapters';
  static const String chapterLessons = '/lessons/lessons';
  static const String lessonDetail = '/lessons/detail';

  // Phase 4 — P4-065: Placement Test flow routes
  static const String placementStart = '/placement/start';
  static const String placementSection = '/placement/section';
  static const String placementQuestion = '/placement/question';
  // P4-066: submit route (navigated from section page after last section)
  static const String placementSubmit = '/placement/submit';
  static const String placementResult = '/placement/result';

  // TASK-1: Assessment flow routes
  static const String assessments = '/student/assessments';
  static const String assessmentDetail = '/student/assessments/detail';
  static const String assessmentStart = '/student/assessments/start';
  static const String assessmentAttempt = '/student/assessments/attempt';
  static const String assessmentResult = '/student/assessments/result';

  // Billing routes
  static const String subscription = '/billing/subscription';
  static const String pricing = '/billing/pricing';
  static const String invoiceHistory = '/billing/invoices';

  // AI Teacher routes
  static const String aiTeacherChat = '/ai-teacher/chat';

  // Notification routes
  static const String notificationInbox = '/notifications/inbox';

  // Analytics summary
  static const String analyticsSummary = '/analytics/summary';

  // Achievements
  static const String achievements = '/achievements';
}
