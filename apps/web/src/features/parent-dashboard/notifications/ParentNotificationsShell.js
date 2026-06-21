// P13-061: Parent Notification UI Shell
//
// Establishes the parent notification UI boundary, mirroring the
// ParentDashboardShell (P12-047) state-machine pattern. This shell never
// computes notification eligibility, delivery state, or quiet-hour
// enforcement — it only renders backend-returned state once the inbox
// (P13-062), preferences (P13-063), and deadline reminder (P13-064) tasks
// wire real data through it.

import '../ParentDashboardShell.css';

function LoadingState() {
  return (
    <p
      className="parent-dashboard__status parent-dashboard__status--loading"
      role="status"
    >
      جاري تحميل الإشعارات...
    </p>
  );
}

function EmptyState({ message }) {
  return (
    <p
      className="parent-dashboard__status parent-dashboard__status--empty"
      role="status"
    >
      {message || 'لا توجد إشعارات بعد.'}
    </p>
  );
}

function ErrorState({ message }) {
  return (
    <p
      className="parent-dashboard__status parent-dashboard__status--error"
      role="alert"
    >
      {message || 'حدث خطأ أثناء تحميل الإشعارات.'}
    </p>
  );
}

function ParentNotificationsShell({
  status = 'empty',
  errorMessage,
  emptyMessage,
  children,
}) {
  return (
    <section className="parent-dashboard" aria-label="إشعارات الوالدين">
      <header className="parent-dashboard__header">
        <p className="parent-dashboard__eyebrow">الوالدين</p>
        <h1>الإشعارات</h1>
      </header>

      <div className="parent-dashboard__body">
        {status === 'loading' && <LoadingState />}
        {status === 'error' && <ErrorState message={errorMessage} />}
        {status === 'empty' && <EmptyState message={emptyMessage} />}
        {status === 'ready' && children}
      </div>
    </section>
  );
}

export default ParentNotificationsShell;
