import * as React from 'react';

export interface AIFeedbackBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Sender name. @default 'AI Tutor' */
  name?: string;
  /** Bubble tint. @default 'neutral' */
  tone?: 'neutral' | 'praise' | 'correction';
  /** Show the animated typing indicator instead of content. */
  typing?: boolean;
  children?: React.ReactNode;
}

export function AIFeedbackBubble(props: AIFeedbackBubbleProps): JSX.Element;
