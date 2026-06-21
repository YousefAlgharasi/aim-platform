import './ParentLayout.css';
import { NAV_ITEMS } from './ParentSidebar';

function ParentMobileNav({ activeKey, onNavigate, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="parent-mobile-nav__overlay" onClick={onClose} role="presentation">
      <nav
        className="parent-mobile-nav"
        aria-label="قائمة الوالدين للجوال"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="parent-mobile-nav__close" onClick={onClose} aria-label="إغلاق القائمة" type="button">
          ✕
        </button>
        <ul className="parent-mobile-nav__list" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <button
                className={`parent-sidebar__item${activeKey === item.key ? ' parent-sidebar__item--active' : ''}`}
                onClick={() => { onNavigate?.(item.key); onClose(); }}
                aria-current={activeKey === item.key ? 'page' : undefined}
                type="button"
              >
                <span className="parent-sidebar__icon" aria-hidden="true">{item.icon}</span>
                <span className="parent-sidebar__label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default ParentMobileNav;
