// P12-063: Parent Reports UI — read-only backend-approved reports.

import { useState, useEffect } from 'react';
import { getChildReports } from '../api';
import { ParentCard, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentReports({ childId }) {
  const [reports, setReports] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childId) { setStatus('empty'); return; }
    let cancelled = false;
    setStatus('loading');
    getChildReports(childId, period)
      .then((data) => {
        if (!cancelled) {
          setReports(data || []);
          setStatus((data || []).length > 0 ? 'ready' : 'empty');
        }
      })
      .catch((err) => { if (!cancelled) { setError(err.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, [childId, period]);

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;

  return (
    <div className="parent-reports">
      <h2 className="parent-page__title">التقارير</h2>
      <div className="parent-reports__filter">
        <label htmlFor="report-period" className="parent-form__label">الفترة:</label>
        <select
          id="report-period"
          className="parent-form__select"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="weekly">أسبوعي</option>
          <option value="monthly">شهري</option>
        </select>
      </div>

      {status === 'empty' ? (
        <ParentEmptyState message="لا توجد تقارير للفترة المحددة." />
      ) : (
        <div className="parent-reports__list">
          {reports.map((r, i) => (
            <ParentCard key={r.id || i} title={r.title || `تقرير ${r.period}`}>
              <p>{r.summary || 'لا توجد تفاصيل.'}</p>
              {r.generatedAt && <p className="parent-text--muted">تاريخ الإنشاء: {r.generatedAt}</p>}
            </ParentCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default ParentReports;
