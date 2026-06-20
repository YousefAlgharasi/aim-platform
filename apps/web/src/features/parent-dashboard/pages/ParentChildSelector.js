// P12-052: Parent Child Selector UI
// Displays linked children from backend API. Does not compute access — backend decides.

import { useState, useEffect } from 'react';
import { listChildren } from '../api';
import { ParentLoadingState, ParentEmptyState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentChildSelector({ selectedChildId, onSelectChild }) {
  const [children, setChildren] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    listChildren()
      .then((data) => {
        if (cancelled) return;
        setChildren(data || []);
        setStatus(data && data.length > 0 ? 'ready' : 'empty');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      });
    return () => { cancelled = true; };
  }, []);

  if (status === 'loading') return <ParentLoadingState message="جاري تحميل قائمة الأبناء..." />;
  if (status === 'error') return <ParentErrorState message={error} />;
  if (status === 'empty') return <ParentEmptyState message="لا يوجد أبناء مرتبطون بحسابك. يمكنك ربط طفل عبر دعوة." />;

  return (
    <div className="parent-child-selector" role="listbox" aria-label="اختيار الطفل">
      {children.map((child) => (
        <button
          key={child.childId}
          className={`parent-child-selector__item${selectedChildId === child.childId ? ' parent-child-selector__item--active' : ''}`}
          onClick={() => onSelectChild?.(child.childId)}
          role="option"
          aria-selected={selectedChildId === child.childId}
          type="button"
        >
          <span className="parent-child-selector__name">{child.displayName}</span>
          <span className="parent-child-selector__relation">{child.relationshipType}</span>
        </button>
      ))}
    </div>
  );
}

export default ParentChildSelector;
