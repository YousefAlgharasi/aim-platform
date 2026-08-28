'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminButton,
  AdminCard,
  AdminFormField,
  AdminSelect,
} from '../../../shared/components/Misc';

export type AssessmentLinkageOption = {
  readonly id: string;
  readonly title: string;
};

type Props = {
  readonly assessmentId: string;
  readonly courseId: string | null;
  readonly chapterId: string | null;
  readonly courses: readonly AssessmentLinkageOption[];
  readonly chapters: readonly AssessmentLinkageOption[];
  readonly disabled?: boolean;
  readonly onUpdateLinkage: (data: {
    courseId: string | null;
    chapterId: string | null;
  }) => Promise<{ error?: string }>;
};

const NONE_VALUE = '';

export function AssessmentLinkage({
  assessmentId,
  courseId,
  chapterId,
  courses,
  chapters,
  disabled,
  onUpdateLinkage,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId ?? NONE_VALUE);
  const [selectedChapterId, setSelectedChapterId] = useState(chapterId ?? NONE_VALUE);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const courseTitle = courses.find((c) => c.id === courseId)?.title ?? null;
  const chapterTitle = chapters.find((c) => c.id === chapterId)?.title ?? null;

  function handleStartEdit() {
    setSelectedCourseId(courseId ?? NONE_VALUE);
    setSelectedChapterId(chapterId ?? NONE_VALUE);
    setError(null);
    setEditing(true);
  }

  function handleCancel() {
    setSelectedCourseId(courseId ?? NONE_VALUE);
    setSelectedChapterId(chapterId ?? NONE_VALUE);
    setError(null);
    setEditing(false);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await onUpdateLinkage({
        courseId: selectedCourseId === NONE_VALUE ? null : selectedCourseId,
        chapterId: selectedChapterId === NONE_VALUE ? null : selectedChapterId,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
        router.refresh();
      }
    });
  }

  if (!editing) {
    return (
      <AdminCard
        title="Course & Chapter Linkage"
        description="Link this assessment to a course to make it that course's final exam, or to a chapter to gate it behind that chapter's lessons."
      >
        <dl className="aim-linkage-grid">
          <div className="aim-linkage-row">
            <dt>Final Exam For</dt>
            <dd>{courseTitle ?? 'Not linked to a course'}</dd>
          </div>
          <div className="aim-linkage-row">
            <dt>Gated By Chapter</dt>
            <dd>{chapterTitle ?? 'Not linked to a chapter'}</dd>
          </div>
        </dl>

        {!disabled && (
          <div style={{ marginBlockStart: 'var(--space-16)' }}>
            <AdminButton variant="primary" onClick={handleStartEdit}>
              Edit Linkage
            </AdminButton>
          </div>
        )}

        <style>{`
          .aim-linkage-grid {
            display: grid;
            gap: var(--space-12);
            margin: 0;
          }
          .aim-linkage-row {
            display: grid;
            grid-template-columns: 180px 1fr;
            gap: var(--space-8);
            align-items: start;
          }
          .aim-linkage-row dt {
            font-weight: var(--weight-semibold);
            font-size: 13px;
            color: var(--text-secondary);
          }
          .aim-linkage-row dd {
            margin: 0;
            font-size: 14px;
          }
        `}</style>
      </AdminCard>
    );
  }

  return (
    <AdminCard title="Edit Course & Chapter Linkage">
      {error && (
        <div className="admin-error-banner" role="alert" style={{ marginBlockEnd: 'var(--space-16)' }}>
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <AdminFormField
          id={`linkage-course-${assessmentId}`}
          label="Course (final exam for)"
          hint="Select None to remove this assessment from a course's final exam requirement."
        >
          <AdminSelect
            id={`linkage-course-${assessmentId}`}
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={isPending}
          >
            <option value={NONE_VALUE}>None</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </AdminSelect>
        </AdminFormField>

        <AdminFormField
          id={`linkage-chapter-${assessmentId}`}
          label="Chapter (gates completion of)"
          hint="Select None to remove the chapter-completion gate."
        >
          <AdminSelect
            id={`linkage-chapter-${assessmentId}`}
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            disabled={isPending}
          >
            <option value={NONE_VALUE}>None</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </AdminSelect>
        </AdminFormField>
      </div>

      <div className="flex gap-3 mt-4">
        <AdminButton variant="primary" onClick={handleSubmit} disabled={isPending} loading={isPending}>
          Save Linkage
        </AdminButton>
        <AdminButton variant="secondary" onClick={handleCancel} disabled={isPending}>
          Cancel
        </AdminButton>
      </div>
    </AdminCard>
  );
}
