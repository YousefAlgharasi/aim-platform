import { getAdminToken } from '../../../../core/api/admin-token';
import { AdminApiClientError } from '../../../../core/api';
import { fetchAdminCertificate } from '../../../../core/api/admin-certificate-api';

type Props = {
  params: Promise<{ certificateId: string }>;
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function CertificateViewPage({ params }: Props) {
  const { certificateId } = await params;
  const token = await getAdminToken();

  let certificate = null;
  let fetchError: string | null = null;

  try {
    certificate = await fetchAdminCertificate(token, certificateId);
  } catch (error) {
    fetchError =
      error instanceof AdminApiClientError
        ? `Backend error ${error.status}: ${error.message}`
        : 'Failed to load certificate.';
  }

  if (fetchError || !certificate) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <p role="alert" style={{ color: 'var(--color-error-700, #b91c1c)' }}>
          {fetchError ?? 'Certificate not found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="certificate-page">
      <style>{`
        .certificate-page {
          max-width: 760px;
          margin: 40px auto;
          padding: 56px;
          background: #ffffff;
          color: #1a1a1a;
          border: 1px solid #d9d3c3;
          border-radius: 8px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          font-family: Georgia, 'Times New Roman', serif;
        }
        .certificate-eyebrow {
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 12px;
          color: #8a7a4a;
          margin: 0 0 8px;
        }
        .certificate-heading {
          text-align: center;
          font-size: 32px;
          margin: 0 0 32px;
          color: #1a1a1a;
        }
        .certificate-line {
          text-align: center;
          font-size: 15px;
          color: #444;
          margin: 4px 0;
        }
        .certificate-student-name {
          text-align: center;
          font-size: 28px;
          font-weight: bold;
          margin: 16px 0;
          color: #1a1a1a;
        }
        .certificate-course-title {
          text-align: center;
          font-size: 20px;
          font-style: italic;
          margin: 0 0 24px;
          color: #333;
        }
        .certificate-divider {
          border: none;
          border-top: 1px solid #d9d3c3;
          margin: 32px 0;
        }
        .certificate-scores-title {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #666;
          margin: 0 0 12px;
        }
        .certificate-scores-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .certificate-scores-table th,
        .certificate-scores-table td {
          text-align: left;
          padding: 8px 10px;
          border-bottom: 1px solid #eee7d5;
        }
        .certificate-scores-table th {
          color: #666;
          font-weight: normal;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        .certificate-pass { color: #1a7a3c; font-weight: bold; }
        .certificate-fail { color: #a3252f; font-weight: bold; }
        .certificate-footer {
          text-align: center;
          margin-top: 32px;
          font-size: 13px;
          color: #888;
        }
        @media print {
          .sn-sidebar, .admin-breadcrumb, .sn-hamburger, .sn-overlay {
            display: none !important;
          }
          .certificate-page {
            box-shadow: none;
            border: none;
            margin: 0;
          }
          body {
            background: #ffffff !important;
          }
        }
      `}</style>

      <p className="certificate-eyebrow">Certificate of Completion</p>
      <h1 className="certificate-heading">AIM Language Platform</h1>

      <p className="certificate-line">This certifies that</p>
      <p className="certificate-student-name">{certificate.studentName ?? 'Student'}</p>
      <p className="certificate-line">has successfully completed the course</p>
      <p className="certificate-course-title">{certificate.courseTitle}</p>
      <p className="certificate-line">Issued on {formatDate(certificate.issuedAt)}</p>

      <hr className="certificate-divider" />

      <p className="certificate-scores-title">Assessment Results</p>
      {certificate.scoreSnapshot.length === 0 ? (
        <p style={{ color: '#888', fontSize: '14px' }}>No assessment scores recorded for this certificate.</p>
      ) : (
        <table className="certificate-scores-table">
          <thead>
            <tr>
              <th>Assessment</th>
              <th>Type</th>
              <th>Score</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {certificate.scoreSnapshot.map((entry) => (
              <tr key={entry.assessmentId}>
                <td>{entry.title}</td>
                <td style={{ textTransform: 'capitalize' }}>{entry.type}</td>
                <td>
                  {entry.score} / {entry.maxScore}
                </td>
                <td className={entry.passed ? 'certificate-pass' : 'certificate-fail'}>
                  {entry.passed ? 'Passed' : 'Failed'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="certificate-footer">Certificate ID: {certificate.id}</p>
    </div>
  );
}
