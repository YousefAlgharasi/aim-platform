import 'package:aim_mobile/features/auth/ui/pages/register_page.dart';
import 'package:flutter/material.dart';

import '../state/app_async_state.dart';
import '../../features/auth/data/models/auth_context_model.dart';
import '../../features/auth/logic/entity/auth_flow_state.dart';
import '../../features/auth/ui/pages/login_page.dart';
import '../../features/lessons/ui/pages/chapter_list_page.dart';
import '../../features/lessons/ui/pages/lesson_detail_page.dart';
import '../../features/lessons/ui/pages/lesson_list_page.dart';
import '../../features/onboarding/ui/pages/splash_page.dart';
import '../../features/placement/ui/pages/placement_question_page.dart';
import '../../features/placement/ui/pages/placement_result_page.dart';
import '../../features/placement/ui/pages/placement_section_page.dart';
import '../../features/placement/ui/pages/placement_start_page.dart';
import '../../features/placement/ui/pages/placement_submit_page.dart';
import '../../features/assessments/ui/pages/assessment_detail_page.dart';
import '../../features/assessments/ui/pages/assessment_list_page.dart';
import '../../features/assessments/ui/pages/assessment_result_page.dart';
import '../../features/assessments/ui/pages/attempt_page.dart';
import '../../features/assessments/ui/pages/start_attempt_page.dart';
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

class AppRouter {
  const AppRouter._();

  static Route<dynamic> onGenerateRoute(
    RouteSettings settings, {
    AuthFlowState? authState,
    AppAsyncState<AuthContextModel>? authContextState,
  }) {
    final routeName = resolveRouteName(
      settings.name,
      authState: authState,
      authContextState: authContextState,
    );

    return MaterialPageRoute<void>(
      settings: RouteSettings(name: routeName, arguments: settings.arguments),
      builder: (context) {
        switch (routeName) {
          case AppRoutePaths.splash:
            return const SplashPage();
          case AppRoutePaths.signIn:
            return const LoginPage();
          case AppRoutePaths.register:
            return const RegisterPage();
          case AppRoutePaths.mainShell:
          case AppRoutePaths.home:
          case AppRoutePaths.learn:
          case AppRoutePaths.review:
          case AppRoutePaths.progress:
          case AppRoutePaths.profile:
            return const MainShellPage();
          // P6-021: Placement Test flow routes — guarded, backend-driven
          case AppRoutePaths.placementStart:
            return const PlacementStartPage();
          case AppRoutePaths.placementSection:
            return _buildPlacementSection(settings.arguments);
          case AppRoutePaths.placementQuestion:
            return _buildPlacementQuestion(settings.arguments);
          case AppRoutePaths.placementSubmit:
            return _buildPlacementSubmit(settings.arguments);
          case AppRoutePaths.placementResult:
            return _buildPlacementResult(settings.arguments);
          case AppRoutePaths.courseChapters:
            return _buildChapterListPage(settings.arguments);
          case AppRoutePaths.chapterLessons:
            return _buildLessonListPage(settings.arguments);
          case AppRoutePaths.lessonDetail:
            return _buildLessonDetailPage(settings.arguments);
          case AppRoutePaths.assessments:
            return const AssessmentListPage();
          case AppRoutePaths.assessmentDetail:
            return _buildAssessmentDetail(settings.arguments);
          case AppRoutePaths.assessmentStart:
            return _buildAssessmentStart(settings.arguments);
          case AppRoutePaths.assessmentAttempt:
            return _buildAssessmentAttempt(settings.arguments);
          case AppRoutePaths.assessmentResult:
            return _buildAssessmentResult(settings.arguments);
          case AppRoutePaths.subscription:
            return const SubscriptionPage();
          case AppRoutePaths.pricing:
            return const PricingPage();
          case AppRoutePaths.invoiceHistory:
            return const InvoiceHistoryPage();
          case AppRoutePaths.aiTeacherChat:
            return _buildAiTeacherChat(settings.arguments);
          case AppRoutePaths.notificationInbox:
            return const NotificationInboxPage();
          case AppRoutePaths.analyticsSummary:
            return const AnalyticsSummaryPage();
          case AppRoutePaths.achievements:
            return const AchievementsPage();
          case AppRoutePaths.endpointTester:
            return const EndpointTesterPage();
          // TASK-14: Profile routes
          case AppRoutePaths.editProfile:
            return const EditProfilePage();
          // TASK-14: Progress detail routes
          case AppRoutePaths.skillState:
            return const SkillStatePage();
          case AppRoutePaths.weaknessSummary:
            return const WeaknessSummaryPage();
          case AppRoutePaths.recommendations:
            return const RecommendationsPage();
          case AppRoutePaths.reviewSchedule:
            return const ReviewSchedulePage();
          // TASK-14: Placement intro route
          case AppRoutePaths.placementIntro:
            return const PlacementIntroPage();
          // TASK-14: Assessment deadlines route
          case AppRoutePaths.assessmentDeadlines:
            return const DeadlinesPage();
          // TASK-14: Voice Teacher routes
          case AppRoutePaths.voiceTeacher:
            return _buildVoiceTeacherPage(settings.arguments);
          // TASK-14: AI Teacher routes
          case AppRoutePaths.aiTeacherSettings:
            return const AiTeacherSettingsPage();
          case AppRoutePaths.aiTeacherHistory:
            return const AiTeacherSessionHistoryPage();
          // TASK-14: Notification routes
          case AppRoutePaths.notificationPreferences:
            return const NotificationPreferencesPage();
          case AppRoutePaths.reminderSettings:
            return const ReminderSettingsPage();
          case AppRoutePaths.notificationDetail:
            return _buildNotificationDetailPage(settings.arguments);
          // TASK-14: Support routes
          case AppRoutePaths.helpCenter:
            return const HelpCenterPage();
          case AppRoutePaths.parentHelpCenter:
            return const ParentHelpCenterPage();
          case AppRoutePaths.createTicket:
            return const CreateTicketPage();
          case AppRoutePaths.feedback:
            return const FeedbackPage();
          case AppRoutePaths.ticketList:
            return const TicketListPage();
          case AppRoutePaths.ticketDetail:
            return _buildTicketDetailPage(settings.arguments);
          case AppRoutePaths.parentTicketList:
            return const ParentTicketListPage();
          case AppRoutePaths.supportStatus:
            return const StatusPage();
          case AppRoutePaths.releaseNotes:
            return const ReleaseNotesPage();
          case AppRoutePaths.releaseNoteDetail:
            return _buildReleaseNoteDetailPage(settings.arguments);
          // TASK-14: Billing routes
          case AppRoutePaths.checkoutStart:
            return _buildCheckoutStartPage(settings.arguments);
          case AppRoutePaths.checkoutStatus:
            return _buildCheckoutStatusPage(settings.arguments);
          // TASK-14: Dev Tools
          case AppRoutePaths.designSystemPreview:
            return const DSPreviewPage();
          default:
            return const SplashPage();
        }
      },
    );
  }

