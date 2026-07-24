// P11-008: AIM design system forbidden (403) state
export function AdminForbiddenState() {
  return (
    <div className="flex flex-col items-center gap-3 p-12 text-center" role="alert" aria-label="Access forbidden">
      <div className="flex items-center justify-center shrink-0" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="14" fill="var(--error-soft)" />
          <circle cx="24" cy="24" r="10" stroke="var(--error-soft-fg)" strokeWidth="2" fill="none" />
          <line x1="17" y1="17" x2="31" y2="31" stroke="var(--error-soft-fg)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Access Forbidden</h2>
      <p className="text-sm text-[var(--text-secondary)] max-w-xs leading-5">
        Your current role does not have permission to view this page.
        Contact an administrator if you believe this is an error.
      </p>
    </div>
  );
}
