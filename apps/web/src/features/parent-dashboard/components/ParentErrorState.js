import './ParentComponents.css';

function ParentErrorState({ message = 'حدث خطأ. يرجى المحاولة لاحقاً.' }) {
  return (
    <div className="parent-state parent-state--error" role="alert">
      <p>{message}</p>
    </div>
  );
}

export default ParentErrorState;
