import { ReactNode } from 'react';
import { EyeIcon } from '../common/Icons';
import { useI18n } from '../../i18n/I18nContext';

// Building blocks shared by the auth screens, taken from design-prototype's
// LoginPage / RegisterPage / ForgotPasswordPage markup.

/** The wordmark now lives in the page header (PublicLayout); kept so older imports keep compiling. */
export function AuthLogo() {
  return null;
}

export function AuthHeader({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div>
      <h1 className="lp-display m-0 text-[2.5rem] font-semibold text-ink rtl:text-4xl">{title}</h1>
      {subtitle && <p className="m-0 mt-3 max-w-sm text-base leading-relaxed text-ink-muted">{subtitle}</p>}
    </div>
  );
}

export function AuthFooterLink({ prompt, action, onClick }: { prompt: string; action: string; onClick: () => void }) {
  return (
    <p className="m-0 mt-2 border-t border-line pt-5 text-[15px] text-ink-muted">
      {prompt}{' '}
      <button
        type="button"
        onClick={onClick}
        className="-my-2.5 inline cursor-pointer border-none bg-transparent px-1 py-2.5 text-[15px] font-semibold text-ink underline decoration-line-strong decoration-2 underline-offset-[5px] hover:decoration-ink"
      >
        {action}
      </button>
    </p>
  );
}

export function TextLinkButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-my-2.5 cursor-pointer border-none bg-transparent px-1 py-2.5 text-sm font-medium text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink"
    >
      {children}
    </button>
  );
}

export function PasswordToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? t('Hide password') : t('Show password')}
      className="bg-transparent border-none cursor-pointer size-10 -me-2 rounded-lg text-ink-muted hover:text-ink flex items-center justify-center"
    >
      <EyeIcon off={shown} />
    </button>
  );
}

/** Flat confirmation marks for the "check your email" and "password reset" screens. */
export function MailBadge() {
  return (
    <div className="mb-6 grid size-14 place-items-center rounded-full bg-brand-soft text-brand-ink">
      <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    </div>
  );
}

export function SuccessBadge() {
  return (
    <div className="mb-6 grid size-14 place-items-center rounded-full bg-success-soft text-success-ink">
      <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </div>
  );
}
