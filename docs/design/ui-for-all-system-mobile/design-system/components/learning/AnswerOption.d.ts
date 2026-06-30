import * as React from 'react';

export interface AnswerOptionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * Visual state:
   * - default   — not chosen
   * - selected  — chosen, not yet graded
   * - correct   — chosen and right
   * - incorrect — chosen and wrong
   * - reveal    — the right answer, shown after a wrong pick
   * @default 'default'
   */
  state?: 'default' | 'selected' | 'correct' | 'incorrect' | 'reveal';
  /** Letter/number key shown in the leading square (e.g. "A"). */
  optionKey?: string;
  children?: React.ReactNode;
}

export function AnswerOption(props: AnswerOptionProps): JSX.Element;
