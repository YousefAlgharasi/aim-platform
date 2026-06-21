import { ReactNode } from 'react';
import styles from './Banner.module.css';

interface BannerProps {
  variant: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
}

export function Banner({ variant, children }: BannerProps) {
  return (
    <div className={`${styles.banner} ${styles[variant]}`} role="status">
      {children}
    </div>
  );
}
