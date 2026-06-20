import './ParentLayout.css';

const NAV_ITEMS = [
  { key: 'home', label: 'الرئيسية', icon: '🏠' },
  { key: 'progress', label: 'التقدم', icon: '📊' },
  { key: 'assessments', label: 'التقييمات', icon: '📝' },
  { key: 'activity', label: 'النشاط', icon: '📅' },
  { key: 'reports', label: 'التقارير', icon: '📄' },
  { key: 'notifications', label: 'الإشعارات', icon: '🔔' },
  { key: 'consent', label: 'الموافقات', icon: '🔒' },
  { key: 'settings', label: 'الإعدادات', icon: '⚙️' },
];

function ParentSidebar({ activeKey, onNavigate }) {
  return (
    <nav className="parent-sidebar" aria-label="قائمة لوحة الوالدين">
      <ul className="parent-sidebar__list" role="list">
        {NAV_ITEMS.map((item) => (
          <li key={item.key}>
            <button
              className={`parent-sidebar__item${activeKey === item.key ? ' parent-sidebar__item--active' : ''}`}
              onClick={() => onNavigate?.(item.key)}
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
  );
}

export default ParentSidebar;
export { NAV_ITEMS };
