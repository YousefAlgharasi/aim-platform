import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds a gentle lift + brand-tinted glow on hover for cards that are clickable. */
  interactive?: boolean;
}

export function Card({ children, className = '', interactive = false }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-2xl p-4 sm:p-5 ring-1 ring-line shadow-card transition-[box-shadow,transform] duration-300 ease-out motion-reduce:transition-none ${
        interactive ? 'hover:-translate-y-0.5 hover:shadow-card-hover hover:ring-brand-line' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
