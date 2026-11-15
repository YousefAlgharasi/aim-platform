'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AdminAccordion, AdminBadge, AdminCard, AdminDateCell } from '../../../shared/components/Misc';
import type { AdminStudentCourseProgress, CourseProgressCourse, PracticeCounts } from '../../../core/api/admin-student-course-progress-api';

type Props = { readonly data: AdminStudentCourseProgress };

function Bar({ pct }: { readonly pct: number }) {
  return (
    <div className="w-full max-w-[220px] h-1.5 rounded-full bg-[var(--surface-sunken)] overflow-hidden shrink-0" aria-hidden="true">
      <div className="h-full rounded-full bg-[var(--color-primary-600)]" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

function Stat({ label, value, hint }: { readonly label: string; readonly value: string | number; readonly hint?: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-[110px]">
      <span className="text-xs text-[var(--text-muted)]">{label}</span>
      <span className="text-xl font-semibold text-[var(--text-primary)]">{value}</span>
      {hint && <span className="text-xs text-[var(--text-muted)]">{hint}</span>}
    </div>
  );
}

function practiceText(p: PracticeCounts): string {
  return p.attempts === 0 ? 'No practice yet' : `${p.correct} right · ${p.wrong} wrong · ${p.accuracyPercent ?? 0}%`;
}

function CourseView({ course }: { readonly course: CourseProgressCourse }) {
  return (
    <div className="flex flex-col gap-4">
      <AdminCard>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)] m-0">{course.title}</h2>
          <AdminBadge variant={course.enrollmentStatus === 'active' ? 'success' : 'neutral'}>
            {course.enrollmentStatus === 'active' ? 'Active' : 'Switched'}
          </AdminBadge>
          {course.certificate && <AdminBadge variant="success">Certified ✓</AdminBadge>}
        </div>
        <div className="flex flex-wrap gap-6">
          <Stat label="Lessons done" value={`${course.completedLessons} / ${course.totalLessons}`} hint={`${course.completionPct}% complete`} />
          <Stat label="Practice answers" value={course.practice.attempts} hint={practiceText(course.practice)} />
          <Stat label="Quizzes & exams" value={course.assessments.length} hint={`${course.assessments.filter((a) => a.passed).length} passed`} />
        </div>
        <div className="flex items-center gap-3 mt-3 flex-wrap text-xs text-[var(--text-muted)]">
          <Bar pct={course.completionPct} />
          <span>Enrolled <AdminDateCell iso={course.enrolledAt} /></span>
          {course.lastActiveAt && <span>Last active <AdminDateCell iso={course.lastActiveAt} /></span>}
        </div>
      </AdminCard>

      <AdminCard title="Certificate">
        {course.certificate ? (
          <div className="flex flex-wrap items-center gap-4">
            <AdminBadge variant="success">Issued</AdminBadge>
            <span className="text-sm text-[var(--text-secondary)]">
              <AdminDateCell iso={course.certificate.issuedAt} />
            </span>
            {course.certificate.totalPoints !== null && (
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                {course.certificate.totalPoints} / {course.certificate.maxPoints ?? 1000} points
              </span>
            )}
            <Link href={`/admin/certificates/${course.certificate.id}`} className="text-[var(--color-primary-600)] font-medium no-underline hover:underline">
              View certificate →
            </Link>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)] m-0">
            No certificate yet — issued when all {course.totalLessons} lessons are completed ({course.completedLessons} done).
          </p>
        )}
      </AdminCard>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide m-0">Chapters & lessons</h3>
        {course.chapters.length === 0 && <p className="text-sm text-[var(--text-muted)]">This course has no published lessons.</p>}
        {course.chapters.map((ch) => (
          <AdminAccordion
            key={ch.chapterId}
            title={<span>{ch.title} <span className="text-xs text-[var(--text-muted)]">· {ch.levelTitle}</span></span>}
            summary={
              <div className="flex items-center gap-2">
                <Bar pct={ch.totalLessons ? (ch.completedLessons / ch.totalLessons) * 100 : 0} />
                <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">{ch.completedLessons} / {ch.totalLessons}</span>
              </div>
            }
          >
            <div className="flex flex-col pt-3">
              {ch.lessons.map((l) => (
                <div key={l.lessonId} className="flex flex-wrap items-center gap-3 py-2 border-b border-[var(--border)] last:border-b-0">
                  <span className="text-sm text-[var(--text-primary)] flex-1 min-w-[160px]">{l.title}</span>
                  <AdminBadge variant={l.completed ? 'success' : l.percent > 0 ? 'primary' : 'neutral'}>
                    {l.completed ? 'Completed' : l.percent > 0 ? `${l.percent}%` : 'Not started'}
                  </AdminBadge>
                  <span className="text-xs text-[var(--text-secondary)] min-w-[190px]">{practiceText(l.practice)}</span>
                  <span className="text-xs text-[var(--text-muted)] min-w-[110px]">
                    {l.completedAt ? <>Done <AdminDateCell iso={l.completedAt} /></> : l.lastActiveAt ? <>Active <AdminDateCell iso={l.lastActiveAt} /></> : '—'}
                  </span>
                </div>
              ))}
            </div>
          </AdminAccordion>
        ))}
      </div>

      <AdminAccordion title="Quizzes & exams" summary={<span className="text-xs text-[var(--text-muted)]">{course.assessments.length}</span>}>
        {course.assessments.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] pt-4">No quizzes or exams taken in this course yet.</p>
        ) : (
          <div className="flex flex-col gap-2 pt-4">
            {course.assessments.map((a) => (
              <div key={a.assessmentId} className="flex flex-wrap items-center gap-3 py-2 border-b border-[var(--border)] last:border-b-0">
                <AdminBadge variant={a.type === 'exam' ? 'purple' : 'info'}>{a.type}</AdminBadge>
                <span className="text-sm text-[var(--text-primary)] flex-1 min-w-[140px]">{a.title}</span>
                <span className="text-sm text-[var(--text-secondary)]">{a.scorePercent} / 100</span>
                <AdminBadge variant={a.passed ? 'success' : 'error'}>{a.passed ? 'Passed' : 'Failed'}</AdminBadge>
              </div>
            ))}
          </div>
        )}
      </AdminAccordion>
    </div>
  );
}

