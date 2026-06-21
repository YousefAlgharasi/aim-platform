import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard';
import { PublicLayout } from '../layouts/PublicLayout';
import { AppLayout } from '../layouts/AppLayout';

import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { SessionExpiredPage } from '../features/auth/SessionExpiredPage';
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
import { LessonPlayerShell } from '../features/lessons/LessonPlayerShell';
import { PracticeShell } from '../features/practice/PracticeShell';
import { NotFoundPage } from '../components/common/NotFoundPage';
import { ForbiddenPage } from '../components/common/ForbiddenPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/session-expired" element={<SessionExpiredPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/progress" element={<ProgressSummary />} />
        <Route path="/progress/skills" element={<SkillStatePage />} />
        <Route path="/placement" element={<PlacementEntryPage />} />
        <Route path="/placement/:id" element={<PlacementQuestionUI />} />
        <Route path="/placement/:id/result" element={<PlacementResultPage />} />
        <Route path="/curriculum" element={<CourseCatalog />} />
        <Route path="/curriculum/:subjectId" element={<CourseDetailPage />} />
        <Route path="/lessons/:lessonId" element={<LessonPlayerShell />} />
        <Route path="/practice/:sessionId" element={<PracticeShell />} />
      </Route>

      {/* Error routes */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
