import './ParentComponents.css';

function ParentChartShell({ title, children, height = 200 }) {
  return (
    <div className="parent-chart-shell" aria-label={title}>
      {title && <h4 className="parent-chart-shell__title">{title}</h4>}
      <div className="parent-chart-shell__area" style={{ minHeight: height }}>
        {children || <p className="parent-chart-shell__placeholder">الرسم البياني غير متاح حالياً.</p>}
      </div>
    </div>
  );
}

export default ParentChartShell;
