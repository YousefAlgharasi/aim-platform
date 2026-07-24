// Shared SVG icon component — renders a single-path Heroicon-style SVG.
// Replaces duplicated Icon/NavIcon components across dashboard and navigation.
type Props = {
  readonly d: string;
  readonly size?: number;
  readonly className?: string;
};

export function AdminSvgIcon({ d, size = 20, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}
