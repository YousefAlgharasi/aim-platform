import './ParentComponents.css';

function ParentTable({ columns, rows, emptyMessage = 'لا توجد بيانات.' }) {
  if (!rows || rows.length === 0) {
    return <p className="parent-table__empty" role="status" aria-live="polite">{emptyMessage}</p>;
  }

  return (
    <div className="parent-table__wrapper" role="region" tabIndex={0} aria-label="جدول بيانات">
      <table className="parent-table">
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

export default ParentTable;
