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
        .certificate-breakdown-card {
          background: #fbfaf6;
          border: 1px solid #e7e2d4;
          border-radius: 6px;
          padding: 18px 24px;
          margin-bottom: 24px;
        }
        .certificate-breakdown-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 0;
          border-bottom: 1px dashed #e2dcce;
          font-size: 14px;
        }
        .certificate-breakdown-row:last-child {
          border-bottom: none;
        }
        .certificate-breakdown-label {
          color: #2b2b2b;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .certificate-weight-badge {
          background: #eae4d4;
          color: #65583b;
          font-size: 11px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .certificate-breakdown-value {
          font-variant-numeric: tabular-nums;
          font-weight: 600;
          color: #1a1a1a;
        }
        .certificate-grand-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0 0;
          margin-top: 12px;
          border-top: 2px solid #8a7a4a;
        }
        .certificate-grand-score {
          font-size: 22px;
          font-weight: bold;
          color: #1a1a1a;
          font-variant-numeric: tabular-nums;
        }
        .certificate-grand-percent {
          font-size: 26px;
          font-weight: bold;
          color: #1b6336;
          font-variant-numeric: tabular-nums;
        }
        .certificate-scores-title {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #666;
          margin: 0 0 12px;
        }
        .certificate-report-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          padding: 8px 0;
          border-bottom: 1px solid #eee7d5;
          font-size: 14px;
        }
        .certificate-report-label {
          color: #333;
        }
        .certificate-report-type {
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.05em;
          color: #8a7a4a;
          margin-right: 8px;
        }
        .certificate-report-score {
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .certificate-pass { color: #1a7a3c; font-weight: bold; }
        .certificate-fail { color: #a3252f; font-weight: bold; }
        .certificate-verify-box {
          margin-top: 24px;
          padding: 12px;
          background: #f4f6fa;
          border: 1px solid #dce2ee;
          border-radius: 6px;
          text-align: center;
          font-size: 13px;
        }
        .certificate-verify-link {
          color: #2563eb;
          text-decoration: underline;
          word-break: break-all;
        }
        .certificate-footer {
          text-align: center;
          margin-top: 28px;
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

      {/* 1,000-Point Scoring Breakdown */}
      <p className="certificate-scores-title">Course Evaluation (1,000 Points System)</p>
      {certificate.breakdown ? (
        <div className="certificate-breakdown-card">
          <div className="certificate-breakdown-row">
            <span className="certificate-breakdown-label">
              <span>Lesson Practices</span>
              <span className="certificate-weight-badge">20% Weight</span>
            </span>
            <span className="certificate-breakdown-value">
              {certificate.breakdown.practicePoints} / 200 pts{' '}
              <span style={{ color: '#666', fontWeight: 'normal', fontSize: '13px' }}>
                ({certificate.breakdown.practiceAccuracyPercent}% accuracy)
              </span>
            </span>
          </div>

          <div className="certificate-breakdown-row">
            <span className="certificate-breakdown-label">
              <span>Chapter Quizzes</span>
              <span className="certificate-weight-badge">20% Weight</span>
            </span>
            <span className="certificate-breakdown-value">
              {certificate.breakdown.quizPoints} / 200 pts{' '}
              <span style={{ color: '#666', fontWeight: 'normal', fontSize: '13px' }}>
                ({certificate.breakdown.quizAveragePercent}% avg)
              </span>
            </span>
          </div>

          <div className="certificate-breakdown-row">
            <span className="certificate-breakdown-label">
              <span>Chapter Exams</span>
              <span className="certificate-weight-badge">20% Weight</span>
            </span>
            <span className="certificate-breakdown-value">
              {certificate.breakdown.chapterExamPoints} / 200 pts{' '}
              <span style={{ color: '#666', fontWeight: 'normal', fontSize: '13px' }}>
                ({certificate.breakdown.chapterExamAveragePercent}% avg)
              </span>
            </span>
          </div>

          <div className="certificate-breakdown-row">
            <span className="certificate-breakdown-label">
              <span>Course Final Exam</span>
              <span className="certificate-weight-badge">40% Weight</span>
            </span>
            <span className="certificate-breakdown-value">
              {certificate.breakdown.finalExamPoints} / 400 pts{' '}
              <span style={{ color: '#666', fontWeight: 'normal', fontSize: '13px' }}>
                ({certificate.breakdown.finalExamPercent}%)
              </span>
            </span>
          </div>

          <div className="certificate-grand-total">
            <div>
              <div style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Points Earned
              </div>
              <div className="certificate-grand-score">
                {certificate.breakdown.totalPoints} / 1,000 pts
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Final Grade
              </div>
              <div className="certificate-grand-percent">
                {certificate.breakdown.overallPercent}%
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="certificate-breakdown-card">
          <div className="certificate-grand-total" style={{ borderTop: 'none', paddingTop: 0 }}>
            <div>
              <div style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>
                Total Grade
              </div>
              <div className="certificate-grand-score">
                {certificate.overallScorePercent !== null
                  ? `${Math.round(certificate.overallScorePercent * 10)} / 1,000 pts`
                  : 'N/A'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>
                Percentage
              </div>
              <div className="certificate-grand-percent">
                {certificate.overallScorePercent !== null ? `${certificate.overallScorePercent}%` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Assessments List */}
      {certificate.scoreSnapshot.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <p className="certificate-scores-title">Assessment Item Breakdown</p>
          <div>
            {certificate.scoreSnapshot.map((entry) => (
              <div key={entry.assessmentId} className="certificate-report-row">
                <span className="certificate-report-label">
                  <span className="certificate-report-type">{entry.type}</span>
                  {entry.title}
                </span>
                <span className="certificate-report-score">
                  {entry.scorePercent}%{' '}
                  <span className={entry.passed ? 'certificate-pass' : 'certificate-fail'}>
                    {entry.passed ? '✓' : '✗'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {certificate.verificationUrl && (
        <div className="certificate-verify-box">
          <span style={{ color: '#4b5563' }}>Public Verification Link: </span>
          <a
            href={certificate.verificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="certificate-verify-link"
          >
            {certificate.verificationUrl}
          </a>
        </div>
      )}

      <p className="certificate-footer">Certificate ID: {certificate.id}</p>
    </div>
  );
}