export function StudentCourseProgressClient({ data }: Props) {
  const [courseId, setCourseId] = useState(data.courses[0]?.courseId ?? '');
  const course = data.courses.find((c) => c.courseId === courseId) ?? data.courses[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[var(--text-primary)] m-0">Course progress</h2>
        {data.courses.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            Course
            <select
              value={course?.courseId ?? ''}
              onChange={(e) => setCourseId(e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] px-3 py-1.5 text-sm"
              aria-label="Select course"
            >
              {data.courses.map((c) => (
                <option key={c.courseId} value={c.courseId}>
                  {c.title} — {c.completionPct}%{c.enrollmentStatus === 'active' ? '' : ' (switched)'}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {course ? <CourseView key={course.courseId} course={course} /> : <p className="text-sm text-[var(--text-muted)]">The student is not enrolled in any course.</p>}

      <h2 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-0">Everything else</h2>
      <AdminCard>
        <div className="flex flex-wrap gap-6">
          <Stat label="XP (speaking/writing)" value={data.xpTotal} />
          <Stat label="Open mistakes" value={data.mistakes.open} hint={`${data.mistakes.resolved} fixed`} />
          <Stat label="Achievements" value={data.achievements.length} />
          <Stat label="Other practice" value={data.otherPractice.attempts} hint={`Drills & reviews: ${practiceText(data.otherPractice)}`} />
        </div>
      </AdminCard>

      <AdminAccordion title="Speaking & writing practice" summary={<span className="text-xs text-[var(--text-muted)]">{data.speakingWriting.length}</span>}>
        {data.speakingWriting.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] pt-4">No speaking or writing practice yet.</p>
        ) : (
          <div className="flex flex-col gap-2 pt-4">
            {data.speakingWriting.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 py-2 border-b border-[var(--border)] last:border-b-0">
                <AdminBadge variant={s.kind === 'speaking' ? 'purple' : 'info'}>{s.kind}</AdminBadge>
                <span className="text-xs text-[var(--text-muted)]">{s.levelCode ?? '—'}</span>
                <AdminBadge variant={s.status === 'completed' ? 'success' : 'warning'}>{s.status}</AdminBadge>
                <span className="text-sm text-[var(--text-secondary)] flex-1">{s.score !== null ? `Score ${s.score}` : 'No score'} · +{s.xpAwarded} XP</span>
                <span className="text-xs text-[var(--text-muted)]"><AdminDateCell iso={s.completedAt ?? s.startedAt} /></span>
              </div>
            ))}
          </div>
        )}
      </AdminAccordion>

      <AdminAccordion title="Mistakes to fix" summary={<span className="text-xs text-[var(--text-muted)]">{data.mistakes.open} open</span>}>
        {data.mistakes.topOpenSkills.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] pt-4">No open mistakes.</p>
        ) : (
          <div className="flex flex-col gap-2 pt-4">
            {data.mistakes.topOpenSkills.map((s) => (
              <div key={s.skillKey} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-b-0">
                <span className="text-sm text-[var(--text-primary)] flex-1">{s.title ?? s.skillKey}</span>
                <AdminBadge variant="warning">{s.count} open</AdminBadge>
              </div>
            ))}
          </div>
        )}
      </AdminAccordion>

      <AdminAccordion title="Achievements & level" summary={<span className="text-xs text-[var(--text-muted)]">{data.achievements.length}</span>}>
        <div className="flex flex-col gap-2 pt-4">
          {data.levelState.map((l) => (
            <div key={l.track} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="flex-1">Level track: {l.track}</span>
              <span>Level {l.currentRank} (unlocked up to {l.maxUnlockedRank})</span>
            </div>
          ))}
          {data.achievements.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No achievements unlocked yet.</p>
          ) : (
            data.achievements.map((a) => (
              <div key={a.key} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-b-0">
                <span className="text-sm text-[var(--text-primary)] flex-1">🏆 {a.title}</span>
                <span className="text-xs text-[var(--text-muted)]"><AdminDateCell iso={a.unlockedAt} /></span>
              </div>
            ))
          )}
        </div>
      </AdminAccordion>
    </div>
  );
}
