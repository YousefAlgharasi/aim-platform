import { Fragment, ReactNode } from 'react';

/**
 * Tiny, dependency-free Markdown renderer for AI replies and lesson text.
 * Builds React elements only (never innerHTML), so model/user text cannot inject markup.
 * Supports: **bold**, *italic* / _italic_, `code`, # headings, - / * / 1. lists, paragraphs,
 * line breaks, and http(s) links. Anything else is shown as plain text.
 */

const INLINE = /(\*\*[^*\n]+?\*\*|__[^_\n]+?__|`[^`\n]+?`|\*[^*\s][^*\n]*?\*|(?<![\w])_[^_\s][^_\n]*?_(?![\w])|https?:\/\/[^\s<)]+)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const tok = m[0];
    const key = `${keyPrefix}-${i++}`;
    if (tok.startsWith('**') || tok.startsWith('__')) {
      out.push(<strong key={key} className="font-bold">{renderInline(tok.slice(2, -2), key)}</strong>);
    } else if (tok.startsWith('`')) {
      out.push(<code key={key} className="rounded bg-surface-strong px-1 py-0.5 text-[0.9em] font-mono">{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith('http')) {
      out.push(
        <a key={key} href={tok} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 break-all">{tok}</a>,
      );
    } else {
      out.push(<em key={key}>{renderInline(tok.slice(1, -1), key)}</em>);
    }
    last = idx + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function withBreaks(lines: string[], key: string): ReactNode[] {
  return lines.map((l, i) => (
    <Fragment key={`${key}-${i}`}>
      {i > 0 && <br />}
      {renderInline(l, `${key}-${i}`)}
    </Fragment>
  ));
}

const BULLET = /^\s*[-*•]\s+(.*)$/;
const ORDERED = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;

export function Markdown({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) blocks.push(<p key={`p${blocks.length}`} dir="auto" className="m-0">{withBreaks(para, `p${blocks.length}`)}</p>);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const Tag = list.ordered ? 'ol' : 'ul';
    const k = `l${blocks.length}`;
    blocks.push(
      <Tag key={k} dir="auto" className={`m-0 ps-5 flex flex-col gap-1 ${list.ordered ? 'list-decimal' : 'list-disc'}`}>
        {list.items.map((it, i) => <li key={i}>{renderInline(it, `${k}-${i}`)}</li>)}
      </Tag>,
    );
    list = null;
  };

  for (const line of lines) {
    const h = line.match(HEADING);
    const b = line.match(BULLET);
    const o = line.match(ORDERED);
    if (!line.trim()) {
      flushPara();
      flushList();
    } else if (h) {
      flushPara();
      flushList();
      blocks.push(<p key={`h${blocks.length}`} dir="auto" className="m-0 font-bold">{renderInline(h[1], `h${blocks.length}`)}</p>);
    } else if (b || o) {
      flushPara();
      const ordered = !!o && !b;
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push((b ?? o)![1]);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  return <div className={`flex flex-col gap-2 break-words whitespace-normal ${className}`}>{blocks}</div>;
}
