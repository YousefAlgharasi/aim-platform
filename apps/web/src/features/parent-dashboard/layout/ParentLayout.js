import { useState } from 'react';
import ParentHeader from './ParentHeader';
import ParentSidebar from './ParentSidebar';
import ParentMobileNav from './ParentMobileNav';
import './ParentLayout.css';

function ParentLayout({ activeKey, onNavigate, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="parent-layout" dir="auto">
      <ParentSidebar activeKey={activeKey} onNavigate={onNavigate} />
      <div className="parent-layout__main">
        <ParentHeader
          showMenuButton
          onMenuToggle={() => setMobileMenuOpen(true)}
        />
        <main className="parent-layout__content">
          {children}
        </main>
      </div>
      <ParentMobileNav
        activeKey={activeKey}
        onNavigate={onNavigate}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}

export default ParentLayout;
