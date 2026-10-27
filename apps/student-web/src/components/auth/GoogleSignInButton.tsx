import { useEffect, useRef } from 'react';
import { config } from '../../config';
import { GoogleIcon } from '../common/Icons';
import { useI18n } from '../../i18n/I18nContext';

// Google Identity Services: the official button is rendered invisibly over our
// own styled button, so clicks go through Google's popup and yield an ID token
// for POST /auth/google.

interface GoogleId {
  initialize: (opts: { client_id: string; callback: (r: { credential: string }) => void }) => void;
  renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client';

function loadGsi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    let script = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('Failed to load Google sign-in')));
  });
}

export function GoogleSignInButton({
  onCredential,
  disabled,
}: {
  onCredential: (idToken: string) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const hostRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;

  useEffect(() => {
    const host = hostRef.current;
    if (!config.googleClientId || !host) return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: (r) => callbackRef.current(r.credential),
        });
        window.google.accounts.id.renderButton(host, {
          type: 'standard',
          size: 'large',
          width: Math.min(host.offsetWidth || 400, 400),
        });
      })
      .catch(() => {
        // Script blocked or offline: the email/password form still works.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!config.googleClientId) return null;

  return (
    <div className="pt-4">
      <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase">
        <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        {t('or')}
        <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className={`relative mt-4 ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
        <div className="h-[54px] w-full inline-flex items-center justify-center gap-2.5 rounded-[14px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white font-semibold text-[15px]">
          <GoogleIcon />
          {t('Continue with Google')}
        </div>
        <div
          ref={hostRef}
          className="absolute inset-0 overflow-hidden opacity-0 [&>div]:!w-full [&_iframe]:!h-[54px]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
