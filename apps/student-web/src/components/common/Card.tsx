import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds a hairline darken on hover for cards that are clickable. */
  interactive?: boolean;
}

export function Card({ children, className = '', interactive = false }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-2xl p-4 sm:p-5 ring-1 ring-line transition-colors duration-200 motion-reduce:transition-none ${
        interactive ? 'hover:ring-line-strong hover:bg-surface-muted' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
