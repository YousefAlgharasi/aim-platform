// P12-057: Parent Progress Summary UI — read-only, backend-approved data.

import { useState, useEffect } from 'react';
import { getChildProgress } from '../api';
import { ParentCard, ParentProgressBlock, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentProgressSummary({ childId }) {
  const [progress, setProgress] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childId) { setStatus('empty'); return; }
    let cancelled = false;
    setStatus('loading');
    getChildProgress(childId)
      .then((data) => { if (!cancelled) { setProgress(data); setStatus('ready'); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, [childId]);

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;
  if (status === 'empty' || !progress) return <ParentEmptyState message="يرجى اختيار طفل." />;

  return (
    <div className="parent-progress-summary">
      <h2 className="parent-page__title">ملخص التقدم</h2>
      <ParentCard title="التقدم الدراسي">
        <ParentProgressBlock label="الإنجاز العام" value={progress.overallProgress ?? 0} />
        {(progress.subjects || []).map((s) => (
          <ParentProgressBlock key={s.subjectId} label={s.subjectName} value={s.progress ?? 0} />
        ))}
      </ParentCard>
    </div>
  );
}

export default ParentProgressSummary;
