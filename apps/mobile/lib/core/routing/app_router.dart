import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../state/app_async_state.dart';
import '../../features/auth/data/models/auth_context_model.dart';
import '../../features/auth/logic/entity/auth_flow_state.dart';
import '../../features/auth/ui/pages/login_page.dart';
import '../../features/auth/ui/pages/register_page.dart';
import '../../features/lessons/ui/pages/chapter_list_page.dart';
import '../../features/lessons/ui/pages/lesson_detail_page.dart';
import '../../features/lessons/ui/pages/lesson_list_page.dart';
import '../../features/onboarding/ui/pages/splash_page.dart';
import '../../features/placement/ui/pages/placement_question_page.dart';
import '../../features/question_answer/ui/pages/practice_session_page.dart';
import '../../features/placement/ui/pages/placement_menu_page.dart';
import '../../features/placement/ui/pages/placement_result_page.dart';
import '../../features/placement/ui/pages/placement_section_page.dart';
import '../../features/placement/ui/pages/placement_start_page.dart';
import '../../features/placement/ui/pages/placement_submit_page.dart';
import '../../features/assessments/ui/pages/assessment_detail_page.dart';
import '../../features/assessments/ui/pages/assessment_list_page.dart';
import '../../features/assessments/ui/pages/assessment_result_page.dart';
import '../../features/assessments/ui/pages/result_history_page.dart';
import '../../features/assessments/ui/pages/attempt_page.dart';
import '../../features/assessments/ui/pages/start_attempt_page.dart';
import '../../features/assessments/ui/pages/submit_attempt_page.dart';
import '../../features/billing/ui/pages/subscription_page.dart';
import '../../features/billing/ui/pages/pricing_page.dart';
import '../../features/billing/ui/pages/invoice_history_page.dart';
import '../../features/ai_teacher/ui/pages/ai_teacher_chat_page.dart';
import '../../features/notifications/ui/pages/notification_inbox_page.dart';
import '../../features/analytics_summary/ui/pages/analytics_summary_page.dart';
import '../../features/achievements/ui/pages/achievements_page.dart';
import '../../features/shell/ui/pages/main_shell_page.dart';
import '../../features/dev_tools/ui/pages/endpoint_tester_page.dart';
import '../../features/profile/ui/pages/edit_profile_page.dart';
import '../../features/progress/ui/pages/skill_state_page.dart';
import '../../features/progress/ui/pages/weakness_summary_page.dart';
import '../../features/progress/ui/pages/recommendations_page.dart';
import '../../features/progress/ui/pages/review_schedule_page.dart';
import '../../features/placement/ui/pages/placement_intro_page.dart';
import '../../features/placement/ui/pages/placement_gate_page.dart';
import '../../features/learning_path/ui/pages/learning_path_page.dart';
import '../../features/assessments/ui/pages/deadlines_page.dart';
import '../../features/ai_teacher/ui/pages/ai_teacher_settings_page.dart';
import '../../features/ai_teacher/ui/pages/ai_teacher_session_history_page.dart';
import '../../features/notifications/ui/pages/notification_preferences_page.dart';
import '../../features/notifications/ui/pages/reminder_settings_page.dart';
import '../../features/notifications/ui/pages/notification_detail_page.dart';
import '../../features/notifications/data/models/notification_event_model.dart';
import '../../features/support/ui/pages/help_center_page.dart';
import '../../features/support/ui/pages/parent_help_center_page.dart';
import '../../features/support/ui/pages/create_ticket_page.dart';
import '../../features/support/ui/pages/feedback_page.dart';
import '../../features/support/ui/pages/ticket_list_page.dart';
import '../../features/support/ui/pages/ticket_detail_page.dart';
import '../../features/support/ui/pages/parent_ticket_list_page.dart';
import '../../features/support/ui/pages/status_page.dart';
import '../../features/support/ui/pages/release_notes_page.dart';
import '../../features/support/ui/pages/release_note_detail_page.dart';
import '../../features/voice_teacher/ui/pages/voice_teacher_page.dart';
import '../../features/billing/ui/pages/checkout_start_page.dart';
import '../../features/billing/ui/pages/checkout_status_page.dart';
import '../../features/design_system_preview/ui/pages/ds_preview_page.dart';
import 'app_route_paths.dart';

