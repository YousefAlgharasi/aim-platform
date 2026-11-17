'use client';
// Shows a person/entity NAME instead of a raw UUID. The id is resolved through the backend lookup
// (/admin/lookup/names, via the admin proxy); until it resolves — or when it is not a known entity — the short id is shown.
import { useEffect, useState } from 'react';

type Props = { readonly id: string; readonly fallbackLabel?: string };
type Entry = { name: string; detail: string | null; kind: string };

const cache = new Map<string, Entry | null>();
const waiters = new Map<string, Array<(e: Entry | null) => void>>();
let queue = new Set<string>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
  const ids = Array.from(queue);
  queue = new Set();
  timer = null;
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 200) chunks.push(ids.slice(i, i + 200));
  for (const chunk of chunks) {
    let found: Record<string, Entry> = {};
    try {
      const res = await fetch('/api/admin/proxy/lookup/names', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: chunk }),
      });
      if (res.ok) {
        const json = (await res.json()) as { data?: Record<string, Entry> };
        found = json.data ?? {};
      }
    } catch {
      /* keep the short id */
    }
    for (const id of chunk) {
      const e = found[id] ?? null;
      cache.set(id, e);
      (waiters.get(id) ?? []).forEach((cb) => cb(e));
      waiters.delete(id);
    }
  }
}

function request(id: string, cb: (e: Entry | null) => void) {
  if (cache.has(id)) return cb(cache.get(id) ?? null);
  const list = waiters.get(id) ?? [];
  list.push(cb);
  waiters.set(id, list);
  queue.add(id);
  if (!timer) timer = setTimeout(flush, 30);
}

export function AdminIdCell({ id, fallbackLabel }: Props) {
  const [entry, setEntry] = useState<Entry | null | undefined>(cache.has(id) ? cache.get(id) : undefined);
  useEffect(() => {
    let alive = true;
    request(id, (e) => alive && setEntry(e));
    return () => {
      alive = false;
    };
  }, [id]);

  if (entry) {
    return (
      <span title={entry.detail && entry.detail !== entry.name ? `${entry.name} — ${entry.detail}` : entry.name}>
        {entry.name}
      </span>
    );
  }
  return (
    <span className="font-mono text-xs text-[var(--text-muted)] whitespace-nowrap" title={id}>
      {fallbackLabel ?? `${id.slice(0, 8)}…`}
    </span>
  );
}
