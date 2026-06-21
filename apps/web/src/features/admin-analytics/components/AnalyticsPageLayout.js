// P15-058: Analytics Page Layout
// Standard page layout wrapper for all analytics pages.
// Provides consistent title, loading, empty, and error states.

import './AnalyticsComponents.css';

function AnalyticsPageLayout({ title, status = 'ready', errorMessage, emptyMessage, children }) {
  return (
    <div className="analytics-page-layout">
      {title && <h2 className="analytics-page__title">{title}</h2>}

      {status === 'loading' && (
        <div className="analytics-page__status analytics-page__status--loading" role="status">
          <p>جاري تحميل البيانات...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="analytics-page__status analytics-page__status--error" role="alert">
          <p>{errorMessage || 'حدث خطأ أثناء تحميل البيانات.'}</p>
        </div>
      )}

      {status === 'empty' && (
        <div className="analytics-page__status analytics-page__status--empty" role="status">
          <p>{emptyMessage || 'لا توجد بيانات متاحة.'}</p>
        </div>
      )}

      {status === 'forbidden' && (
        <div className="analytics-page__status analytics-page__status--forbidden" role="alert">
          <p>ليس لديك صلاحية الوصول إلى هذه الصفحة.</p>
        </div>
      )}

      {status === 'ready' && children}
    </div>
  );
}

export default AnalyticsPageLayout;
