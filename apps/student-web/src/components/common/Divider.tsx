export function Divider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-line" />
      <span className="text-ink-muted text-xs font-normal">{label}</span>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}
