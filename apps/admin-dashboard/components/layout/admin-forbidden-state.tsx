// P11-008: AIM design system forbidden (403) state
export function AdminForbiddenState() {
  return (
    <div className="aim-forbidden" role="alert" aria-label="Access forbidden">
      <div className="aim-forbidden-icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="14" fill="var(--error-soft)" />
          <circle cx="24" cy="24" r="10" stroke="var(--error-soft-fg)" strokeWidth="2" fill="none" />
          <line x1="17" y1="17" x2="31" y2="31" stroke="var(--error-soft-fg)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="aim-forbidden-title">Access Forbidden</h2>
      <p className="aim-forbidden-description">
        Your current role does not have permission to view this page.
        Contact an administrator if you believe this is an error.
      </p>
      <style>{`
        .aim-forbidden {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-12);
          padding: var(--space-48) var(--space-24);
          text-align: center;
        }
        .aim-forbidden-title {
          margin: 0;
          font-size: 19px;
          font-weight: var(--weight-semibold);
          color: var(--text-primary);
        }
        .aim-forbidden-description {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
          max-width: 380px;
          line-height: 20px;
        }
      `}</style>
    </div>
  );
}
