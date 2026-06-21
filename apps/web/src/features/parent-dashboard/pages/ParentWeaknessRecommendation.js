// P12-059: Parent Weakness and Recommendation UI — read-only backend data.

import { useState, useEffect } from 'react';
import { getChildProgress } from '../api';
import { ParentCard, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentWeaknessRecommendation({ childId }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childId) { setStatus('empty'); return; }
    let cancelled = false;
    setStatus('loading');
    getChildProgress(childId)
      .then((d) => { if (!cancelled) { setData(d); setStatus('ready'); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, [childId]);

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;
  if (status === 'empty' || !data) return <ParentEmptyState message="يرجى اختيار طفل." />;

  const weaknesses = data.weaknesses || [];
  const recommendations = data.recommendations || [];

  return (
    <div className="parent-weakness-recommendation">
      <h2 className="parent-page__title">نقاط الضعف والتوصيات</h2>

      <ParentCard title="نقاط الضعف">
        {weaknesses.length === 0 ? (
          <p className="parent-text--muted">لا توجد نقاط ضعف مسجلة.</p>
        ) : (
          <ul className="parent-list">
            {weaknesses.map((w, i) => (
              <li key={i} className="parent-list__item">{w.description || w.skillName}</li>
            ))}
          </ul>
        )}
      </ParentCard>

      <ParentCard title="التوصيات">
        {recommendations.length === 0 ? (
          <p className="parent-text--muted">لا توجد توصيات حالياً.</p>
        ) : (
          <ul className="parent-list">
            {recommendations.map((r, i) => (
              <li key={i} className="parent-list__item">{r.description || r.text}</li>
            ))}
          </ul>
        )}
      </ParentCard>
    </div>
  );
}

export default ParentWeaknessRecommendation;
