// P12-056: Parent Dashboard Home UI
// Read-only overview from backend — no client-side computation.

import { useState, useEffect } from 'react';
import { getDashboardSummary } from '../api';
import { ParentCard, ParentProgressBlock, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentDashboardHome({ childId }) {
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childId) { setStatus('empty'); return; }
    let cancelled = false;
    setStatus('loading');
    getDashboardSummary(childId)
      .then((data) => { if (!cancelled) { setSummary(data); setStatus('ready'); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, [childId]);

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;
  if (status === 'empty' || !summary) return <ParentEmptyState message="يرجى اختيار طفل لعرض الملخص." />;

  return (
    <div className="parent-dashboard-home">
      <h2 className="parent-page__title">ملخص لوحة المتابعة</h2>
      <div className="parent-dashboard-home__grid">
        <ParentCard title="التقدم العام">
          <ParentProgressBlock label="الإنجاز" value={summary.overallProgress ?? 0} />
        </ParentCard>

        <ParentCard title="المهارات النشطة">
          <p className="parent-dashboard-home__stat">{summary.activeSkillsCount ?? 0}</p>
        </ParentCard>

        <ParentCard title="التقييمات القادمة">
          <p className="parent-dashboard-home__stat">{summary.upcomingAssessmentsCount ?? 0}</p>
        </ParentCard>

        <ParentCard title="النشاط الأخير">
          <p className="parent-dashboard-home__recent">
            {summary.lastActivityDate || 'لا يوجد نشاط مسجل.'}
          </p>
        </ParentCard>
      </div>
    </div>
  );
}

export default ParentDashboardHome;
