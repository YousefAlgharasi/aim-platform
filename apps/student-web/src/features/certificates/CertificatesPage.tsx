import { PageTitleBar } from '../../components/common/PageTitleBar';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { CardGridSkeleton } from '../../components/common/Skeleton';
import { getErrorMessage } from '../../api/client';
import { fetchMyCertificates, formatIssued, overallPercent, totalPoints, type Certificate } from './certificatesApi';

/** Port of Flutter certificates_list_page.dart (GET /certificates/my). */
export function CertificatesPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<Certificate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await fetchMyCertificates());
    } catch (err) {
      setError(getErrorMessage(err, t('Could not load your certificates.')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <CardGridSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!items) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageTitleBar title={t('Certificates')} />

      {items.length === 0 ? (
        <EmptyState
          title={t('No certificates yet')}
          message={t('Complete a course and pass its final exam to earn your first certificate.')}
        />
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
          {items.map((c) => {
            const pct = overallPercent(c);
            const pts = totalPoints(c);
            return (
              <li key={c.id}>
                <Link to={`/certificates/${c.id}`} className="block rounded-2xl no-underline text-inherit transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&>div]:hover:ring-line-strong dark:[&>div]:hover:ring-brand-ink/60">
                  <Card>
                    <div className="flex items-center gap-3.5">
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-xs font-semibold text-brand-ink">{t('Certificate of completion')}</span>
                        <span className="text-sm font-bold text-ink">{c.courseTitle || t('Course')}</span>
                        <span className="text-xs font-medium text-ink-muted">{t('Issued {date}', { date: formatIssued(c.issuedAt) })}</span>
                      </div>
                      {pct != null && (
                        <div className="flex shrink-0 flex-col items-end">
                          <span className="rounded-full bg-success-soft px-2.5 py-1 text-sm font-semibold text-success-ink">{pct}%</span>
                          {pts != null && <span className="mt-1 text-xs font-medium text-ink-muted">{pts} / 1000</span>}
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