  static Widget _buildPlacementSection(Object? arguments) {
    final args = _placementArgs(arguments);
    final attemptId = args['attemptId'];

    if (attemptId is! String) return const SplashPage();

    return PlacementSectionPage(attemptId: attemptId);
  }

  static Widget _buildPlacementQuestion(Object? arguments) {
    final args = _placementArgs(arguments);
    final sectionId = args['sectionId'];
    final attemptId = args['attemptId'];
    final sectionTitle = args['sectionTitle'];
    final sectionIndex = args['sectionIndex'];
    final totalSections = args['totalSections'];

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
    if (chapterId is! String || chapterTitle is! String) {
      return const SplashPage();
    }
    return LessonListPage(chapterId: chapterId, chapterTitle: chapterTitle);
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
    return StartAttemptPage(
      assessmentId: assessmentId,
      assessmentTitle: assessmentTitle,
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
    return CheckoutStatusPage(sessionId: sessionId);
  }

  static Widget _buildNotificationDetailPage(Object? arguments) {
    return arguments is NotificationEventModel
        ? NotificationDetailPage(event: arguments)
        : const SplashPage();
  }

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

    final hasProfileReadyContext = authContextState == null ||
        authContextState is AppAsyncSuccess<AuthContextModel>;

    if (authState.isSignedIn &&
        hasProfileReadyContext &&
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
    AppRoutePaths.placementStart,
    AppRoutePaths.placementSection,
    AppRoutePaths.placementQuestion,
    AppRoutePaths.placementSubmit,
    AppRoutePaths.placementResult,
    AppRoutePaths.assessments,
    AppRoutePaths.assessmentDetail,
    AppRoutePaths.assessmentStart,
    AppRoutePaths.assessmentAttempt,
    AppRoutePaths.assessmentResult,
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
