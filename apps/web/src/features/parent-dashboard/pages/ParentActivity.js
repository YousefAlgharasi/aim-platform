// P12-062: Parent Activity UI — read-only backend data.

import { useState, useEffect } from 'react';
import { getChildActivity } from '../api';
import { ParentCard, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentActivity({ childId }) {
  const [activities, setActivities] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childId) { setStatus('empty'); return; }
    let cancelled = false;
    setStatus('loading');
    getChildActivity(childId)
      .then((data) => {
        if (!cancelled) {
          setActivities(data || []);
          setStatus((data || []).length > 0 ? 'ready' : 'empty');
        }
      })
      .catch((err) => { if (!cancelled) { setError(err.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, [childId]);

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;
  if (status === 'empty') return <ParentEmptyState message="لا يوجد نشاط مسجل." />;

  return (
    <div className="parent-activity">
      <h2 className="parent-page__title">النشاط الأخير</h2>
      <div className="parent-activity__list">
        {activities.map((a, i) => (
          <ParentCard key={a.id || i}>
            <div className="parent-activity__item">
              <span className="parent-activity__type">{a.activityType || a.type}</span>
              <span className="parent-activity__date">{a.date || a.timestamp}</span>
            </div>
            {a.description && <p className="parent-activity__desc">{a.description}</p>}
          </ParentCard>
        ))}
      </div>
    </div>
  );
}

export default ParentActivity;
