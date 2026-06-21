// P15-058: Analytics Chart Shell
// Container for chart visualizations with loading state and placeholder.
// Charts render backend-provided data only — no client-side aggregation.

import './AnalyticsComponents.css';

function AnalyticsChartShell({ title, loading = false, children, height = 240 }) {
  return (
    <div className="analytics-chart-shell" aria-label={title}>
      {title && <h4 className="analytics-chart-shell__title">{title}</h4>}
      <div className="analytics-chart-shell__area" style={{ minHeight: height }}>
        {loading ? (
          <p className="analytics-chart-shell__loading" role="status">
            جاري تحميل الرسم البياني...
          </p>
        ) : children || (
          <p className="analytics-chart-shell__placeholder">
            الرسم البياني غير متاح حالياً.
          </p>
        )}
      </div>
    </div>
  );
}

export default AnalyticsChartShell;
