// P11-009: Formatted date cell for admin tables
type Props = { readonly iso?: string | null | undefined; readonly date?: string | null | undefined };

export function AdminDateCell({ iso, date }: Props) {
  const value = iso ?? date;
  if (!value) return <span className="text-[var(--text-muted)]">—</span>;
  try {
    const formatted = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
    return (
      <time dateTime={value} className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
        {formatted}
      </time>
    );
  } catch {
    return <span>{value}</span>;
  }
}
