// P12-047: Create Parent Dashboard Feature Shell
// Establishes the parent UI boundary: a self-contained feature folder with
// its own loading/empty/error states. This shell never computes mastery,
// scores, weakness, or recommendations — it only renders whatever the
// backend's parent-facing read APIs (see docs/phase-12/parent-api-contracts.md)
// return.

import './ParentDashboardShell.css';

function LoadingState() {
  return (
    <p className="parent-dashboard__status parent-dashboard__status--loading" role="status">
      جاري تحميل لوحة الوالدين...
    </p>
  );
}

function EmptyState() {
  return (
    <p className="parent-dashboard__status parent-dashboard__status--empty" role="status">
      لا يوجد أبناء مرتبطون بهذا الحساب بعد.
    </p>
  );
}

function ErrorState({ message }) {
  return (
    <p className="parent-dashboard__status parent-dashboard__status--error" role="alert">
      {message || 'حدث خطأ أثناء تحميل لوحة الوالدين.'}
    </p>
  );
}

function ParentDashboardShell({ status = 'empty', errorMessage, children }) {
  return (
    <section className="parent-dashboard" aria-label="لوحة الوالدين">
      <header className="parent-dashboard__header">
        <p className="parent-dashboard__eyebrow">الوالدين</p>
        <h1>لوحة متابعة الأبناء</h1>
      </header>

      <div className="parent-dashboard__body">
        {status === 'loading' && <LoadingState />}
        {status === 'error' && <ErrorState message={errorMessage} />}
        {status === 'empty' && <EmptyState />}
        {status === 'ready' && children}
      </div>
    </section>
  );
}

export default ParentDashboardShell;
