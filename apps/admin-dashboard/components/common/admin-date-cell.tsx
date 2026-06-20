// P11-009: Formatted date cell for admin tables
type Props = { readonly iso: string | null | undefined };

export function AdminDateCell({ iso }: Props) {
  if (!iso) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  try {
    const formatted = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
    return (
      <time dateTime={iso} className="aim-date-cell">
        {formatted}
        <style>{`
          .aim-date-cell { font-size: 13px; color: var(--text-secondary); white-space: nowrap; }
        `}</style>
      </time>
    );
  } catch {
    return <span>{iso}</span>;
  }
}
