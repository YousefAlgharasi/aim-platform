import * as React from 'react';

export interface AlertBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Semantic tone (sets color + icon). @default 'info' */
  tone?: 'info' | 'success' | 'warning' | 'error';
  /** Bold title line. */
  title?: string;
  /** Show a dismiss (×) button. */
  dismissible?: boolean;
  onDismiss?: () => void;
  /** Optional action element (e.g. a small Button) shown under the message. */
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function AlertBanner(props: AlertBannerProps): JSX.Element;
