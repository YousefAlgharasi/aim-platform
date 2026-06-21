import './ParentComponents.css';

function ParentProgressBlock({ label, value, max = 100, unit = '%' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="parent-progress-block">
      <div className="parent-progress-block__header">
        <span className="parent-progress-block__label">{label}</span>
        <span className="parent-progress-block__value">{value}{unit}</span>
      </div>
      <div className="parent-progress-block__track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label} aria-valuetext={`${pct}${unit}`}>
        <div className="parent-progress-block__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default ParentProgressBlock;
