// P12-047: Create Parent Dashboard Feature Shell
import { useState, useEffect } from 'react';
import ParentDashboardShell from '../features/parent-dashboard';
import { listChildren } from '../features/parent-dashboard/api';

function ParentDashboard() {
  const [status, setStatus] = useState('loading');
  const [children, setChildren] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    listChildren()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.children ?? [];
        if (list.length === 0) {
          setStatus('empty');
        } else {
          setChildren(list);
          setStatus('ready');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(err.message || 'حدث خطأ أثناء تحميل لوحة الوالدين.');
        setStatus('error');
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <main className="pilot-main">
      <ParentDashboardShell status={status} errorMessage={errorMessage}>
        {children.map((child) => (
          <div key={child.id || child.student_id} className="parent-dashboard__child">
            <p>{child.name || child.student_name || 'طالب'}</p>
          </div>
        ))}
      </ParentDashboardShell>
    </main>
  );
}

export default ParentDashboard;
