import './ParentComponents.css';

function ParentLoadingState({ message = 'جاري التحميل...' }) {
  return (
    <div className="parent-state parent-state--loading" role="status" aria-live="polite">
      <p>{message}</p>
    </div>
  );
}

export default ParentLoadingState;
