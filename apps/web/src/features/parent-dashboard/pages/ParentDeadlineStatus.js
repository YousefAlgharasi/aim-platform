// P12-061: Parent Deadline Status UI

import { useState, useEffect } from 'react';
import { getChildAssessments } from '../api';
import { ParentCard, ParentBadge, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

const DEADLINE_VARIANT = {
  upcoming: 'info',
  due_soon: 'warning',
  missed: 'error',
  completed: 'success',
};

const DEADLINE_LABEL = {
  upcoming: 'قادم',
  due_soon: 'قريب',
  missed: 'فائت',
  completed: 'مكتمل',
};

function ParentDeadlineStatus({ childId }) {
  const [deadlines, setDeadlines] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childId) { setStatus('empty'); return; }
    let cancelled = false;
    setStatus('loading');
    getChildAssessments(childId)
      .then((data) => {
        if (!cancelled) {
          const items = (data || []).filter((a) => a.dueDate);
          setDeadlines(items);
          setStatus(items.length > 0 ? 'ready' : 'empty');
        }
      })
      .catch((err) => { if (!cancelled) { setError(err.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, [childId]);

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;
  if (status === 'empty') return <ParentEmptyState message="لا توجد مواعيد نهائية." />;

  return (
    <div className="parent-deadline-status">
      <h2 className="parent-page__title">المواعيد النهائية</h2>
      <div className="parent-deadline-status__grid">
        {deadlines.map((d, i) => (
          <ParentCard key={d.id || i} title={d.title}>
            <div className="parent-deadline-status__row">
              <span>{d.dueDate}</span>
              <ParentBadge
                label={DEADLINE_LABEL[d.deadlineStatus || d.status] || d.status}
                variant={DEADLINE_VARIANT[d.deadlineStatus || d.status] || 'neutral'}
              />
            </div>
          </ParentCard>
        ))}
      </div>
    </div>
  );
}

export default ParentDeadlineStatus;
