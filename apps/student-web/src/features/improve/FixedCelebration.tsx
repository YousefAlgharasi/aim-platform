import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n/I18nContext';
import { prettifySkillId, type WeaknessRecordEntry } from '../progress/aimApi';

/** Pure: the resolved weakness ids not yet celebrated. The first ever call only records history (no confetti for old wins). */
export function pickNewlyFixed(records: WeaknessRecordEntry[], seen: string[] | null): { fresh: WeaknessRecordEntry[]; all: string[] } {
  const resolved = records.filter((r) => r.status.toLowerCase() === 'resolved');
  const all = resolved.map((r) => r.weaknessId);
  if (seen === null) return { fresh: [], all };
  const known = new Set(seen);
  return { fresh: resolved.filter((r) => !known.has(r.weaknessId)), all };
}

const key = (uid: string) => `aim_celebrated_fixes:${uid}`;
function read(uid: string): string[] | null {
  try { const v = localStorage.getItem(key(uid)); return v ? (JSON.parse(v) as string[]) : null; } catch { return null; }
}
function write(uid: string, ids: string[]) {
  try { localStorage.setItem(key(uid), JSON.stringify(ids)); } catch { /* per-browser convenience only */ }
}

const CONFETTI = ['bg-brand', 'bg-secondary', 'bg-success', 'bg-warning', 'bg-danger'];

/** A one-time "you fixed it" moment when a weak spot turns resolved. */
export function FixedCelebration({ records }: { records: WeaknessRecordEntry[] }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const [fresh, setFresh] = useState<WeaknessRecordEntry[]>([]);
  const uid = user?.id;

  useEffect(() => {
    if (!uid) return;
    const { fresh: f, all } = pickNewlyFixed(records, read(uid));
    write(uid, all);
    setFresh(f);
  }, [uid, records]);

  if (fresh.length === 0) return null;
  const names = fresh.slice(0, 3).map((r) => prettifySkillId(r.skillId)).join(', ');
  return (
    <div role="status" className="rise-in relative overflow-hidden rounded-2xl bg-success-soft p-5 text-success-ink ring-1 ring-success-line">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 motion-reduce:hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className={`absolute top-0 size-2 rounded-sm ${CONFETTI[i % CONFETTI.length]} animate-[confetti-fall_1.8s_ease-in_forwards]`} style={{ insetInlineStart: `${(i * 7 + 3) % 100}%`, animationDelay: `${(i % 5) * 0.12}s` }} />
        ))}
      </div>
      <div className="relative flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="m-0 text-lg font-semibold">{t('You fixed a weak spot!')}</p>
          <p className="m-0 mt-0.5 text-sm [unicode-bidi:plaintext]">{names}</p>
        </div>
        <button type="button" onClick={() => setFresh([])} className="min-h-10 shrink-0 cursor-pointer rounded-xl border-0 bg-white/60 px-3 text-sm font-bold text-success-ink hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">{t('Nice!')}</button>
      </div>
    </div>
  );
}
