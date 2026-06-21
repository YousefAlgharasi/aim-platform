// P12-060: Parent Assessments UI — read-only backend data.

import { useState, useEffect } from 'react';
import { getChildAssessments } from '../api';
import { ParentTable, ParentBadge, ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

const STATUS_VARIANT = {
  completed: 'success',
  upcoming: 'info',
  missed: 'error',
  in_progress: 'warning',
};

const STATUS_LABEL = {
  completed: 'مكتمل',
  upcoming: 'قادم',
  missed: 'فائت',
  in_progress: 'جاري',
};

const COLUMNS = [
  { key: 'title', label: 'التقييم' },
  { key: 'type', label: 'النوع' },
  { key: 'score', label: 'الدرجة', render: (row) => row.score != null ? row.score : '—' },
  { key: 'status', label: 'الحالة', render: (row) => (
    <ParentBadge label={STATUS_LABEL[row.status] || row.status} variant={STATUS_VARIANT[row.status] || 'neutral'} />
  )},
  { key: 'dueDate', label: 'الموعد', render: (row) => row.dueDate || '—' },
];

function ParentAssessments({ childId }) {
  const [assessments, setAssessments] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childId) { setStatus('empty'); return; }
    let cancelled = false;
    setStatus('loading');
    getChildAssessments(childId)
      .then((data) => { if (!cancelled) { setAssessments(data || []); setStatus('ready'); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, [childId]);

  if (status === 'loading') return <ParentLoadingState />;
  if (status === 'error') return <ParentErrorState message={error} />;
  if (status === 'empty') return <ParentEmptyState message="يرجى اختيار طفل." />;

  return (
    <div className="parent-assessments">
      <h2 className="parent-page__title">التقييمات</h2>
      <ParentTable columns={COLUMNS} rows={assessments} emptyMessage="لا توجد تقييمات." />
    </div>
  );
}

export default ParentAssessments;
