import { useCallback, useEffect, useRef, useState } from 'react';
import { BackButton } from '../../components/common/BackButton';
import { useParams } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';
import { Card } from '../../components/common/Card';
import { ErrorState } from '../../components/common/ErrorState';
import { DetailSkeleton } from '../../components/common/Skeleton';
import { getErrorMessage } from '../../api/client';
import { fetchCertificate, formatIssued, overallPercent, type Certificate } from './certificatesApi';
import { CERT_H, CERT_W, certificateFileName, drawCertificate, loadCertificateFonts } from './certificateImage';

interface BreakdownRow {
  label: string;
  points: number;
  max: number;
  percent?: number;
}

/** Port of Flutter certificate_detail_page.dart (GET /certificates/:id). */
export function CertificateDetailPage() {
  const { t, locale, formatNumber } = useI18n();
  const { certificateId = '' } = useParams<{ certificateId: string }>();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadError, setDownloadError] = useState('');

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

  // Draw the certificate picture (and redraw if the language changes).
  const pctNow = cert ? overallPercent(cert) : null;
  useEffect(() => {
    if (!cert) return undefined;
    let cancelled = false;
    void loadCertificateFonts().then(() => {
      const ctx = canvasRef.current?.getContext('2d');
      if (cancelled || !ctx) return;
      drawCertificate(ctx, {
        studentName: cert.studentName,
        courseTitle: cert.courseTitle || t('Course'),
        scorePercent: pctNow,
        issuedText: formatIssued(cert.issuedAt),
        reference: cert.id.slice(0, 8).toUpperCase(),
        rtl: locale === 'ar',
        formatNumber,
        labels: {
          brand: 'AIM English',
          title: t('Certificate of completion'),
          presentedTo: t('This certificate is proudly presented to'),
          forCompleting: t('for successfully completing'),
          finalScore: t('Final score'),
          issued: t('Issued'),
          reference: t('Certificate ID'),
        },
      });
    });
    return () => { cancelled = true; };
  }, [cert, pctNow, locale, t, formatNumber]);

  function downloadPng() {
    setDownloadError('');
    const canvas = canvasRef.current;
    if (!canvas || !cert) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        setDownloadError(t('Could not create the image. Please try again.'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = certificateFileName(cert.courseTitle || t('Course'));
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }

  if (loading) return <DetailSkeleton />;
  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <BackButton fallback="/certificates" className="self-start" />
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }
  if (!cert) return null;

  const pct = pctNow;
  const b = cert.breakdown;
  // The mark is out of 100. Each part is shown on that same scale, so the parts add up to the mark.
  // Chapter exams are not part of it.
  const on100 = (points: number) => Math.round(points) / 10;
  const rows: BreakdownRow[] = b
    ? [
        { label: t('Lesson practice'), points: b.practicePoints, max: b.practiceMaxPoints, percent: b.practiceAccuracyPercent },
        { label: t('Chapter quizzes'), points: b.quizPoints, max: b.quizMaxPoints, percent: b.quizAveragePercent },
        { label: t('Final exam'), points: b.finalExamPoints, max: b.finalExamMaxPoints, percent: b.finalExamPercent },
      ].filter((r) => r.max > 0)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <BackButton fallback="/certificates" className="self-start" />

      <section className="flex flex-col gap-4" aria-label={t('Certificate')}>
        <canvas
          ref={canvasRef}
          width={CERT_W}
          height={CERT_H}
          role="img"
          aria-label={t('Certificate of completion for {course}', { course: cert.courseTitle || t('Course') })}
          className="block h-auto w-full rounded-2xl bg-white shadow-sm ring-1 ring-line"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={downloadPng}
            className="inline-flex h-14 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-brand px-8 text-base font-semibold text-white transition hover:bg-brand-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-page"
          >
            {t('Download certificate (PNG)')}
          </button>
          {downloadError && <span role="alert" className="text-sm font-medium text-danger-ink">{downloadError}</span>}
        </div>
      </section>

      {rows.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 px-1 text-xl font-semibold tracking-tight text-ink">{t('Score breakdown')}</h2>
          <Card>
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {rows.map((r) => {
                const w = r.max > 0 ? Math.min(100, Math.round((r.points / r.max) * 100)) : 0;
                return (
                  <li key={r.label} className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-ink">{r.label}</span>
                      <span className="text-xs font-medium text-ink-muted">
                        {t('{pts} / {max} pts', { pts: formatNumber(on100(r.points)), max: formatNumber(on100(r.max)) })}
                        {r.percent != null ? ` · ${formatNumber(Math.round(r.percent))}%` : ''}
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
                      <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${w}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
            {pct != null && (
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
                <span className="text-base font-semibold text-ink">{t('Your mark')}</span>
                <span dir="ltr" className="lp-num text-2xl font-semibold text-ink">
                  {formatNumber(pct)}<span className="text-ink-muted"> / {formatNumber(100)}</span>
                </span>
              </div>
            )}
          </Card>
        </section>
      )}

      {cert.scoreSnapshot.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 px-1 text-xl font-semibold tracking-tight text-ink">{t('Assessments')}</h2>
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
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${s.passed ? 'bg-success-soft text-success-ink' : 'bg-danger-soft text-danger-ink'}`}>
                    {Math.round(s.scorePercent)}% · {s.passed ? t('Passed') : t('Not passed')}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </div>
  );
}
