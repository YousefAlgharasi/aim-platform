// P15-058: Analytics Filter Bar
// Date range and filter controls for analytics pages.
// Filters are sent to backend — all aggregation is server-side.

import './AnalyticsComponents.css';

const PERIOD_OPTIONS = [
  { value: 'today', label: 'اليوم' },
  { value: 'week', label: 'هذا الأسبوع' },
  { value: 'month', label: 'هذا الشهر' },
  { value: 'quarter', label: 'هذا الربع' },
  { value: 'year', label: 'هذا العام' },
  { value: 'custom', label: 'مخصص' },
];

function AnalyticsFilterBar({
  period,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  children,
}) {
  return (
    <div className="analytics-filter-bar" role="search" aria-label="أدوات التصفية">
      <div className="analytics-filter-bar__group">
        <label className="analytics-filter-bar__label" htmlFor="analytics-period">
          الفترة الزمنية
        </label>
        <select
          id="analytics-period"
          className="analytics-filter-bar__select"
          value={period || 'month'}
          onChange={(e) => onPeriodChange?.(e.target.value)}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {period === 'custom' && (
        <>
          <div className="analytics-filter-bar__group">
            <label className="analytics-filter-bar__label" htmlFor="analytics-start-date">
              من
            </label>
            <input
              id="analytics-start-date"
              className="analytics-filter-bar__input"
              type="date"
              value={startDate || ''}
              onChange={(e) => onStartDateChange?.(e.target.value)}
            />
          </div>
          <div className="analytics-filter-bar__group">
            <label className="analytics-filter-bar__label" htmlFor="analytics-end-date">
              إلى
            </label>
            <input
              id="analytics-end-date"
              className="analytics-filter-bar__input"
              type="date"
              value={endDate || ''}
              onChange={(e) => onEndDateChange?.(e.target.value)}
            />
          </div>
        </>
      )}

      {children}

      {onApply && (
        <button
          className="analytics-filter-bar__btn"
          type="button"
          onClick={onApply}
          aria-label="تطبيق التصفية"
        >
          تطبيق
        </button>
      )}
    </div>
  );
}

export default AnalyticsFilterBar;
