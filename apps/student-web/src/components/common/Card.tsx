import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 ring-1 ring-[#E2E8F0] dark:ring-slate-700 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
