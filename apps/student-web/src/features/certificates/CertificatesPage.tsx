import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getErrorMessage } from '../../api/client';
import { fetchMyCertificates, formatIssued, overallPercent, totalPoints, type Certificate } from './certificatesApi';
import styles from './Certificates.module.css';

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
    <div className={styles.container}>
      <h1 className={styles.heading}>Certificates</h1>

      {items.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          message="Complete a course and pass its final exam to earn your first certificate."
        />
      ) : (
        <ul className={styles.grid}>
          {items.map((c) => {
            const pct = overallPercent(c);
            const pts = totalPoints(c);
            return (
              <li key={c.id}>
                <Link to={`/certificates/${c.id}`} className={styles.cardLink}>
                  <Card>
                    <div className={styles.listItem}>
                      <span className={styles.icon} aria-hidden="true">🎓</span>
                      <div className={styles.listText}>
                        <span className={styles.eyebrow}>Certificate of completion</span>
                        <span className={styles.title}>{c.courseTitle || 'Course'}</span>
                        <span className={styles.meta}>Issued {formatIssued(c.issuedAt)}</span>
                      </div>
                      {pct != null && (
                        <div className={styles.score}>
                          <span className={styles.scoreValue}>{pct}%</span>
                          {pts != null && <span className={styles.meta}>{pts} / 1000</span>}
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
