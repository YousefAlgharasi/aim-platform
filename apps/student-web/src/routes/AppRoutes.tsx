import { lazy, Suspense } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard';
import { PublicLayout } from '../layouts/PublicLayout';
import { SetupGuard } from '../guards/SetupGuard';
import { PlacementLayout } from '../layouts/PlacementLayout';
import { AppLayout } from '../layouts/AppLayout';
import { LevelProvider } from '../features/level/LevelContext';
import { AppShellSkeleton, FlowPageSkeleton, PlacementPageSkeleton } from '../components/common/Skeleton';

// Public pages
const LandingPage = lazy(() => import('../features/landing/LandingPage').then((m) => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('../features/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../features/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../features/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const SessionExpiredPage = lazy(() => import('../features/auth/SessionExpiredPage').then((m) => ({ default: m.SessionExpiredPage })));

// Setup / Flow pages
const StartPage = lazy(() => import('../features/start/StartPage').then((m) => ({ default: m.StartPage })));

// Placement pages
const PlacementEntryPage = lazy(() => import('../features/placement/PlacementEntryPage').then((m) => ({ default: m.PlacementEntryPage })));
const PlacementGatePage = lazy(() => import('../features/placement/PlacementGatePage').then((m) => ({ default: m.PlacementGatePage })));
const PlacementQuestionUI = lazy(() => import('../features/placement/PlacementQuestionUI').then((m) => ({ default: m.PlacementQuestionUI })));
const PlacementResultPage = lazy(() => import('../features/placement/PlacementResultPage').then((m) => ({ default: m.PlacementResultPage })));

// Protected pages
const DashboardHome = lazy(() => import('../features/dashboard/DashboardHome').then((m) => ({ default: m.DashboardHome })));
const ProfilePage = lazy(() => import('../features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const OnboardingPage = lazy(() => import('../features/learner/OnboardingPage').then((m) => ({ default: m.OnboardingPage })));
const VocabularyPage = lazy(() => import('../features/learner/VocabularyPage').then((m) => ({ default: m.VocabularyPage })));
const VocabularyLibraryPage = lazy(() => import('../features/learner/VocabularyLibraryPage').then((m) => ({ default: m.VocabularyLibraryPage })));
const MistakesPage = lazy(() => import('../features/learner/MistakesPage').then((m) => ({ default: m.MistakesPage })));
const PracticeHubPage = lazy(() => import('../features/practice-hub/PracticeHubPage').then((m) => ({ default: m.PracticeHubPage })));
const RecoveryRetryPage = lazy(() => import('../features/improve/RecoveryRetryPage').then((m) => ({ default: m.RecoveryRetryPage })));
const ImprovePage = lazy(() => import('../features/improve/ImprovePage').then((m) => ({ default: m.ImprovePage })));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProgressSummary = lazy(() => import('../features/progress/ProgressSummary').then((m) => ({ default: m.ProgressSummary })));
const LeaderboardPage = lazy(() => import('../features/leaderboard/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })));
const SkillStatePage = lazy(() => import('../features/progress/SkillStatePage').then((m) => ({ default: m.SkillStatePage })));
const ReviewSchedulePage = lazy(() => import('../features/progress/ReviewSchedulePage').then((m) => ({ default: m.ReviewSchedulePage })));
const AchievementsPage = lazy(() => import('../features/achievements/AchievementsPage').then((m) => ({ default: m.AchievementsPage })));
const CertificatesPage = lazy(() => import('../features/certificates/CertificatesPage').then((m) => ({ default: m.CertificatesPage })));
const CertificateDetailPage = lazy(() => import('../features/certificates/CertificateDetailPage').then((m) => ({ default: m.CertificateDetailPage })));
const CourseCatalog = lazy(() => import('../features/curriculum/CourseCatalog').then((m) => ({ default: m.CourseCatalog })));
const CourseDetailPage = lazy(() => import('../features/curriculum/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })));
const MyPaymentsPage = lazy(() => import('../features/course-billing/MyPaymentsPage').then((m) => ({ default: m.MyPaymentsPage })));
const LessonPlayerShell = lazy(() => import('../features/lessons/LessonPlayerShell').then((m) => ({ default: m.LessonPlayerShell })));
const PracticeShell = lazy(() => import('../features/practice/PracticeShell').then((m) => ({ default: m.PracticeShell })));
const PracticeLessonStart = lazy(() => import('../features/practice/PracticeLessonStart').then((m) => ({ default: m.PracticeLessonStart })));
const AssessmentListPage = lazy(() => import('../features/assessments/AssessmentListPage').then((m) => ({ default: m.AssessmentListPage })));
const AssessmentDeadlinesPage = lazy(() => import('../features/assessments/AssessmentDeadlinesPage').then((m) => ({ default: m.AssessmentDeadlinesPage })));
const AssessmentDetailPage = lazy(() => import('../features/assessments/AssessmentDetailPage').then((m) => ({ default: m.AssessmentDetailPage })));
const AttemptScreen = lazy(() => import('../features/assessments/AttemptScreen').then((m) => ({ default: m.AttemptScreen })));
const AssessmentResultPage = lazy(() => import('../features/assessments/AssessmentResultPage').then((m) => ({ default: m.AssessmentResultPage })));
const AITeacherEntryPage = lazy(() => import('../features/ai-teacher/AITeacherEntryPage').then((m) => ({ default: m.AITeacherEntryPage })));
const AIHistoryPage = lazy(() => import('../features/ai-teacher/AIHistoryPage').then((m) => ({ default: m.AIHistoryPage })));
const AIChatPage = lazy(() => import('../features/ai-teacher/AIChatPage').then((m) => ({ default: m.AIChatPage })));
const VoiceTeacherPage = lazy(() => import('../features/voice-teacher/VoiceTeacherPage').then((m) => ({ default: m.VoiceTeacherPage })));
const PracticeTopicsPage = lazy(() => import('../features/practice-topics/PracticeTopicsPage').then((m) => ({ default: m.PracticeTopicsPage })));
const WritingPracticePage = lazy(() => import('../features/practice-topics/WritingPracticePage').then((m) => ({ default: m.WritingPracticePage })));
const NotificationCenterPage = lazy(() => import('../features/notifications/NotificationCenterPage').then((m) => ({ default: m.NotificationCenterPage })));
const NotificationPreferencesPage = lazy(() => import('../features/notifications/NotificationPreferencesPage').then((m) => ({ default: m.NotificationPreferencesPage })));
const BillingPage = lazy(() => import('../features/billing/BillingPage').then((m) => ({ default: m.BillingPage })));
const CheckoutPage = lazy(() => import('../features/billing/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const SupportPage = lazy(() => import('../features/support/SupportPage').then((m) => ({ default: m.SupportPage })));
const TicketDetailPage = lazy(() => import('../features/support/TicketDetailPage').then((m) => ({ default: m.TicketDetailPage })));

// Error pages
const NotFoundPage = lazy(() => import('../components/common/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const ForbiddenPage = lazy(() => import('../components/common/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })));

export function AppRoutes() {
  return (
    <Routes>
      {/* Public landing page (full width, outside the phone-width auth layout) */}
      <Route
        path="/welcome"
        element={
          <Suspense fallback={<FlowPageSkeleton />}>
            <LandingPage />
          </Suspense>
        }
      />

      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route
          path="/login"
          element={
            <Suspense fallback={<FlowPageSkeleton />}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<FlowPageSkeleton />}>
              <RegisterPage />
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<FlowPageSkeleton />}>
              <ForgotPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<FlowPageSkeleton />}>
              <ResetPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="/session-expired"
          element={
            <Suspense fallback={<FlowPageSkeleton />}>
              <SessionExpiredPage />
            </Suspense>
          }
        />
      </Route>

      {/* First-run setup: full screen, outside the app shell */}
      <Route
        path="/start"
        element={
          <AuthGuard loader="flow">
            <Suspense fallback={<FlowPageSkeleton />}>
              <StartPage />
            </Suspense>
          </AuthGuard>
        }
      />

      {/* Placement test: full screen, no app menu */}
      <Route
        element={
          <AuthGuard loader="placement">
            <SetupGuard area="placement">
              <PlacementLayout />
            </SetupGuard>
          </AuthGuard>
        }
      >
        <Route
          path="/placement"
          element={
            <Suspense fallback={<PlacementPageSkeleton />}>
              <PlacementEntryPage />
            </Suspense>
          }
        />
        <Route
          path="/placement/gate"
          element={
            <Suspense fallback={<PlacementPageSkeleton />}>
              <PlacementGatePage />
            </Suspense>
          }
        />
        <Route
          path="/placement/:id"
          element={
            <Suspense fallback={<PlacementPageSkeleton />}>
              <PlacementQuestionUI />
            </Suspense>
          }
        />
        <Route
          path="/placement/:id/result"
          element={
            <Suspense fallback={<PlacementPageSkeleton />}>
              <PlacementResultPage />
            </Suspense>
          }
        />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <AuthGuard>
            <SetupGuard>
              <LevelProvider>
                <AppLayout />
              </LevelProvider>
            </SetupGuard>
          </AuthGuard>
        }
      >
        <Route
          path="/"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <DashboardHome />
            </Suspense>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <DashboardHome />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <ProfilePage />
            </Suspense>
          }
        />
        <Route
          path="/onboarding"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <OnboardingPage />
            </Suspense>
          }
        />
        <Route
          path="/vocabulary"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <VocabularyPage />
            </Suspense>
          }
        />
        <Route
          path="/vocabulary-library"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <VocabularyLibraryPage />
            </Suspense>
          }
        />
        <Route
          path="/mistakes"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <MistakesPage />
            </Suspense>
          }
        />
        <Route
          path="/practice"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <PracticeHubPage />
            </Suspense>
          }
        />
        <Route
          path="/improve"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <ImprovePage />
            </Suspense>
          }
        />
        <Route
          path="/improve/retry/:skillKey"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <RecoveryRetryPage />
            </Suspense>
          }
        />
        <Route path="/journey" element={<Navigate to="/curriculum" replace />} />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route
          path="/progress"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <ProgressSummary />
            </Suspense>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <LeaderboardPage />
            </Suspense>
          }
        />
        <Route
          path="/progress/skills"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <SkillStatePage />
            </Suspense>
          }
        />
        <Route path="/progress/weaknesses" element={<Navigate to="/improve" replace />} />
        <Route
          path="/progress/reviews"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <ReviewSchedulePage />
            </Suspense>
          }
        />
        <Route path="/progress/recommendations" element={<Navigate to="/improve" replace />} />
        <Route
          path="/achievements"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <AchievementsPage />
            </Suspense>
          }
        />
        <Route
          path="/certificates"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <CertificatesPage />
            </Suspense>
          }
        />
        <Route
          path="/certificates/:certificateId"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <CertificateDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/curriculum"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <CourseCatalog />
            </Suspense>
          }
        />
        <Route
          path="/curriculum/:subjectId"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <CourseDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/lessons/:lessonId"
          element={
            <Suspense fallback={<FlowPageSkeleton />}>
              <LessonPlayerShell />
            </Suspense>
          }
        />
        <Route
          path="/practice/:sessionId"
          element={
            <Suspense fallback={<FlowPageSkeleton />}>
              <PracticeShell />
            </Suspense>
          }
        />
        <Route
          path="/practice/lesson/:lessonId"
          element={
            <Suspense fallback={<FlowPageSkeleton />}>
              <PracticeLessonStart />
            </Suspense>
          }
        />
        <Route
          path="/assessments"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <AssessmentListPage />
            </Suspense>
          }
        />
        <Route
          path="/assessments/deadlines"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <AssessmentDeadlinesPage />
            </Suspense>
          }
        />
        <Route
          path="/assessments/:assessmentId"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <AssessmentDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/assessments/:assessmentId/attempt/:attemptId"
          element={
            <Suspense fallback={<FlowPageSkeleton />}>
              <AttemptScreen />
            </Suspense>
          }
        />
        <Route
          path="/assessments/:assessmentId/result/:attemptId"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <AssessmentResultPage />
            </Suspense>
          }
        />
        <Route
          path="/ai-teacher"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <AITeacherEntryPage />
            </Suspense>
          }
        />
        <Route
          path="/ai-teacher/history"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <AIHistoryPage />
            </Suspense>
          }
        />
        <Route
          path="/ai-teacher/:conversationId"
          element={
            <Suspense fallback={<FlowPageSkeleton />}>
              <AIChatPage />
            </Suspense>
          }
        />
        <Route
          path="/voice-teacher"
          element={
            <Suspense fallback={<FlowPageSkeleton />}>
              <VoiceTeacherPage />
            </Suspense>
          }
        />
        <Route
          path="/voice-teacher/:sessionId"
          element={
            <Suspense fallback={<FlowPageSkeleton />}>
              <VoiceTeacherPage />
            </Suspense>
          }
        />
        <Route
          path="/practice/speaking"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <PracticeTopicsPage kind="speaking" />
            </Suspense>
          }
        />
        <Route
          path="/practice/writing"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <PracticeTopicsPage kind="writing" />
            </Suspense>
          }
        />
        <Route
          path="/practice/writing/:topicId"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <WritingPracticePage />
            </Suspense>
          }
        />
        <Route
          path="/notifications"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <NotificationCenterPage />
            </Suspense>
          }
        />
        <Route
          path="/notifications/preferences"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <NotificationPreferencesPage />
            </Suspense>
          }
        />
        <Route
          path="/billing"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <BillingPage />
            </Suspense>
          }
        />
        <Route
          path="/billing/payments"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <MyPaymentsPage />
            </Suspense>
          }
        />
        <Route
          path="/billing/checkout/:planId"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <CheckoutPage />
            </Suspense>
          }
        />
        <Route
          path="/support"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <SupportPage />
            </Suspense>
          }
        />
        <Route
          path="/support/tickets/:ticketId"
          element={
            <Suspense fallback={<AppShellSkeleton />}>
              <TicketDetailPage />
            </Suspense>
          }
        />
      </Route>

      {/* Error routes */}
      <Route
        path="/403"
        element={
          <Suspense fallback={<AppShellSkeleton />}>
            <ForbiddenPage />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={
          <Suspense fallback={<AppShellSkeleton />}>
            <NotFoundPage />
          </Suspense>
        }
      />
    </Routes>
  );
}
