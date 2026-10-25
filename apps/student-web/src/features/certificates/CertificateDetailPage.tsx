import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/client';
import { fetchCertificate, formatIssued, overallPercent, totalPoints, type Certificate } from './certificatesApi';
import styles from './Certificates.module.css';

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
      <div className={styles.container}>
        <Link to="/certificates" className={styles.backLink}>← Certificates</Link>
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
    <div className={styles.container}>
      <Link to="/certificates" className={styles.backLink}>← Certificates</Link>

      <Card>
        <div className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">🎓</span>
          <span className={styles.eyebrow}>Certificate of completion</span>
          {cert.studentName && <span className={styles.meta}>Awarded to</span>}
          {cert.studentName && <span className={styles.studentName}>{cert.studentName}</span>}
          <span className={styles.meta}>for successfully completing</span>
          <h1 className={styles.heroTitle}>{cert.courseTitle || 'Course'}</h1>
          <span className={styles.meta}>Issued {formatIssued(cert.issuedAt)}</span>
          {pct != null && (
            <div className={styles.heroScore}>
              <span className={styles.scoreValue}>{pct}%</span>
              {pts != null && <span className={styles.meta}>{pts} / {b?.maxPoints ?? 1000} points</span>}
            </div>
          )}
        </div>
      </Card>

      {rows.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>Score breakdown</h2>
          <Card>
            <ul className={styles.rows}>
              {rows.map((r) => {
                const w = r.max > 0 ? Math.min(100, Math.round((r.points / r.max) * 100)) : 0;
                return (
                  <li key={r.label} className={styles.row}>
                    <div className={styles.rowHeader}>
                      <span className={styles.rowLabel}>{r.label}</span>
                      <span className={styles.meta}>
                        {Math.round(r.points)} / {r.max} pts
                        {r.percent != null ? ` · ${Math.round(r.percent)}%` : ''}
                      </span>
                    </div>
                    <div
                      className={styles.bar}
                      role="progressbar"
                      aria-label={`${r.label} points`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={w}
                    >
                      <div className={styles.barFill} style={{ width: `${w}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>
      )}

      {cert.scoreSnapshot.length > 0 && (
        <section>
          <h2 className={styles.sectionTitle}>Assessments</h2>
          <Card>
            <ul className={styles.rows}>
              {cert.scoreSnapshot.map((s) => (
                <li key={s.assessmentId} className={styles.rowHeader}>
                  <div className={styles.listText}>
                    <span className={styles.rowLabel}>{s.title}</span>
                    <span className={styles.meta}>
                      {s.isFinalExam ? 'Final exam' : s.type === 'exam' ? 'Exam' : 'Quiz'} · {s.score} / {s.maxScore}
                    </span>
                  </div>
                  <span className={s.passed ? styles.passed : styles.failed}>
                    {Math.round(s.scorePercent)}% · {s.passed ? 'Passed' : 'Not passed'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {cert.verificationUrl && (
        <section>
          <h2 className={styles.sectionTitle}>Verification</h2>
          <Card>
            <div className={styles.verify}>
              <span className={styles.meta}>Anyone can verify this certificate with this link:</span>
              <code className={styles.url}>{cert.verificationUrl}</code>
              <div className={styles.verifyActions}>
                <Button size="sm" variant="secondary" onClick={() => copyLink(cert.verificationUrl!)}>
                  Copy link
                </Button>
                <span className={styles.meta} role="status">
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
