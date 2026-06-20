import './ParentComponents.css';

const VARIANT_MAP = {
  success: 'parent-badge--success',
  warning: 'parent-badge--warning',
  error: 'parent-badge--error',
  info: 'parent-badge--info',
  neutral: 'parent-badge--neutral',
};

function ParentBadge({ label, variant = 'neutral' }) {
  return (
    <span className={`parent-badge ${VARIANT_MAP[variant] || VARIANT_MAP.neutral}`}>
      {label}
    </span>
  );
}

export default ParentBadge;
