import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { SidebarContent } from './Sidebar';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Slide-in navigation for phones. Behaves as a real modal dialog: focus moves in and is kept inside,
 * Escape closes it, the page behind stops scrolling, and focus returns to the opener on close.
 */
export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { t } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      // Only restore if the opener is still on screen (a nav click may have unmounted it).
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true" aria-label={t('Menu')}>
      <button
        type="button"
        tabIndex={-1}
        aria-label={t('Close menu')}
        onClick={onClose}
        className="absolute inset-0 border-none bg-slate-900/40 backdrop-blur-sm cursor-default"
      />
      <div ref={panelRef} className="relative w-4/5 max-w-[300px] h-full shadow-2xl bg-white dark:bg-slate-900">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t('Close menu')}
          className="absolute top-4 end-4 z-10 size-10 rounded-full flex items-center justify-center border-none cursor-pointer bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}
