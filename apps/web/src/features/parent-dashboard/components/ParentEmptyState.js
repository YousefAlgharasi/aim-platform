import './ParentComponents.css';

function ParentEmptyState({ message = 'لا توجد بيانات لعرضها.' }) {
  return (
    <div className="parent-state parent-state--empty" role="status">
      <p>{message}</p>
    </div>
  );
}

export default ParentEmptyState;
