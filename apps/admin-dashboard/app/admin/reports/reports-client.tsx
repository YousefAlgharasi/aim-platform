'use client';

import { AdminCard } from '../../../components/common';
import type {
  AdminEnrollmentReport,
  AdminAssessmentReport,
  AdminActiveUsersReport,
} from '../../../lib/api/admin-reports-api';

type Props = {
  readonly enrollment: AdminEnrollmentReport;
  readonly assessment: AdminAssessmentReport;
  readonly activeUsers: AdminActiveUsersReport;
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="aim-stat-card">
      <span className="aim-stat-label">{label}</span>
      <span className="aim-stat-value">{value}</span>
      {sub && <span className="aim-stat-sub">{sub}</span>}
    </div>
  );
}

export function ReportsClient({ enrollment, assessment, activeUsers }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      {/* Enrollment */}
      <AdminCard title="Enrollments" description={enrollment.period || 'All time'}>
        <div className="aim-stat-grid">
          <StatCard label="Total Enrollments" value={enrollment.totalEnrollments} />
          <StatCard label="New Enrollments" value={enrollment.newEnrollments} />
          <StatCard label="Active Courses" value={enrollment.activeCourses} />
        </div>
      </AdminCard>

      {/* Assessments */}
      <AdminCard title="Assessments" description={assessment.period || 'All time'}>
        <div className="aim-stat-grid">
          <StatCard label="Total Attempts" value={assessment.totalAttempts} />
          <StatCard label="Passed" value={assessment.passed} />
          <StatCard label="Failed" value={assessment.failed} />
          <StatCard label="Avg Score" value={`${assessment.avgScore}%`} sub="Backend-computed" />
        </div>
      </AdminCard>

      {/* Active Users */}
      <AdminCard title="Active Users" description={activeUsers.period || 'Current'}>
        <div className="aim-stat-grid">
          <StatCard label="Daily Active" value={activeUsers.dailyActiveUsers} />
          <StatCard label="Weekly Active" value={activeUsers.weeklyActiveUsers} />
          <StatCard label="Monthly Active" value={activeUsers.monthlyActiveUsers} />
        </div>
      </AdminCard>

      <style>{`
        .aim-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: var(--space-16);
        }
        .aim-stat-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          padding: var(--space-16);
          border-radius: var(--radius-md);
          background: var(--surface-sunken);
        }
        .aim-stat-label {
          font-size: 12px;
          font-weight: var(--weight-semibold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .aim-stat-value {
          font-size: 28px;
          font-weight: var(--weight-bold);
          color: var(--text-primary);
          line-height: 1.2;
        }
        .aim-stat-sub {
          font-size: 11px;
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
