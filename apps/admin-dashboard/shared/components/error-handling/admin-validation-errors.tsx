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
      className="bg-[var(--error-soft)] text-[var(--error-soft-fg)] border border-red-200 rounded-xl p-3 px-4 flex flex-col gap-2"
      role="alert"
      aria-live="polite"
      aria-label="Validation errors"
    >
      <strong className="text-sm font-semibold">
        {errors.length === 1 ? 'Please fix the following error:' : `Please fix ${errors.length} errors:`}
      </strong>
      <ul className="m-0 pl-5 text-sm flex flex-col gap-1 list-disc">
        {errors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>
    </div>
  );
}
