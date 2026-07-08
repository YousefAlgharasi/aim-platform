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

  // AIM pipeline live wiring: lesson practice (learning session) flow
  static const String practiceSession = '/practice/session';

  // Phase 4 — P4-065: Placement Test flow routes
  static const String placementStart = '/placement/start';
  static const String placementSection = '/placement/section';
  static const String placementQuestion = '/placement/question';
  // P4-066: submit route (navigated from section page after last section)
  static const String placementSubmit = '/placement/submit';
  static const String placementResult = '/placement/result';
  // Drawer "Placement Test" menu entry: checks GET /placement/attempts/latest
  // and routes to fresh start, resume, or a completed result + retake option.
  static const String placementMenu = '/placement/menu';

  // TASK-1: Assessment flow routes
  static const String assessments = '/student/assessments';
  static const String assessmentDetail = '/student/assessments/detail';
  static const String assessmentStart = '/student/assessments/start';
  static const String assessmentAttempt = '/student/assessments/attempt';
  // Confirmation step pushed on top of the attempt page (design screen 28).
  static const String assessmentSubmit = '/student/assessments/submit';
  static const String assessmentResult = '/student/assessments/result';
  // TASK-29: Result history route (page existed with no route — see TASK-14
  // table row 30, which never actually got wired up).
  static const String assessmentResultHistory = '/student/assessments/history';

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

  // Dev Tools
  static const String endpointTester = '/dev-tools/endpoint-tester';

  // TASK-14: Profile routes
  static const String editProfile = '/profile/edit';

  // TASK-14: Progress detail routes
  static const String skillState = '/progress/skill-state';
  static const String weaknessSummary = '/progress/weakness';
  static const String recommendations = '/progress/recommendations';
  static const String reviewSchedule = '/progress/review-schedule';

  // TASK-14: Placement intro route
  static const String placementIntro = '/placement/intro';

  // Learning Path
  static const String learningPath = '/learning-path';

  // TASK-14: Assessment deadlines route
  static const String assessmentDeadlines = '/student/assessments/deadlines';

  // TASK-14: Voice Teacher routes
  static const String voiceTeacher = '/voice-teacher';

  // TASK-14: AI Teacher routes
  static const String aiTeacherSettings = '/ai-teacher/settings';
  static const String aiTeacherHistory = '/ai-teacher/history';

  // TASK-14: Notification routes
  static const String notificationPreferences = '/notifications/preferences';
  static const String reminderSettings = '/notifications/reminders';
  static const String notificationDetail = '/notifications/detail';

  // TASK-14: Support routes
  static const String helpCenter = '/support/help';
  static const String parentHelpCenter = '/support/help-parent';
  static const String createTicket = '/support/tickets/new';
  static const String feedback = '/support/feedback';
  static const String ticketList = '/support/tickets';
  static const String ticketDetail = '/support/tickets/detail';
  static const String parentTicketList = '/support/tickets-parent';
  static const String supportStatus = '/support/status';
  static const String releaseNotes = '/support/release-notes';
  static const String releaseNoteDetail = '/support/release-notes/detail';

  // TASK-14: Billing routes
  static const String checkoutStart = '/billing/checkout';
  static const String checkoutStatus = '/billing/checkout-status';

  // TASK-14: Dev Tools
  static const String designSystemPreview = '/dev-tools/design-system-preview';
}
