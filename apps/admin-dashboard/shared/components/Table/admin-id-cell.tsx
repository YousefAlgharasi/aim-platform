// P11-009: Truncated UUID cell for admin tables
type Props = { readonly id: string };

export function AdminIdCell({ id }: Props) {
  return (
    <span className="font-mono text-xs text-[var(--text-muted)] whitespace-nowrap" title={id}>
      {id.slice(0, 8)}…
    </span>
  );
}
