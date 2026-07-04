// P18-071: Parent AI Safety Summary UI
// Renders the backend-computed AI Teacher/Voice Tutor blocked-interaction
// count for a linked, consented child. This page never reads rejected
// raw message/audio/transcript content, never exposes the internal
// safety reason-category taxonomy, and never derives mastery/level/
// weakness/difficulty/recommendation/review-schedule values — every
// number shown is a pass-through of ParentAiSafetySummaryEntity from
// GET /api/v1/parent/children/:childId/ai-safety-summary.

import { useState, useEffect } from 'react';
import { getChildAiSafetySummary } from '../api';
import { ParentCard, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentAiSafetySummary({ childId }) {
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childId) {
      setStatus('empty');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    getChildAiSafetySummary(childId)
      .then((data) => {
        if (cancelled) return;
        setSummary(data);
        setStatus(data ? 'ready' : 'empty');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [childId]);

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;
  if (status === 'empty' || !summary) {
    return <ParentEmptyState message="لا توجد بيانات سلامة المعلم الذكي لهذا الابن." />;
  }

  return (
    <div className="parent-ai-safety-summary">
      <h2 className="parent-page__title">ملخص سلامة المعلم الذكي</h2>

      <ParentCard title="التفاعلات المحظورة">
        <p className="parent-ai-safety-summary__count">{summary.blockedInteractionCount}</p>
        <p className="parent-text--muted">
          عدد الردود التي تم حظرها تلقائيًا بواسطة أنظمة السلامة. لا يتم عرض أي محتوى محادثة أو صوت.
        </p>
      </ParentCard>
    </div>
  );
}

export default ParentAiSafetySummary;
