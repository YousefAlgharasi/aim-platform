// P18-073: Create Admin AI Management Feature Shell
// Main shell component with sidebar navigation, header, and status states
// for admin AI Teacher/Voice Tutor management (prompts, model config,
// usage/cost, safety review, audit). Follows the AdminAnalyticsShell
// pattern. This shell never computes mastery/level/weakness/difficulty/
// recommendation/review-schedule data, never calls an AI provider, and
// never renders provider secrets, API keys, or raw rejected content — it
// only renders what backend-approved admin AI APIs return.

import { useState } from 'react';
import './AdminAiShell.css';

const NAV_ITEMS = [
  { key: 'prompts', label: 'القوالب والتعليمات', icon: '📝' },
  { key: 'model-config', label: 'إعدادات النموذج', icon: '⚙️' },
  { key: 'usage-cost', label: 'الاستخدام والتكلفة', icon: '💳' },
  { key: 'safety-review', label: 'مراجعة السلامة', icon: '🛡️' },
  { key: 'audit', label: 'سجل التدقيق', icon: '📋' },
];

function LoadingState() {
  return (
    <p className="admin-ai__status admin-ai__status--loading" role="status">
      جاري تحميل لوحة إدارة المعلم الذكي...
    </p>
  );
}

function EmptyState() {
  return (
    <p className="admin-ai__status admin-ai__status--empty" role="status">
      لا توجد بيانات متاحة حالياً.
    </p>
  );
}

function ErrorState({ message }) {
  return (
    <p className="admin-ai__status admin-ai__status--error" role="alert">
      {message || 'حدث خطأ أثناء تحميل لوحة إدارة المعلم الذكي.'}
    </p>
  );
}

function ForbiddenState() {
  return (
    <p className="admin-ai__status admin-ai__status--forbidden" role="alert">
      ليس لديك صلاحية الوصول إلى لوحة إدارة المعلم الذكي.
    </p>
  );
}

function AdminAiSidebar({ activeKey, onNavigate }) {
  return (
    <nav className="admin-ai-sidebar" aria-label="قائمة لوحة إدارة المعلم الذكي">
      <ul className="admin-ai-sidebar__list" role="list">
        {NAV_ITEMS.map((item) => (
          <li key={item.key}>
            <button
              className={`admin-ai-sidebar__item${activeKey === item.key ? ' admin-ai-sidebar__item--active' : ''}`}
              onClick={() => onNavigate?.(item.key)}
              aria-current={activeKey === item.key ? 'page' : undefined}
              type="button"
            >
              <span className="admin-ai-sidebar__icon" aria-hidden="true">{item.icon}</span>
              <span className="admin-ai-sidebar__label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AdminAiMobileNav({ activeKey, onNavigate, isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <>
      <div className="admin-ai-mobile__overlay" onClick={onClose} />
      <nav className="admin-ai-mobile" aria-label="قائمة الإدارة للهاتف">
        <button
          className="admin-ai-mobile__close"
          onClick={onClose}
          type="button"
          aria-label="إغلاق القائمة"
        >
          ✕
        </button>
        <ul className="admin-ai-mobile__list" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <button
                className={`admin-ai-sidebar__item${activeKey === item.key ? ' admin-ai-sidebar__item--active' : ''}`}
                onClick={() => { onNavigate?.(item.key); onClose(); }}
                aria-current={activeKey === item.key ? 'page' : undefined}
                type="button"
              >
                <span className="admin-ai-sidebar__icon" aria-hidden="true">{item.icon}</span>
                <span className="admin-ai-sidebar__label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

function AdminAiShell({ status = 'empty', errorMessage, activeKey = 'prompts', onNavigate, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="admin-ai-layout" dir="auto">
      <AdminAiSidebar activeKey={activeKey} onNavigate={onNavigate} />
      <div className="admin-ai-layout__main">
        <header className="admin-ai__header">
          <button
            className="admin-ai__menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            type="button"
            aria-label="فتح القائمة"
          >
            ☰
          </button>
          <p className="admin-ai__eyebrow">الإدارة</p>
          <h1 className="admin-ai__title">إدارة المعلم الذكي</h1>
        </header>

        <main className="admin-ai__body" aria-label="لوحة إدارة المعلم الذكي">
          {status === 'loading' && <LoadingState />}
          {status === 'error' && <ErrorState message={errorMessage} />}
          {status === 'empty' && <EmptyState />}
          {status === 'forbidden' && <ForbiddenState />}
          {status === 'ready' && children}
        </main>
      </div>
      <AdminAiMobileNav
        activeKey={activeKey}
        onNavigate={onNavigate}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}

export default AdminAiShell;
export { NAV_ITEMS };
