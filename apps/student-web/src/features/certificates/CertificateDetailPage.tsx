import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/client';
import { fetchCertificate, formatIssued, overallPercent, totalPoints, type Certificate } from './certificatesApi';

interface BreakdownRow {
  label: string;
  points: number;
  max: number;
  percent?: number;
}

/** Port of Flutter certificate_detail_page.dart (GET /certificates/:id). */
export function CertificateDetailPage() {
  const { t } = useI18n();
  const { certificateId = '' } = useParams<{ certificateId: string }>();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'idle' | 'copied' | 'failed'>('idle');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCert(await fetchCertificate(certificateId));
    } catch (err) {
      setError(getErrorMessage(err, t('Could not load this certificate.')));
    } finally {
      setLoading(false);
    }
  }, [certificateId, t]);

  useEffect(() => {
    load();
  }, [load]);

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied('copied');
    } catch {
      setCopied('failed');
    }
  }

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <Link to="/certificates" className="inline-flex min-h-10 items-center gap-2 self-start no-underline text-sm font-semibold text-ink-soft hover:text-brand-ink">
          <span className="flex size-10 items-center justify-center rounded-xl bg-control">
            <svg className="size-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </span>
          {t('Certificates')}
        </Link>
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }
  if (!cert) return null;

  const pct = overallPercent(cert);
  const pts = totalPoints(cert);
  const b = cert.breakdown;
  const rows: BreakdownRow[] = b
    ? [
        { label: t('Lesson practice'), points: b.practicePoints, max: b.practiceMaxPoints, percent: b.practiceAccuracyPercent },
        { label: t('Chapter quizzes'), points: b.quizPoints, max: b.quizMaxPoints, percent: b.quizAveragePercent },
        { label: t('Chapter exams'), points: b.chapterExamPoints, max: b.chapterExamMaxPoints, percent: b.chapterExamAveragePercent },
        { label: t('Final exam'), points: b.finalExamPoints, max: b.finalExamMaxPoints, percent: b.finalExamPercent },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <Link to="/certificates" className="inline-flex min-h-10 items-center gap-2 self-start no-underline text-sm font-semibold text-ink-soft hover:text-brand-ink">
          <span className="flex size-10 items-center justify-center rounded-xl bg-control">
            <svg className="size-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </span>
          {t('Certificates')}
        </Link>

      <div className="relative overflow-hidden rounded-3xl border border-brand-ink/20 bg-gradient-to-br from-brand via-brand to-secondary p-6 text-center text-white shadow-xl shadow-brand/25">
        <div className="pointer-events-none absolute top-0 end-0 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col items-center gap-1.5">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-md" aria-hidden="true">🎓</span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-on-brand">{t('Certificate of completion')}</span>
          {cert.studentName && <span className="text-xs font-medium text-on-brand">{t('Awarded to')}</span>}
          {cert.studentName && <span className="text-lg font-extrabold">{cert.studentName}</span>}
          <span className="text-xs font-medium text-on-brand">{t('for successfully completing')}</span>
          <h1 className="m-0 text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">{cert.courseTitle || t('Course')}</h1>
          <span className="text-xs font-medium text-on-brand">{t('Issued {date}', { date: formatIssued(cert.issuedAt) })}</span>
          {pct != null && (
            <div className="mt-2 flex flex-col items-center gap-1">
              <span className="rounded-full bg-white/20 px-4 py-1.5 text-xl font-extrabold backdrop-blur-md">{pct}%</span>
              {pts != null && <span className="text-xs font-medium text-on-brand">{t('{pts} / {max} points', { pts, max: b?.maxPoints ?? 1000 })}</span>}
            </div>
          )}
        </div>
      </div>

      {rows.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 px-1 text-base font-extrabold tracking-tight text-ink">{t('Score breakdown')}</h2>
          <Card>
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {rows.map((r) => {
                const w = r.max > 0 ? Math.min(100, Math.round((r.points / r.max) * 100)) : 0;
                return (
                  <li key={r.label} className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-ink">{r.label}</span>
                      <span className="text-xs font-medium text-ink-muted">
                        {t('{pts} / {max} pts', { pts: Math.round(r.points), max: r.max })}
                        {r.percent != null ? ` · ${Math.round(r.percent)}%` : ''}
                      </span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                      role="progressbar"
                      aria-label={t('{label} points', { label: r.label })}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={w}
                    >
                      <div className="h-full rounded-full bg-gradient-to-r from-brand to-secondary transition-all duration-300" style={{ width: `${w}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      )}

      {cert.scoreSnapshot.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 px-1 text-base font-extrabold tracking-tight text-ink">{t('Assessments')}</h2>
          <Card>
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {cert.scoreSnapshot.map((s) => (
                <li key={s.assessmentId} className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-bold text-ink">{s.title}</span>
                    <span className="text-xs font-medium text-ink-muted">
                      {s.isFinalExam ? t('Final exam') : s.type === 'exam' ? t('Exam') : t('Quiz')} · {s.score} / {s.maxScore}
                    </span>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${s.passed ? 'bg-success-soft text-success-ink' : 'bg-danger-soft text-danger-ink'}`}>
                    {Math.round(s.scorePercent)}% · {s.passed ? t('Passed') : t('Not passed')}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {cert.verificationUrl && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 px-1 text-base font-extrabold tracking-tight text-ink">{t('Verification')}</h2>
          <Card>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium text-ink-muted">{t('Anyone can verify this certificate with this link:')}</span>
              <code dir="ltr" className="block rounded-xl bg-surface-sunken p-3 text-xs text-ink-soft [overflow-wrap:anywhere] ">{cert.verificationUrl}</code>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" variant="secondary" onClick={() => copyLink(cert.verificationUrl!)}>
                  {t('Copy link')}
                </Button>
                <span className="text-xs font-medium text-ink-muted" role="status">
                  {copied === 'copied' ? t('Link copied.') : copied === 'failed' ? t('Copy failed — select the link to copy it.') : ''}
                </span>
              </div>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
