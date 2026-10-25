import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/client';
import { fetchMyCertificates, formatIssued, overallPercent, totalPoints, type Certificate } from './certificatesApi';

/** Port of Flutter certificates_list_page.dart (GET /certificates/my). */
export function CertificatesPage() {
  const [items, setItems] = useState<Certificate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await fetchMyCertificates());
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load your certificates.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!items) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="m-0 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Certificates</h1>

      {items.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          message="Complete a course and pass its final exam to earn your first certificate."
        />
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
          {items.map((c) => {
            const pct = overallPercent(c);
            const pts = totalPoints(c);
            return (
              <li key={c.id}>
                <Link to={`/certificates/${c.id}`} className="block rounded-2xl no-underline text-inherit transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5] [&>div]:hover:ring-indigo-300 dark:[&>div]:hover:ring-indigo-500/60">
                  <Card>
                    <div className="flex items-center gap-3.5">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl dark:bg-indigo-950/60" aria-hidden="true">🎓</span>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Certificate of completion</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{c.courseTitle || 'Course'}</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Issued {formatIssued(c.issuedAt)}</span>
                      </div>
                      {pct != null && (
                        <div className="flex shrink-0 flex-col items-end">
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-sm font-extrabold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">{pct}%</span>
                          {pts != null && <span className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{pts} / 1000</span>}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
