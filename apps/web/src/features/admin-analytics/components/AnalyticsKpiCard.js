// P15-058: Analytics KPI Card
// Displays a single key performance indicator with value and label.
// Never computes metrics — only renders backend-provided values.

import './AnalyticsComponents.css';

function AnalyticsKpiCard({ label, value, unit, trend, trendLabel, variant = 'default' }) {
  const trendClass = trend === 'up'
    ? 'analytics-kpi__trend--up'
    : trend === 'down'
      ? 'analytics-kpi__trend--down'
      : '';

  return (
    <div className={`analytics-kpi analytics-kpi--${variant}`} aria-label={label}>
      <p className="analytics-kpi__label">{label}</p>
      <p className="analytics-kpi__value">
        {value != null ? value : '—'}
        {unit && <span className="analytics-kpi__unit">{unit}</span>}
      </p>
      {trendLabel && (
        <p className={`analytics-kpi__trend ${trendClass}`} aria-label={trendLabel}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {' '}{trendLabel}
        </p>
      )}
    </div>
  );
}

export default AnalyticsKpiCard;
