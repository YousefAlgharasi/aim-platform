import { LandingPage } from '../features/landing/LandingPage';
import { VocabularyPage } from '../features/learner/VocabularyPage';
import { MistakesPage } from '../features/learner/MistakesPage';
import { LevelProvider } from '../features/level/LevelContext';
import { PracticeHubPage } from '../features/practice-hub/PracticeHubPage';
import { LeaderboardPage } from '../features/leaderboard/LeaderboardPage';
import { ImprovePage } from '../features/improve/ImprovePage';
import { OnboardingPage } from '../features/learner/OnboardingPage';
import { Navigate, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard';
import { PublicLayout } from '../layouts/PublicLayout';
import { SetupGuard } from '../guards/SetupGuard';
import { StartPage } from '../features/start/StartPage';
import { PlacementLayout } from '../layouts/PlacementLayout';
import { AppLayout } from '../layouts/AppLayout';

import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { SessionExpiredPage } from '../features/auth/SessionExpiredPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { DashboardHome } from '../features/dashboard/DashboardHome';
import { ProfilePage } from '../features/profile/ProfilePage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { ProgressSummary } from '../features/progress/ProgressSummary';
import { SkillStatePage } from '../features/progress/SkillStatePage';
import { PlacementEntryPage } from '../features/placement/PlacementEntryPage';
import { PlacementQuestionUI } from '../features/placement/PlacementQuestionUI';
import { PlacementResultPage } from '../features/placement/PlacementResultPage';
import { CourseCatalog } from '../features/curriculum/CourseCatalog';
import { CourseDetailPage } from '../features/curriculum/CourseDetailPage';
import { MyPaymentsPage } from '../features/course-billing/MyPaymentsPage';
import { LessonPlayerShell } from '../features/lessons/LessonPlayerShell';
import { PracticeShell } from '../features/practice/PracticeShell';
import { AssessmentListPage } from '../features/assessments/AssessmentListPage';
import { AssessmentDetailPage } from '../features/assessments/AssessmentDetailPage';
import { AttemptScreen } from '../features/assessments/AttemptScreen';
import { AssessmentResultPage } from '../features/assessments/AssessmentResultPage';
import { AITeacherEntryPage } from '../features/ai-teacher/AITeacherEntryPage';
import { AIChatPage } from '../features/ai-teacher/AIChatPage';
import { AIHistoryPage } from '../features/ai-teacher/AIHistoryPage';
import { NotificationCenterPage } from '../features/notifications/NotificationCenterPage';
import { NotificationPreferencesPage } from '../features/notifications/NotificationPreferencesPage';
import { BillingPage } from '../features/billing/BillingPage';
import { CheckoutPage } from '../features/billing/CheckoutPage';
import { SupportPage } from '../features/support/SupportPage';
import { PlacementGatePage } from '../features/placement/PlacementGatePage';
import { AssessmentDeadlinesPage } from '../features/assessments/AssessmentDeadlinesPage';
import { PracticeLessonStart } from '../features/practice/PracticeLessonStart';
import { VoiceTeacherPage } from '../features/voice-teacher/VoiceTeacherPage';
import { PracticeTopicsPage } from '../features/practice-topics/PracticeTopicsPage';
import { WritingPracticePage } from '../features/practice-topics/WritingPracticePage';
import { ReviewSchedulePage } from '../features/progress/ReviewSchedulePage';
import { AchievementsPage } from '../features/achievements/AchievementsPage';
import { CertificatesPage } from '../features/certificates/CertificatesPage';
import { CertificateDetailPage } from '../features/certificates/CertificateDetailPage';
import { TicketDetailPage } from '../features/support/TicketDetailPage';
import { NotFoundPage } from '../components/common/NotFoundPage';
import { ForbiddenPage } from '../components/common/ForbiddenPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public landing page (full width, outside the phone-width auth layout) */}
      <Route path="/welcome" element={<LandingPage />} />

      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/session-expired" element={<SessionExpiredPage />} />
      </Route>

      {/* First-run setup: full screen, outside the app shell */}
      <Route path="/start" element={<AuthGuard loader="flow"><StartPage /></AuthGuard>} />

      {/* Placement test: full screen, no app menu */}
      <Route element={<AuthGuard loader="placement"><SetupGuard area="placement"><PlacementLayout /></SetupGuard></AuthGuard>}>
        <Route path="/placement" element={<PlacementEntryPage />} />
        <Route path="/placement/gate" element={<PlacementGatePage />} />
        <Route path="/placement/:id" element={<PlacementQuestionUI />} />
        <Route path="/placement/:id/result" element={<PlacementResultPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<AuthGuard><SetupGuard><LevelProvider><AppLayout /></LevelProvider></SetupGuard></AuthGuard>}>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/mistakes" element={<MistakesPage />} />
        <Route path="/practice" element={<PracticeHubPage />} />
        <Route path="/improve" element={<ImprovePage />} />
        <Route path="/journey" element={<Navigate to="/curriculum" replace />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/progress" element={<ProgressSummary />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/progress/skills" element={<SkillStatePage />} />
        <Route path="/progress/weaknesses" element={<Navigate to="/improve" replace />} />
        <Route path="/progress/reviews" element={<ReviewSchedulePage />} />
        <Route path="/progress/recommendations" element={<Navigate to="/improve" replace />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/certificates/:certificateId" element={<CertificateDetailPage />} />
        <Route path="/curriculum" element={<CourseCatalog />} />
        <Route path="/curriculum/:subjectId" element={<CourseDetailPage />} />
        <Route path="/lessons/:lessonId" element={<LessonPlayerShell />} />
        <Route path="/practice/:sessionId" element={<PracticeShell />} />
        <Route path="/practice/lesson/:lessonId" element={<PracticeLessonStart />} />
        <Route path="/assessments" element={<AssessmentListPage />} />
        <Route path="/assessments/deadlines" element={<AssessmentDeadlinesPage />} />
        <Route path="/assessments/:assessmentId" element={<AssessmentDetailPage />} />
        <Route path="/assessments/:assessmentId/attempt/:attemptId" element={<AttemptScreen />} />
        <Route path="/assessments/:assessmentId/result/:attemptId" element={<AssessmentResultPage />} />
        <Route path="/ai-teacher" element={<AITeacherEntryPage />} />
        <Route path="/ai-teacher/history" element={<AIHistoryPage />} />
        <Route path="/ai-teacher/:conversationId" element={<AIChatPage />} />
        <Route path="/voice-teacher" element={<VoiceTeacherPage />} />
        <Route path="/voice-teacher/:sessionId" element={<VoiceTeacherPage />} />
        <Route path="/practice/speaking" element={<PracticeTopicsPage kind="speaking" />} />
        <Route path="/practice/writing" element={<PracticeTopicsPage kind="writing" />} />
        <Route path="/practice/writing/:topicId" element={<WritingPracticePage />} />
        <Route path="/notifications" element={<NotificationCenterPage />} />
        <Route path="/notifications/preferences" element={<NotificationPreferencesPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/billing/payments" element={<MyPaymentsPage />} />
        <Route path="/billing/checkout/:planId" element={<CheckoutPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/support/tickets/:ticketId" element={<TicketDetailPage />} />
      </Route>

      {/* Error routes */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
