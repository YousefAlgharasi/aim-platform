import type { ElementType } from 'react';
import { Markdown } from '../../components/common/Markdown';

// Bilingual lesson text. English is the target language and stays primary; Arabic is the supporting line shown
// directly underneath. Both sides carry explicit lang/dir so mixed text can never reorder each other.
// Every component renders nothing for empty/missing text, so a missing translation leaves no empty boxes.

const has = (s: unknown): s is string => typeof s === 'string' && s.trim().length > 0;

/** English lesson text: always left-to-right, isolated from its Arabic neighbour. */
export function En({ as: Tag = 'span', className, children }: { as?: ElementType; className?: string; children: React.ReactNode }) {
  return <Tag lang="en" dir="ltr" className={className}>{children}</Tag>;
}

/** One line (or short paragraph) of Arabic supporting text. */
export function ArText({ text, as: Tag = 'p', className = '' }: { text?: string | null; as?: ElementType; className?: string }) {
  if (!has(text)) return null;
  return <Tag lang="ar" dir="rtl" className={`lpl-ar m-0 ${className}`}>{text}</Tag>;
}

/** Arabic supporting text that may contain Markdown (explanations). */
export function ArMarkdown({ text, className = '' }: { text?: string | null; className?: string }) {
  if (!has(text)) return null;
  return (
    <div lang="ar" dir="rtl" className="lpl-ar">
      <Markdown text={text} className={className} />
    </div>
  );
}

/** English text that must always read left-to-right inside any surrounding direction (words, target sentences). */
export function EnIsolated({ children, className }: { children: React.ReactNode; className?: string }) {
  return <bdi lang="en" dir="ltr" className={className}>{children}</bdi>;
}
