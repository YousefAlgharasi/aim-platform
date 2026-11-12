import {
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../i18n/I18nContext';

/** Props the trigger element must receive; spread them onto a <button>. */
export interface PopoverTriggerProps {
  ref: Ref<HTMLButtonElement>;
  onClick: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  'aria-haspopup': 'dialog';
  'aria-expanded': boolean;
  'aria-controls': string | undefined;
}

interface PopoverProps {
  /** Heading shown at the top of the panel; also its accessible name. */
  title: string;
  /** Uncontrolled mode: renders the button that toggles the popover. */
  renderTrigger?: (props: PopoverTriggerProps) => ReactNode;
  /** Controlled mode: the parent owns `open` and handles `onClose` (outside press, Escape, close button). */
  open?: boolean;
  onClose?: () => void;
  /** Element to anchor to instead of the trigger (e.g. a whole card). */
  anchorRef?: RefObject<HTMLElement | null>;
  /** 'below' sits under the anchor (flips above if needed); 'cover' centres over it. */
  placement?: 'below' | 'cover';
  children: ReactNode;
}

const GAP = 8; // px between trigger and panel
const MARGIN = 8; // min px between panel and viewport edge
const EXIT_MS = 150;

/**
 * Non-modal popover anchored to a trigger. Opens below the trigger (flips above when there
 * is no room), stays inside the viewport, and closes on outside press, Escape or the close
 * button. The panel is portalled to <body>, so React events are stopped before they bubble
 * to ancestors (e.g. a clickable card).
 */
export function Popover({ title, renderTrigger, open: openProp, onClose, anchorRef, placement = 'below', children }: PopoverProps) {
  const { t } = useI18n();
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [openState, setOpenState] = useState(false);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : openState;
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' });

  const anchorEl = useCallback(() => anchorRef?.current ?? triggerRef.current, [anchorRef]);

  const close = useCallback((returnFocus: boolean) => {
    if (controlled) onClose?.();
    else setOpenState(false);
    if (returnFocus) anchorEl()?.focus();
  }, [controlled, onClose, anchorEl]);

  // Mount/unmount around the enter/exit transition.
  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [open]);

  const place = useCallback(() => {
    const anchor = anchorEl();
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const r = anchor.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const width = Math.min(320, vw - MARGIN * 2);
    const height = panel.offsetHeight;
    // Centre on the trigger, then clamp: independent of LTR/RTL.
    const left = Math.min(Math.max(r.left + r.width / 2 - width / 2, MARGIN), vw - width - MARGIN);
    const below = r.bottom + GAP;
    const above = r.top - GAP - height;
    const fitsBelow = below + height <= vh - MARGIN;
    const clampTop = (v: number) => Math.min(Math.max(v, MARGIN), Math.max(vh - height - MARGIN, MARGIN));
    const top =
      placement === 'cover'
        ? clampTop(r.top + r.height / 2 - height / 2)
        : fitsBelow || above < MARGIN ? Math.min(below, Math.max(vh - height - MARGIN, MARGIN)) : above;
    setStyle({ position: 'fixed', top, left, width, visibility: 'visible' });
  }, [anchorEl, placement]);

  useLayoutEffect(() => {
    if (mounted) place();
  }, [mounted, place, children]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || anchorEl()?.contains(target)) return;
      close(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close(true);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, close, place, anchorEl]);

  // Move focus into the panel when it opens so keyboard users can reach the close button.
  useEffect(() => {
    if (open && shown) panelRef.current?.focus({ preventScroll: true });
  }, [open, shown]);

  const triggerProps: PopoverTriggerProps = {
    ref: triggerRef,
    onClick: (e) => {
      e.stopPropagation();
      setOpenState((v) => !v);
    },
    // Keep Enter/Space on the trigger from activating an ancestor handler.
    onKeyDown: (e) => {
      e.stopPropagation();
      if (e.key === 'Escape' && open) close(true);
    },
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': mounted ? id : undefined,
  };

  return (
    <>
      {renderTrigger?.(triggerProps)}
      {mounted &&
        createPortal(
          <div
            ref={panelRef}
            id={id}
            role="dialog"
            aria-label={title}
            tabIndex={-1}
            style={style}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              // Stopped so ancestors (e.g. a clickable card) never see it; that also hides it from the document
              // listener above, so Escape is handled here while focus is inside the panel.
              e.stopPropagation();
              if (e.key === 'Escape') close(true);
            }}
            className={`z-50 rounded-2xl bg-surface text-ink ring-1 ring-line shadow-xl shadow-slate-900/10 dark:shadow-black/40 p-4 text-start outline-none focus-visible:ring-2 focus-visible:ring-focus transition duration-150 ease-out motion-reduce:transition-none ${
              shown ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-1 scale-95'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="m-0 text-sm font-extrabold tracking-tight">{title}</h3>
              <button
                type="button"
                onClick={() => close(true)}
                aria-label={t('Close')}
                className="size-7 shrink-0 -mt-1 -me-1 rounded-full flex items-center justify-center border-none cursor-pointer bg-surface-muted text-ink-muted hover:text-ink dark:text-ink-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
