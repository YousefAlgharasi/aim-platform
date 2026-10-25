import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
      setError(getErrorMessage(err, 'Could not load this certificate.'));
    } finally {
      setLoading(false);
    }
  }, [certificateId]);

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
        <Link to="/certificates" className="inline-flex min-h-10 items-center gap-2 self-start no-underline text-sm font-semibold text-slate-600 hover:text-[#4F46E5] dark:text-slate-300 dark:hover:text-indigo-400">
          <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <svg className="size-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </span>
          Certificates
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
        { label: 'Lesson practice', points: b.practicePoints, max: b.practiceMaxPoints, percent: b.practiceAccuracyPercent },
        { label: 'Chapter quizzes', points: b.quizPoints, max: b.quizMaxPoints, percent: b.quizAveragePercent },
        { label: 'Chapter exams', points: b.chapterExamPoints, max: b.chapterExamMaxPoints, percent: b.chapterExamAveragePercent },
        { label: 'Final exam', points: b.finalExamPoints, max: b.finalExamMaxPoints, percent: b.finalExamPercent },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <Link to="/certificates" className="inline-flex min-h-10 items-center gap-2 self-start no-underline text-sm font-semibold text-slate-600 hover:text-[#4F46E5] dark:text-slate-300 dark:hover:text-indigo-400">
          <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <svg className="size-4 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
          </span>
          Certificates
        </Link>

      <div className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-6 text-center text-white shadow-xl shadow-indigo-500/25">
        <div className="pointer-events-none absolute top-0 end-0 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col items-center gap-1.5">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-md" aria-hidden="true">🎓</span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-100">Certificate of completion</span>
          {cert.studentName && <span className="text-xs font-medium text-indigo-100/90">Awarded to</span>}
          {cert.studentName && <span className="text-lg font-extrabold">{cert.studentName}</span>}
          <span className="text-xs font-medium text-indigo-100/90">for successfully completing</span>
          <h1 className="m-0 text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">{cert.courseTitle || 'Course'}</h1>
          <span className="text-xs font-medium text-indigo-100/90">Issued {formatIssued(cert.issuedAt)}</span>
          {pct != null && (
            <div className="mt-2 flex flex-col items-center gap-1">
              <span className="rounded-full bg-white/20 px-4 py-1.5 text-xl font-extrabold backdrop-blur-md">{pct}%</span>
              {pts != null && <span className="text-xs font-medium text-indigo-100/90">{pts} / {b?.maxPoints ?? 1000} points</span>}
            </div>
          )}
        </div>
      </div>

      {rows.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 px-1 text-base font-extrabold tracking-tight text-slate-900 dark:text-white">Score breakdown</h2>
          <Card>
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {rows.map((r) => {
                const w = r.max > 0 ? Math.min(100, Math.round((r.points / r.max) * 100)) : 0;
                return (
                  <li key={r.label} className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{r.label}</span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {Math.round(r.points)} / {r.max} pts
                        {r.percent != null ? ` · ${Math.round(r.percent)}%` : ''}
                      </span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
                      role="progressbar"
                      aria-label={`${r.label} points`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={w}
                    >
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300" style={{ width: `${w}%` }} />
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
          <h2 className="m-0 px-1 text-base font-extrabold tracking-tight text-slate-900 dark:text-white">Assessments</h2>
          <Card>
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {cert.scoreSnapshot.map((s) => (
                <li key={s.assessmentId} className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{s.title}</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {s.isFinalExam ? 'Final exam' : s.type === 'exam' ? 'Exam' : 'Quiz'} · {s.score} / {s.maxScore}
                    </span>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${s.passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'}`}>
                    {Math.round(s.scorePercent)}% · {s.passed ? 'Passed' : 'Not passed'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {cert.verificationUrl && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 px-1 text-base font-extrabold tracking-tight text-slate-900 dark:text-white">Verification</h2>
          <Card>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Anyone can verify this certificate with this link:</span>
              <code className="block rounded-xl bg-slate-50 p-3 text-xs text-slate-700 [overflow-wrap:anywhere] dark:bg-slate-900/40 dark:text-slate-200">{cert.verificationUrl}</code>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" variant="secondary" onClick={() => copyLink(cert.verificationUrl!)}>
                  Copy link
                </Button>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400" role="status">
                  {copied === 'copied' ? 'Link copied.' : copied === 'failed' ? 'Copy failed — select the link to copy it.' : ''}
                </span>
              </div>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
