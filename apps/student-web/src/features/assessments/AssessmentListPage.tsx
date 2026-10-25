import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { EmptyState } from '../../components/common/EmptyState';
import { deadlineStatusLabel, fetchAssessments, type AssessmentListItem } from './assessmentsApi';
import { statusTone } from './assessmentUi';
import { Badge, BODY, CARD, PageHeader } from '../placement/ui';

export function AssessmentListPage() {
  const [assessments, setAssessments] = useState<AssessmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError('');
    fetchAssessments()
      .then((a) => setAssessments(a ?? []))
      .catch((err) => setError(getErrorMessage(err, 'Failed to load assessments')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchAll} />;

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col gap-5">
      <PageHeader
        eyebrow="Assessments"
        title="Assessments"
        subtitle="Quizzes and exams assigned to you."
        action={
          <Link
            to="/assessments/deadlines"
            className="shrink-0 inline-flex items-center h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-[#4F46E5] dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Deadlines
          </Link>
        }
      />
      {assessments.length === 0 ? (
        <EmptyState title="No assessments" message="Assessments will appear here when available." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {assessments.map((a) => (
            <Link
              key={a.id}
              to={`/assessments/${a.id}`}
              className={`${CARD} p-4 sm:p-5 flex flex-col gap-2.5 no-underline hover:ring-[#C7D2FE] dark:hover:ring-indigo-700 hover:shadow-md transition-all duration-200`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={a.type === 'quiz' ? 'indigo' : 'violet'}>{a.type}</Badge>
                {a.deadlineStatus && (
                  <Badge tone={statusTone(a.deadlineStatus)}>{deadlineStatusLabel(a.deadlineStatus)}</Badge>
                )}
              </div>
              <h2 className="m-0 text-base font-bold leading-snug text-slate-900 dark:text-white">{a.title}</h2>
              {a.description && <p className={BODY}>{a.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
