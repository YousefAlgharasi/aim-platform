// P11-011: Inline form validation errors list
type Props = {
  readonly errors: readonly string[];
  readonly id?: string;
};

export function AdminValidationErrors({ errors, id }: Props) {
  if (errors.length === 0) return null;
  return (
    <div
      id={id}
      className="aim-validation-errors"
      role="alert"
      aria-live="polite"
      aria-label="Validation errors"
    >
      <strong className="aim-validation-errors-title">
        {errors.length === 1 ? 'Please fix the following error:' : `Please fix ${errors.length} errors:`}
      </strong>
      <ul className="aim-validation-errors-list">
        {errors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>
      <style>{`
        .aim-validation-errors {
          background: var(--error-soft);
          color: var(--error-soft-fg);
          border: 1px solid var(--color-error-200, #FAC9CB);
          border-radius: var(--radius-md);
          padding: var(--space-12) var(--space-16);
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .aim-validation-errors-title {
          font-size: 14px;
          font-weight: var(--weight-semibold);
        }
        .aim-validation-errors-list {
          margin: 0;
          padding-inline-start: var(--space-20);
          font-size: 14px;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
      `}</style>
    </div>
  );
}
