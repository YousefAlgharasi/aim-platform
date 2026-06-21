// P18-070: Parent AI Read-Only Summary UI
// Renders the backend-computed AI Teacher/Voice Tutor usage counts for a
// linked, consented child. This page never reads conversation/voice
// content, never derives mastery/level/weakness/difficulty/recommendation/
// review-schedule values, and never calls an AI provider — every number
// shown is a pass-through of ParentAiUsageSummaryEntity from
// GET /api/v1/parent/children/:childId/ai-summary.

import { useState, useEffect } from 'react';
import { getChildAiUsageSummary } from '../api';
import { ParentCard, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentAiSummary({ childId }) {
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
    getChildAiUsageSummary(childId)
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
    return <ParentEmptyState message="لا يوجد استخدام للمعلم الذكي مسجل لهذا الابن." />;
  }

  return (
    <div className="parent-ai-summary">
      <h2 className="parent-page__title">ملخص استخدام المعلم الذكي</h2>

      <ParentCard title="محادثات المعلم الذكي النصية">
        <p className="parent-ai-summary__count">{summary.textChatSessionCount}</p>
      </ParentCard>

      <ParentCard title="جلسات المعلم الصوتي">
        <p className="parent-ai-summary__count">{summary.voiceSessionCount}</p>
      </ParentCard>

      {summary.lastActivityAt && (
        <p className="parent-text--muted">آخر نشاط: {summary.lastActivityAt}</p>
      )}
    </div>
  );
}

export default ParentAiSummary;
