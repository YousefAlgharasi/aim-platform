// P11-009: Truncated UUID cell for admin tables
type Props = { readonly id: string };

export function AdminIdCell({ id }: Props) {
  return (
    <span className="aim-id-cell" title={id}>
      {id.slice(0, 8)}…
      <style>{`
        .aim-id-cell {
          font-family: ui-monospace, 'Cascadia Code', monospace;
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
        }
      `}</style>
    </span>
  );
}
