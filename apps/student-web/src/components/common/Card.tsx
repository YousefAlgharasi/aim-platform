import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-2xl p-4 sm:p-5 ring-1 ring-line shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