/// Centralised GoRouter configuration for the app.
///
/// This is the single source of truth for the app's routing graph. Every
/// screen is registered as a top-level [GoRoute] keyed by a path constant
/// from [AppRoutePaths]. Arguments that used to travel via
/// `RouteSettings.arguments` now travel via [GoRouterState.extra], keeping
/// the same "typed args map, validated in a `_build*` helper, fall back to
/// [SplashPage] on bad input" shape as before the migration.
///
/// Auth gating is centralised in [redirect], which defers entirely to
/// [resolveRouteName] — the exact same decision function the app used
/// pre-migration — so the auth business logic is untouched; only the
/// mechanism that acts on it (declarative `redirect` vs. an imperative
/// `Navigator` push from [AuthGate]) changed.
class AppRouter {
  const AppRouter._();

  /// Builds the app's [GoRouter]. [authState] / [authContextState] are read
  /// lazily on every redirect evaluation (not captured once) so the router
  /// can be constructed a single time (in `initState`) while still reacting
  /// to auth changes via [refreshListenable].
  static GoRouter buildRouter({
    required AuthFlowState Function() authState,
    required AppAsyncState<AuthContextModel>? Function() authContextState,
    Listenable? refreshListenable,
    GlobalKey<NavigatorState>? navigatorKey,
    String initialLocation = AppRoutePaths.splash,
  }) {
    return GoRouter(
      navigatorKey: navigatorKey,
      initialLocation: initialLocation,
      refreshListenable: refreshListenable,
      redirect: (context, state) {
        final requested = state.matchedLocation;
        final resolved = resolveRouteName(
          requested,
          authState: authState(),
          authContextState: authContextState(),
        );
        return resolved == requested ? null : resolved;
      },
      errorBuilder: (context, state) => const SplashPage(),
      routes: [
        GoRoute(
          path: AppRoutePaths.splash,
          builder: (context, state) => const SplashPage(),
        ),
        GoRoute(
          path: AppRoutePaths.signIn,
          builder: (context, state) => const LoginPage(),
        ),
        GoRoute(
          path: AppRoutePaths.register,
          builder: (context, state) => const RegisterPage(),
        ),
        GoRoute(
          path: AppRoutePaths.mainShell,
          builder: (context, state) => const MainShellPage(),
        ),
        GoRoute(
          path: AppRoutePaths.home,
          builder: (context, state) => const MainShellPage(),
        ),
        GoRoute(
          path: AppRoutePaths.learn,
          builder: (context, state) => const MainShellPage(),
        ),
        GoRoute(
          path: AppRoutePaths.review,
          builder: (context, state) => const MainShellPage(),
        ),
        GoRoute(
          path: AppRoutePaths.progress,
          builder: (context, state) => const MainShellPage(),
        ),
        GoRoute(
          path: AppRoutePaths.profile,
          builder: (context, state) => const MainShellPage(),
        ),
        // P6-021: Placement Test flow routes — guarded, backend-driven
        GoRoute(
          path: AppRoutePaths.placementStart,
          builder: (context, state) => const PlacementStartPage(),
        ),
        GoRoute(
          path: AppRoutePaths.placementSection,
          builder: (context, state) => _buildPlacementSection(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.placementQuestion,
          builder: (context, state) => _buildPlacementQuestion(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.placementSubmit,
          builder: (context, state) => _buildPlacementSubmit(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.placementResult,
          builder: (context, state) => _buildPlacementResult(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.placementMenu,
          builder: (context, state) => const PlacementMenuPage(),
        ),
        GoRoute(
          path: AppRoutePaths.placementGate,
          builder: (context, state) => const PlacementGatePage(),
        ),
        GoRoute(
          path: AppRoutePaths.courseChapters,
          builder: (context, state) => _buildChapterListPage(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.chapterLessons,
          builder: (context, state) => _buildLessonListPage(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.lessonDetail,
          builder: (context, state) => _buildLessonDetailPage(state.extra),
        ),
        // AIM pipeline live wiring: lesson practice (learning session) flow
        GoRoute(
          path: AppRoutePaths.practiceSession,
          builder: (context, state) => _buildPracticeSessionPage(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.assessments,
          builder: (context, state) => const AssessmentListPage(),
        ),
        GoRoute(
          path: AppRoutePaths.assessmentDetail,
          builder: (context, state) => _buildAssessmentDetail(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.assessmentStart,
          builder: (context, state) => _buildAssessmentStart(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.assessmentAttempt,
          builder: (context, state) => _buildAssessmentAttempt(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.assessmentSubmit,
          builder: (context, state) => _buildAssessmentSubmit(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.assessmentResult,
          builder: (context, state) => _buildAssessmentResult(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.assessmentResultHistory,
          builder: (context, state) => _buildResultHistory(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.subscription,
          builder: (context, state) => const SubscriptionPage(),
        ),
        GoRoute(
          path: AppRoutePaths.pricing,
          builder: (context, state) => const PricingPage(),
        ),
        GoRoute(
          path: AppRoutePaths.invoiceHistory,
          builder: (context, state) => const InvoiceHistoryPage(),
        ),
        GoRoute(
          path: AppRoutePaths.aiTeacherChat,
          builder: (context, state) => _buildAiTeacherChat(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.notificationInbox,
          builder: (context, state) => const NotificationInboxPage(),
        ),
        GoRoute(
          path: AppRoutePaths.analyticsSummary,
          builder: (context, state) => const AnalyticsSummaryPage(),
        ),
        GoRoute(
          path: AppRoutePaths.achievements,
          builder: (context, state) => const AchievementsPage(),
        ),
        GoRoute(
          path: AppRoutePaths.endpointTester,
          builder: (context, state) => const EndpointTesterPage(),
        ),
        // TASK-14: Profile routes
        GoRoute(
          path: AppRoutePaths.editProfile,
          builder: (context, state) => const EditProfilePage(),
        ),
        // TASK-14: Progress detail routes
        GoRoute(
          path: AppRoutePaths.skillState,
          builder: (context, state) => const SkillStatePage(),
        ),
        GoRoute(
          path: AppRoutePaths.weaknessSummary,
          builder: (context, state) => const WeaknessSummaryPage(),
        ),
        GoRoute(
          path: AppRoutePaths.recommendations,
          builder: (context, state) => const RecommendationsPage(),
        ),
        GoRoute(
          path: AppRoutePaths.reviewSchedule,
          builder: (context, state) => const ReviewSchedulePage(),
        ),
        // TASK-14: Placement intro route
        GoRoute(
          path: AppRoutePaths.placementIntro,
          builder: (context, state) => const PlacementIntroPage(),
        ),
        GoRoute(
          path: AppRoutePaths.learningPath,
          builder: (context, state) => const LearningPathPage(),
        ),
        // TASK-14: Assessment deadlines route
        GoRoute(
          path: AppRoutePaths.assessmentDeadlines,
          builder: (context, state) => const DeadlinesPage(),
        ),
        // TASK-14: Voice Teacher routes
        GoRoute(
          path: AppRoutePaths.voiceTeacher,
          builder: (context, state) => _buildVoiceTeacherPage(state.extra),
        ),
        // TASK-14: AI Teacher routes
        GoRoute(
          path: AppRoutePaths.aiTeacherSettings,
          builder: (context, state) => const AiTeacherSettingsPage(),
        ),
        GoRoute(
          path: AppRoutePaths.aiTeacherHistory,
          builder: (context, state) => const AiTeacherSessionHistoryPage(),
        ),
        // TASK-14: Notification routes
        GoRoute(
          path: AppRoutePaths.notificationPreferences,
          builder: (context, state) => const NotificationPreferencesPage(),
        ),
        GoRoute(
          path: AppRoutePaths.reminderSettings,
          builder: (context, state) => const ReminderSettingsPage(),
        ),
        GoRoute(
          path: AppRoutePaths.notificationDetail,
          builder: (context, state) =>
              _buildNotificationDetailPage(state.extra),
        ),
        // TASK-14: Support routes
        GoRoute(
          path: AppRoutePaths.helpCenter,
          builder: (context, state) => const HelpCenterPage(),
        ),
        GoRoute(
          path: AppRoutePaths.parentHelpCenter,
          builder: (context, state) => const ParentHelpCenterPage(),
        ),
        GoRoute(
          path: AppRoutePaths.createTicket,
          builder: (context, state) => const CreateTicketPage(),
        ),
        GoRoute(
          path: AppRoutePaths.feedback,
          builder: (context, state) => const FeedbackPage(),
        ),
        GoRoute(
          path: AppRoutePaths.ticketList,
          builder: (context, state) => const TicketListPage(),
        ),
        GoRoute(
          path: AppRoutePaths.ticketDetail,
          builder: (context, state) => _buildTicketDetailPage(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.parentTicketList,
          builder: (context, state) => const ParentTicketListPage(),
        ),
        GoRoute(
          path: AppRoutePaths.supportStatus,
          builder: (context, state) => const StatusPage(),
        ),
        GoRoute(
          path: AppRoutePaths.releaseNotes,
          builder: (context, state) => const ReleaseNotesPage(),
        ),
        GoRoute(
          path: AppRoutePaths.releaseNoteDetail,
          builder: (context, state) =>
              _buildReleaseNoteDetailPage(state.extra),
        ),
        // TASK-14: Billing routes
        GoRoute(
          path: AppRoutePaths.checkoutStart,
          builder: (context, state) => _buildCheckoutStartPage(state.extra),
        ),
        GoRoute(
          path: AppRoutePaths.checkoutStatus,
          builder: (context, state) => _buildCheckoutStatusPage(state.extra),
        ),
        // TASK-14: Dev Tools — fullscreenDialog to match the debug preview's
        // original MaterialPageRoute(fullscreenDialog: true) presentation.
        GoRoute(
          path: AppRoutePaths.designSystemPreview,
          pageBuilder: (context, state) => const MaterialPage<void>(
            fullscreenDialog: true,
            child: DSPreviewPage(),
          ),
        ),
      ],
    );
  }

  static Widget _buildPlacementSection(Object? arguments) {
    final args = _placementArgs(arguments);
    final attemptId = args['attemptId'];
    final expiresAt = args['expiresAt'];

    if (attemptId is! String) return const SplashPage();

    return PlacementSectionPage(
      attemptId: attemptId,
      expiresAt: expiresAt is String ? expiresAt : null,
    );
  }

  static Widget _buildPlacementQuestion(Object? arguments) {
    final args = _placementArgs(arguments);
    final sectionId = args['sectionId'];
    final attemptId = args['attemptId'];
    final sectionTitle = args['sectionTitle'];
    final sectionIndex = args['sectionIndex'];
    final totalSections = args['totalSections'];
    final expiresAt = args['expiresAt'];

    if (sectionId is! String ||
        attemptId is! String ||
        sectionTitle is! String ||
        sectionIndex is! int ||
        totalSections is! int) {
      return const SplashPage();
    }

    return PlacementQuestionPage(
      sectionId: sectionId,
      attemptId: attemptId,
      sectionTitle: sectionTitle,
      sectionIndex: sectionIndex,
      totalSections: totalSections,
      expiresAt: expiresAt is String ? expiresAt : null,
    );
  }

  static Widget _buildPlacementSubmit(Object? arguments) {
    final args = _placementArgs(arguments);
    final attemptId = args['attemptId'];
    final totalSections = args['totalSections'];

    if (attemptId is! String) return const SplashPage();

    return PlacementSubmitPage(
      attemptId: attemptId,
      totalSections: totalSections is int ? totalSections : null,
    );
  }

  static Widget _buildPlacementResult(Object? arguments) {
    final args = _placementArgs(arguments);
    final attemptId = args['attemptId'];

    if (attemptId is! String) return const SplashPage();

    return PlacementResultPage(attemptId: attemptId);
  }

  static Widget _buildPracticeSessionPage(Object? arguments) {
    final args = arguments is Map<String, dynamic>
        ? arguments
        : const <String, dynamic>{};
    final lessonId = args['lessonId'];
    final lessonTitle = args['lessonTitle'];
    if (lessonId is! String || lessonTitle is! String) {
      return const SplashPage();
    }
    return PracticeSessionPage(lessonId: lessonId, lessonTitle: lessonTitle);
  }

  static Widget _buildLessonDetailPage(Object? arguments) {
    final args = arguments is Map<String, dynamic>
        ? arguments
        : const <String, dynamic>{};
    final lessonId = args['lessonId'];
    final lessonTitle = args['lessonTitle'];
    if (lessonId is! String || lessonTitle is! String) {
      return const SplashPage();
    }
    return LessonDetailPage(lessonId: lessonId, lessonTitle: lessonTitle);
  }

  static Widget _buildLessonListPage(Object? arguments) {
    final args = arguments is Map<String, dynamic>
        ? arguments
        : const <String, dynamic>{};
    final chapterId = args['chapterId'];
    final chapterTitle = args['chapterTitle'];
    final chapterIndex = args['chapterIndex'];
    if (chapterId is! String || chapterTitle is! String) {
      return const SplashPage();
    }
    return LessonListPage(
      chapterId: chapterId,
      chapterTitle: chapterTitle,
      chapterIndex: chapterIndex is int ? chapterIndex : null,
    );
  }

  static Widget _buildChapterListPage(Object? arguments) {
    final args = arguments is Map<String, dynamic>
        ? arguments
        : const <String, dynamic>{};
    final courseId = args['courseId'];
    final courseTitle = args['courseTitle'];
    if (courseId is! String || courseTitle is! String) {
      return const SplashPage();
    }
    return ChapterListPage(courseId: courseId, courseTitle: courseTitle);
  }

  static Map<String, dynamic> _assessmentArgs(Object? arguments) {
    return arguments is Map<String, dynamic> ? arguments : const {};
  }

  static Widget _buildAssessmentDetail(Object? arguments) {
    final args = _assessmentArgs(arguments);
    final assessmentId = args['assessmentId'];
    final assessmentTitle = args['assessmentTitle'];
    if (assessmentId is! String || assessmentTitle is! String) {
      return const SplashPage();
    }
    return AssessmentDetailPage(
      assessmentId: assessmentId,
      assessmentTitle: assessmentTitle,
    );
  }

  static Widget _buildAssessmentStart(Object? arguments) {
    final args = _assessmentArgs(arguments);
    final assessmentId = args['assessmentId'];
    final assessmentTitle = args['assessmentTitle'];
    if (assessmentId is! String || assessmentTitle is! String) {
      return const SplashPage();
    }
    final timeLimitSeconds = args['timeLimitSeconds'];
    return StartAttemptPage(
      assessmentId: assessmentId,
      assessmentTitle: assessmentTitle,
      timeLimitSeconds: timeLimitSeconds is int ? timeLimitSeconds : null,
    );
  }

  static Widget _buildAssessmentAttempt(Object? arguments) {
    final args = _assessmentArgs(arguments);
    final attemptId = args['attemptId'];
    final assessmentTitle = args['assessmentTitle'];
    if (attemptId is! String || assessmentTitle is! String) {
      return const SplashPage();
    }
    return AttemptPage(
      attemptId: attemptId,
      assessmentTitle: assessmentTitle,
      expiresAt: args['expiresAt'] as String?,
    );
  }

  static Widget _buildAssessmentSubmit(Object? arguments) {
    final args = _assessmentArgs(arguments);
    final attemptId = args['attemptId'];
    final assessmentTitle = args['assessmentTitle'];
    if (attemptId is! String || assessmentTitle is! String) {
      return const SplashPage();
    }
    return SubmitAttemptPage(
      attemptId: attemptId,
      assessmentTitle: assessmentTitle,
    );
  }

  static Widget _buildAssessmentResult(Object? arguments) {
    final args = _assessmentArgs(arguments);
    final attemptId = args['attemptId'];
    final assessmentTitle = args['assessmentTitle'];
    if (attemptId is! String || assessmentTitle is! String) {
      return const SplashPage();
    }
    return AssessmentResultPage(
      attemptId: attemptId,
      assessmentTitle: assessmentTitle,
    );
  }

  static Widget _buildResultHistory(Object? arguments) {
    final args = _assessmentArgs(arguments);
    final assessmentId = args['assessmentId'];
    final assessmentTitle = args['assessmentTitle'];
    if (assessmentId is! String || assessmentTitle is! String) {
      return const SplashPage();
    }
    return ResultHistoryPage(
      assessmentId: assessmentId,
      assessmentTitle: assessmentTitle,
    );
  }

  static Widget _buildAiTeacherChat(Object? arguments) {
    final args = arguments is Map<String, dynamic> ? arguments : const <String, dynamic>{};
    final contextRef = args['contextRef'] as String? ?? 'general';
    return AiTeacherChatPage(
      contextRef: contextRef,
      sessionId: args['sessionId'] as String?,
      lessonTitle: args['lessonTitle'] as String?,
      contextLabel: args['contextLabel'] as String?,
    );
  }

  static Map<String, dynamic> _placementArgs(Object? arguments) {
    return arguments is Map<String, dynamic> ? arguments : const {};
  }

  static Widget _buildVoiceTeacherPage(Object? arguments) {
    final args = arguments is Map<String, dynamic>
        ? arguments
        : const <String, dynamic>{};
    final contextRef = args['contextRef'];
    if (contextRef is! String) return const SplashPage();
    return VoiceTeacherPage(contextRef: contextRef);
  }

  static Widget _buildTicketDetailPage(Object? arguments) {
    final args = arguments is Map<String, dynamic>
        ? arguments
        : const <String, dynamic>{};
    final ticketId = args['ticketId'];
    if (ticketId is! String) return const SplashPage();
    return TicketDetailPage(ticketId: ticketId);
  }

  static Widget _buildReleaseNoteDetailPage(Object? arguments) {
    final args = arguments is Map<String, dynamic>
        ? arguments
        : const <String, dynamic>{};
    final noteId = args['noteId'];
    if (noteId is! String) return const SplashPage();
    return ReleaseNoteDetailPage(noteId: noteId);
  }

  static Widget _buildCheckoutStartPage(Object? arguments) {
    final args = arguments is Map<String, dynamic>
        ? arguments
        : const <String, dynamic>{};
    final planName = args['planName'];
    final priceId = args['priceId'];
    final formattedPrice = args['formattedPrice'];
    final interval = args['interval'];
    if (planName is! String ||
        priceId is! String ||
        formattedPrice is! String ||
        interval is! String) {
      return const SplashPage();
    }
    return CheckoutStartPage(
      planName: planName,
      priceId: priceId,
      formattedPrice: formattedPrice,
      interval: interval,
    );
  }

  static Widget _buildCheckoutStatusPage(Object? arguments) {
    final args = arguments is Map<String, dynamic>
        ? arguments
        : const <String, dynamic>{};
    final sessionId = args['sessionId'];
    if (sessionId is! String) return const SplashPage();
    return CheckoutStatusPage(
      sessionId: sessionId,
      planName: args['planName'] as String?,
    );
  }

  static Widget _buildNotificationDetailPage(Object? arguments) {
    return arguments is NotificationEventModel
        ? NotificationDetailPage(event: arguments)
        : const SplashPage();
  }

  /// Single source of truth for auth-gating decisions. Given the route the
  /// caller asked for, returns the route that should actually be shown given
  /// the current [authState] / [authContextState]. Used both by
  /// [buildRouter]'s `redirect` callback and directly by tests.
  static String resolveRouteName(
    String? requestedRouteName, {
    AuthFlowState? authState,
    AppAsyncState<AuthContextModel>? authContextState,
  }) {
    final routeName = requestedRouteName ?? AppRoutePaths.splash;
    final isProtectedRoute = _protectedRoutes.contains(routeName);

    if (authState == null) {
      return routeName;
    }

    if (authState.isChecking) {
      return AppRoutePaths.splash;
    }

    if (authState.isSignedOut &&
        (isProtectedRoute || routeName == AppRoutePaths.splash)) {
      return AppRoutePaths.signIn;
    }

    // Note: intentionally does not gate on `authContextState` readiness —
    // this mirrors the pre-GoRouter behavior, where the imperative
    // AuthGate/login/register listeners that used to drive this exact
    // transition forwarded signed-in users to mainShell as soon as
    // authFlowProvider flipped, without waiting on authContextProvider.
    if (authState.isSignedIn &&
        (routeName == AppRoutePaths.splash ||
            routeName == AppRoutePaths.signIn)) {
      return AppRoutePaths.mainShell;
    }

    return routeName;
  }

  static const Set<String> _protectedRoutes = {
    AppRoutePaths.mainShell,
    AppRoutePaths.home,
    AppRoutePaths.learn,
    AppRoutePaths.review,
    AppRoutePaths.progress,
    AppRoutePaths.profile,
    // P6-021: Placement routes are protected — must be authenticated
    AppRoutePaths.practiceSession,
    AppRoutePaths.placementStart,
    AppRoutePaths.placementSection,
    AppRoutePaths.placementQuestion,
    AppRoutePaths.placementSubmit,
    AppRoutePaths.placementResult,
    AppRoutePaths.placementMenu,
    AppRoutePaths.placementGate,
    AppRoutePaths.assessments,
    AppRoutePaths.assessmentDetail,
    AppRoutePaths.assessmentStart,
    AppRoutePaths.assessmentAttempt,
    AppRoutePaths.assessmentSubmit,
    AppRoutePaths.assessmentResult,
    AppRoutePaths.assessmentResultHistory,
    AppRoutePaths.subscription,
    AppRoutePaths.pricing,
    AppRoutePaths.invoiceHistory,
    AppRoutePaths.aiTeacherChat,
    AppRoutePaths.notificationInbox,
    AppRoutePaths.analyticsSummary,
    AppRoutePaths.achievements,
    // TASK-14: Newly wired-up screens are authenticated-student-facing
    AppRoutePaths.editProfile,
    AppRoutePaths.skillState,
    AppRoutePaths.weaknessSummary,
    AppRoutePaths.recommendations,
    AppRoutePaths.reviewSchedule,
    AppRoutePaths.placementIntro,
    AppRoutePaths.learningPath,
    AppRoutePaths.assessmentDeadlines,
    AppRoutePaths.voiceTeacher,
    AppRoutePaths.aiTeacherSettings,
    AppRoutePaths.aiTeacherHistory,
    AppRoutePaths.notificationPreferences,
    AppRoutePaths.reminderSettings,
    AppRoutePaths.notificationDetail,
    AppRoutePaths.helpCenter,
    AppRoutePaths.parentHelpCenter,
    AppRoutePaths.createTicket,
    AppRoutePaths.feedback,
    AppRoutePaths.ticketList,
    AppRoutePaths.ticketDetail,
    AppRoutePaths.parentTicketList,
    AppRoutePaths.supportStatus,
    AppRoutePaths.releaseNotes,
    AppRoutePaths.releaseNoteDetail,
    AppRoutePaths.checkoutStart,
    AppRoutePaths.checkoutStatus,
    AppRoutePaths.designSystemPreview,
  };
}
