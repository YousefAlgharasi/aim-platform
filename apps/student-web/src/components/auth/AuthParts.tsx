import { ReactNode } from 'react';
import { EyeIcon, SparkleIcon } from '../common/Icons';
import { useI18n } from '../../i18n/I18nContext';

// Building blocks shared by the auth screens, taken from design-prototype's
// LoginPage / RegisterPage / ForgotPasswordPage markup.

export function AuthLogo() {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="size-10 rounded-2xl bg-gradient-to-br from-brand to-secondary flex items-center justify-center text-white shadow-md shadow-brand/20">
        <SparkleIcon className="size-5 text-white" />
      </div>
      <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent">
        AIM
      </span>
    </div>
  );
}

export function AuthHeader({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div>
      <AuthLogo />
      <h1 className="text-ink font-extrabold text-3xl tracking-tight leading-tight m-0">{title}</h1>
      {subtitle && <p className="text-ink-muted text-sm mt-1.5 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export function AuthFooterLink({ prompt, action, onClick }: { prompt: string; action: string; onClick: () => void }) {
  return (
    <p className="text-center text-ink-soft text-sm font-medium mt-4">
      {prompt}{' '}
      <button
        type="button"
        onClick={onClick}
        className="bg-transparent border-none text-brand-ink font-bold text-sm cursor-pointer underline underline-offset-2 px-1 py-2.5 -my-2.5 inline"
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
      className="bg-transparent border-none text-brand-ink font-semibold text-sm cursor-pointer hover:underline px-1 py-2.5 -my-2.5"
    >
      {children}
    </button>
  );
}

/** Eye toggle used in the password fields (prototype EyeIcon button). */
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

export function MailBadge() {
  return (
    <div className="size-16 rounded-3xl bg-success-soft flex items-center justify-center mb-5">
      <svg className="size-7 text-success-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    </div>
  );
}

export function SuccessBadge() {
  return (
    <div className="relative mb-6">
      <div className="absolute -inset-4 bg-gradient-to-r from-success to-brand rounded-full opacity-25 blur-lg animate-pulse" />
      <div className="w-22 h-22 rounded-3xl bg-gradient-to-br from-success to-brand flex items-center justify-center text-white shadow-xl shadow-brand/25 relative rotate-3">
        <svg className="size-11 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
    </div>
  );
}
