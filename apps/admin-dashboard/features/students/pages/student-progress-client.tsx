'use client';

import Link from 'next/link';
import {
  AdminCard,
  AdminBadge,
  AdminStatusBadge,
  AdminDateCell,
  AdminAccordion,
} from '../../../shared/components/Misc';
import type {
  AdminStudentProfile,
  AdminStudentProfileCourse,
  AdminStudentProfileSkillSignal,
} from '../../../core/api/admin-student-profile-api';
import { studentDisplayName } from '../student-display-name';

type Props = {
  readonly profile: AdminStudentProfile;
};

const SIGNAL_VARIANT: Record<AdminStudentProfileSkillSignal, 'success' | 'primary' | 'warning'> = {
  strong: 'success',
  developing: 'primary',
  emerging: 'warning',
};

const SEVERITY_VARIANT: Record<string, 'warning' | 'primary' | 'error'> = {
  emerging: 'warning',
  developing: 'primary',
  critical: 'error',
};

function formatLevelLabel(level: string): string {
  if (!level) return '—';
  return level
    .split('_')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

function ProgressBar({ pct }: { readonly pct: number }) {
  return (
    <div
      className="w-full max-w-[220px] h-1.5 rounded-full bg-[var(--surface-sunken)] overflow-hidden shrink-0"
      aria-hidden="true"
    >
      <div
        className="h-full rounded-full bg-[var(--color-primary-600)] transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

function CourseRow({ course }: { readonly course: AdminStudentProfileCourse }) {
  return (
    <AdminAccordion
      title={
        <span className="flex items-center gap-2 flex-wrap">
          {course.courseTitle}
          <AdminBadge variant={course.enrollmentStatus === 'active' ? 'success' : 'neutral'}>
            {course.enrollmentStatus === 'active' ? 'Active' : 'Switched'}
          </AdminBadge>
          {course.completed && <AdminBadge variant="success">Completed ✓</AdminBadge>}
        </span>
      }
      summary={
        <div className="flex items-center gap-2">
          <ProgressBar pct={course.completionPct} />
          <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
            {course.completedLessons} / {course.totalLessons} ({course.completionPct}%)
          </span>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pt-4">
        <div>
          <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
            Quizzes & Exams
          </p>
          {course.assessments.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              No quizzes or exams recorded for this course yet.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {course.assessments.map((a) => (
                <div
                  key={a.assessmentId}
                  className="flex flex-wrap items-center gap-3 py-2 border-b border-[var(--border)] last:border-b-0"
                >
                  <AdminBadge variant={a.type === 'exam' ? 'purple' : 'info'}>{a.type}</AdminBadge>
                  <span className="text-sm text-[var(--text-primary)] flex-1 min-w-[120px]">{a.title}</span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {a.score} / {a.maxScore}
                  </span>
                  <AdminBadge variant={a.passed ? 'success' : 'error'}>
                    {a.passed ? 'Passed' : 'Failed'}
                  </AdminBadge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap text-sm">
          <span className="text-[var(--text-secondary)]">
            Enrolled <AdminDateCell iso={course.enrolledAt} />
          </span>
          {course.certificate && (
            <Link
              href={`/admin/certificates/${course.certificate.id}`}
              className="text-[var(--color-primary-600)] font-medium no-underline hover:underline"
            >
              View Certificate →
            </Link>
          )}
        </div>
      </div>
    </AdminAccordion>
  );
}

export function StudentProgressClient({ profile }: Props) {
  const { student, placement, subscription, courses, weaknesses, aiTeacherSessions, assessmentResults } = profile;
  const displayName = studentDisplayName(profile);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[var(--border)]">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold text-[var(--text-primary)] m-0">{displayName}</h1>
          {student.email && <p className="text-sm text-[var(--text-muted)] m-0">{student.email}</p>}
        </div>
        <div className="flex items-center gap-2">
          <AdminStatusBadge status={student.status} />
          <span className="text-xs text-[var(--text-muted)]">
            Joined <AdminDateCell iso={student.createdAt} />
          </span>
        </div>
      </div>

      {/* Student summary */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <AdminCard title="Subscription">
          {subscription ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-[var(--text-primary)] font-medium m-0">
                {subscription.planName ?? 'Unknown plan'}
              </p>
              <AdminStatusBadge status={subscription.status} />
              {subscription.currentPeriodEnd && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Renews/ends <AdminDateCell iso={subscription.currentPeriodEnd} />
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No subscription on record.</p>
          )}
        </AdminCard>
      </div>

      {/* Placement */}
      <AdminCard title="Placement">
        {placement ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <AdminBadge variant="primary">{formatLevelLabel(placement.estimatedLevel)}</AdminBadge>
                <span className="text-xs text-[var(--text-muted)]">
                  Completed <AdminDateCell iso={placement.completedAt} />
                </span>
              </div>
              {placement.recommendedCourseTitle && (
                <p className="text-sm text-[var(--text-secondary)] m-0">
                  Recommended course: <span className="font-medium text-[var(--text-primary)]">{placement.recommendedCourseTitle}</span>
                </p>
              )}
              {placement.skillSummary.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {placement.skillSummary.map((skill) => (
                    <AdminBadge key={skill.skillCode} variant={SIGNAL_VARIANT[skill.signal]}>
                      {skill.skillCode}
                    </AdminBadge>
                  ))}
                </div>
              )}
            </div>
            {placement.scorePercent !== null && (
              <div className="flex flex-col items-center justify-center shrink-0 px-4">
                <span className="text-2xl font-semibold text-[var(--text-primary)]">
                  {Math.round(placement.scorePercent)}%
                </span>
                <span className="text-xs text-[var(--text-muted)]">Score</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No placement result yet.</p>
        )}
      </AdminCard>

      {/* Course progress summary — moved here from the list table to keep it detailed. */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <AdminCard title="Overall Progress">
          {courses.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No progress to show yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {courses.map((c) => (
                <div key={c.enrollmentId} className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-secondary)] flex-1 min-w-[100px] truncate">
                    {c.courseTitle}
                  </span>
                  <ProgressBar pct={c.completionPct} />
                  <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">{c.completionPct}%</span>
                </div>
              ))}
            </div>
          )}
        </AdminCard>
      </div>

      {/* Courses */}
      <div className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-[var(--text-primary)] m-0">Courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No course enrollments found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {courses.map((course) => (
              <CourseRow key={course.enrollmentId} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* Assessment Results */}
      <AdminAccordion
        title="Assessment Results"
        summary={<span className="text-xs text-[var(--text-muted)]">{assessmentResults.length}</span>}
      >
        {assessmentResults.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] pt-4">No assessment attempts recorded yet.</p>
        ) : (
          <div className="flex flex-col gap-2 pt-4">
            {assessmentResults.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center gap-3 py-2 border-b border-[var(--border)] last:border-b-0"
              >
                <AdminBadge variant={a.type === 'exam' ? 'purple' : 'info'}>{a.type}</AdminBadge>
                <span className="text-sm text-[var(--text-primary)] flex-1 min-w-[140px]">{a.title}</span>
                <span className="text-xs text-[var(--text-muted)] min-w-[100px]">
                  {a.courseTitle ?? 'Not linked to a course'}
                </span>
                <span className="text-sm text-[var(--text-secondary)]">
                  {a.score} / {a.maxScore}
                </span>
                <AdminBadge variant={a.passed ? 'success' : 'error'}>{a.passed ? 'Passed' : 'Failed'}</AdminBadge>
                <span className="text-xs text-[var(--text-muted)]">
                  <AdminDateCell iso={a.attemptedAt} />
                </span>
              </div>
            ))}
          </div>
        )}
      </AdminAccordion>

      {/* Weaknesses */}
      <AdminAccordion title="Skill Weaknesses" summary={<span className="text-xs text-[var(--text-muted)]">{weaknesses.length}</span>}>
        {weaknesses.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] pt-4">No weaknesses currently tracked.</p>
        ) : (
          <div className="flex flex-col gap-2 pt-4">
            {weaknesses.map((w) => (
              <div
                key={w.id}
                className="flex flex-wrap items-center gap-3 py-2 border-b border-[var(--border)] last:border-b-0"
              >
                <span className="text-sm text-[var(--text-primary)] flex-1 min-w-[140px]">
                  {w.skillTitle ?? w.skillId}
                </span>
                <AdminBadge variant={SEVERITY_VARIANT[w.severity] ?? 'neutral'}>{w.severity}</AdminBadge>
                <AdminStatusBadge status={w.status} />
                <span className="text-xs text-[var(--text-muted)]">
                  Detected <AdminDateCell iso={w.detectedAt} />
                </span>
              </div>
            ))}
          </div>
        )}
      </AdminAccordion>

      {/* AI Teacher Activity */}
      <AdminAccordion
        title="AI Teacher Activity"
        summary={<span className="text-xs text-[var(--text-muted)]">{aiTeacherSessions.length}</span>}
      >
        {aiTeacherSessions.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] pt-4">No AI Teacher sessions yet.</p>
        ) : (
          <div className="flex flex-col gap-2 pt-4">
            {aiTeacherSessions.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center gap-3 py-2 border-b border-[var(--border)] last:border-b-0"
              >
                <span className="text-sm text-[var(--text-primary)] flex-1 min-w-[140px]">{s.contextRef}</span>
                <AdminStatusBadge status={s.status} />
                <span className="text-xs text-[var(--text-muted)]">
                  Created <AdminDateCell iso={s.createdAt} />
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  Updated <AdminDateCell iso={s.updatedAt} />
                </span>
              </div>
            ))}
          </div>
        )}
      </AdminAccordion>
    </div>
  );
}
