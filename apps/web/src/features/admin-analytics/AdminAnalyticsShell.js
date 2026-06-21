// P15-057: Admin Analytics Feature Shell
// Main shell component with sidebar navigation, header, and status states.
// This shell never computes metrics — it only renders what the backend
// analytics APIs return. Follows the ParentDashboardShell pattern.

import { useState } from 'react';
import './AdminAnalyticsShell.css';

const NAV_ITEMS = [
  { key: 'overview', label: 'نظرة عامة', icon: '📊' },
  { key: 'learning', label: 'التعلم', icon: '📚' },
  { key: 'curriculum', label: 'المنهج', icon: '📖' },
  { key: 'assessments', label: 'التقييمات', icon: '📝' },
  { key: 'notifications', label: 'الإشعارات', icon: '🔔' },
  { key: 'revenue', label: 'الإيرادات', icon: '💰' },
  { key: 'users', label: 'المستخدمون', icon: '👥' },
  { key: 'exports', label: 'التصدير', icon: '📤' },
];

function LoadingState() {
  return (
    <p className="admin-analytics__status admin-analytics__status--loading" role="status">
      جاري تحميل لوحة التحليلات...
    </p>
  );
}

function EmptyState() {
  return (
    <p className="admin-analytics__status admin-analytics__status--empty" role="status">
      لا توجد بيانات تحليلية متاحة حالياً.
    </p>
  );
}

function ErrorState({ message }) {
  return (
    <p className="admin-analytics__status admin-analytics__status--error" role="alert">
      {message || 'حدث خطأ أثناء تحميل لوحة التحليلات.'}
    </p>
  );
}

function ForbiddenState() {
  return (
    <p className="admin-analytics__status admin-analytics__status--forbidden" role="alert">
      ليس لديك صلاحية الوصول إلى لوحة التحليلات.
    </p>
  );
}

function AdminAnalyticsSidebar({ activeKey, onNavigate }) {
  return (
    <nav className="admin-analytics-sidebar" aria-label="قائمة لوحة التحليلات">
      <ul className="admin-analytics-sidebar__list" role="list">
        {NAV_ITEMS.map((item) => (
          <li key={item.key}>
            <button
              className={`admin-analytics-sidebar__item${activeKey === item.key ? ' admin-analytics-sidebar__item--active' : ''}`}
              onClick={() => onNavigate?.(item.key)}
              aria-current={activeKey === item.key ? 'page' : undefined}
              type="button"
            >
              <span className="admin-analytics-sidebar__icon" aria-hidden="true">{item.icon}</span>
              <span className="admin-analytics-sidebar__label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AdminAnalyticsMobileNav({ activeKey, onNavigate, isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <>
      <div className="admin-analytics-mobile__overlay" onClick={onClose} />
      <nav className="admin-analytics-mobile" aria-label="قائمة التحليلات للهاتف">
        <button
          className="admin-analytics-mobile__close"
          onClick={onClose}
          type="button"
          aria-label="إغلاق القائمة"
        >
          ✕
        </button>
        <ul className="admin-analytics-mobile__list" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <button
                className={`admin-analytics-sidebar__item${activeKey === item.key ? ' admin-analytics-sidebar__item--active' : ''}`}
                onClick={() => { onNavigate?.(item.key); onClose(); }}
                aria-current={activeKey === item.key ? 'page' : undefined}
                type="button"
              >
                <span className="admin-analytics-sidebar__icon" aria-hidden="true">{item.icon}</span>
                <span className="admin-analytics-sidebar__label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

function AdminAnalyticsShell({ status = 'empty', errorMessage, activeKey = 'overview', onNavigate, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="admin-analytics-layout" dir="auto">
      <AdminAnalyticsSidebar activeKey={activeKey} onNavigate={onNavigate} />
      <div className="admin-analytics-layout__main">
        <header className="admin-analytics__header">
          <button
            className="admin-analytics__menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            type="button"
            aria-label="فتح القائمة"
          >
            ☰
          </button>
          <p className="admin-analytics__eyebrow">الإدارة</p>
          <h1 className="admin-analytics__title">لوحة التحليلات</h1>
        </header>

        <main className="admin-analytics__body" aria-label="لوحة التحليلات">
          {status === 'loading' && <LoadingState />}
          {status === 'error' && <ErrorState message={errorMessage} />}
          {status === 'empty' && <EmptyState />}
          {status === 'forbidden' && <ForbiddenState />}
          {status === 'ready' && children}
        </main>
      </div>
      <AdminAnalyticsMobileNav
        activeKey={activeKey}
        onNavigate={onNavigate}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}

export default AdminAnalyticsShell;
export { NAV_ITEMS };
