import './ParentLayout.css';

function ParentHeader({ title, onMenuToggle, showMenuButton = false }) {
  return (
    <header className="parent-header">
      {showMenuButton && (
        <button
          className="parent-header__menu-btn"
          onClick={onMenuToggle}
          aria-label="فتح القائمة"
          type="button"
        >
          ☰
        </button>
      )}
      <h1 className="parent-header__title">{title || 'لوحة متابعة الأبناء'}</h1>
    </header>
  );
}

export default ParentHeader;
