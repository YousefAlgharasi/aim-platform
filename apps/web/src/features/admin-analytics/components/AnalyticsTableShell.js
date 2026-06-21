// P15-058: Analytics Table Shell
// Reusable data table with column headers. Renders backend-provided rows only.

import './AnalyticsComponents.css';

function AnalyticsTableShell({ columns, rows, emptyMessage = 'لا توجد بيانات.', caption }) {
  if (!rows || rows.length === 0) {
    return (
      <p className="analytics-table__empty" role="status" aria-live="polite">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="analytics-table__wrapper" role="region" tabIndex={0} aria-label={caption || 'جدول بيانات'}>
      <table className="analytics-table">
        {caption && <caption className="analytics-table__caption">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AnalyticsTableShell;
