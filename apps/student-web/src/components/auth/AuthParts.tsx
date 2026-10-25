import { ReactNode } from 'react';
import { EyeIcon, SparkleIcon } from '../common/Icons';

// Building blocks shared by the auth screens, taken from design-prototype's
// LoginPage / RegisterPage / ForgotPasswordPage markup.

export function AuthLogo() {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="size-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
        <SparkleIcon className="size-5 text-white" />
      </div>
      <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        AIM
      </span>
    </div>
  );
}

export function AuthHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div>
      <AuthLogo />
      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs uppercase tracking-wider block mb-1">
        {eyebrow}
      </span>
      <h1 className="text-slate-900 dark:text-white font-extrabold text-3xl tracking-tight leading-tight m-0">{title}</h1>
      {subtitle && <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export function AuthFooterLink({ prompt, action, onClick }: { prompt: string; action: string; onClick: () => void }) {
  return (
    <p className="text-center text-slate-700 dark:text-slate-200 text-sm font-medium mt-4">
      {prompt}{' '}
      <button
        type="button"
        onClick={onClick}
        className="bg-transparent border-none text-[#4F46E5] dark:text-indigo-400 font-bold text-sm cursor-pointer underline underline-offset-2 p-0 inline"
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
      className="bg-transparent border-none text-[#4F46E5] dark:text-indigo-400 font-semibold text-xs cursor-pointer hover:underline p-0"
    >
      {children}
    </button>
  );
}

/** Eye toggle used in the password fields (prototype EyeIcon button). */
export function PasswordToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? 'Hide password' : 'Show password'}
      className="bg-transparent border-none cursor-pointer p-0 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 flex items-center"
    >
      <EyeIcon off={shown} />
    </button>
  );
}

export function MailBadge() {
  return (
    <div className="size-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mb-5">
      <svg className="size-7 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    </div>
  );
}

export function SuccessBadge() {
  return (
    <div className="relative mb-6">
      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full opacity-25 blur-lg animate-pulse" />
      <div className="w-22 h-22 rounded-3xl bg-gradient-to-br from-emerald-400 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 relative rotate-3">
        <svg className="size-11 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
    </div>
  );
}
