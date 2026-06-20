import './ParentComponents.css';

function ParentCard({ title, children, className = '' }) {
  return (
    <div className={`parent-card ${className}`}>
      {title && <h3 className="parent-card__title">{title}</h3>}
      <div className="parent-card__body">{children}</div>
    </div>
  );
}

export default ParentCard;
