'use client';

import type {
  AdminEnrollmentReport,
  AdminAssessmentReport,
  AdminActiveUsersReport,
} from '../api/admin-reports-api';
import {
  useEnrollmentReportQuery,
  useAssessmentReportQuery,
  useActiveUsersReportQuery,
} from '../hooks/use-analytics-query';
import { useUrlSearchParamsState } from '../../../core/hooks/use-url-search-params-state';

export type ReportTab = 'enrollment' | 'assessment' | 'active_users';

const TABS: { key: ReportTab; label: string }[] = [
  { key: 'enrollment', label: 'Enrollments' },
  { key: 'assessment', label: 'Assessments' },
  { key: 'active_users', label: 'Active Users' },
];

type Props = {
  readonly enrollment: AdminEnrollmentReport;
  readonly assessment: AdminAssessmentReport;
  readonly activeUsers: AdminActiveUsersReport;
  readonly token?: string;
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rc-stat">
      <p className="rc-stat-label">{label}</p>
      <p className="rc-stat-value">{value}</p>
      {sub && <p className="rc-stat-sub">{sub}</p>}
    </div>
  );
}

export function ReportsClient({
  enrollment: initialEnrollment,
  assessment: initialAssessment,
  activeUsers: initialActiveUsers,
  token = '',
}: Props) {
  const { getParam, setParams } = useUrlSearchParamsState();
  const rawTab = getParam('tab', 'enrollment');
  const activeTab: ReportTab = TABS.some((t) => t.key === rawTab)
    ? (rawTab as ReportTab)
    : 'enrollment';

  const { data: enrollment = initialEnrollment } = useEnrollmentReportQuery(
    token,
    undefined,
    initialEnrollment,
  );
  const { data: assessment = initialAssessment } = useAssessmentReportQuery(
    token,
    undefined,
    initialAssessment,
  );
  const { data: activeUsers = initialActiveUsers } = useActiveUsersReportQuery(
    token,
    undefined,
    initialActiveUsers,
  );

  const handleTabChange = (tabKey: ReportTab) => {
    setParams({ tab: tabKey });
  };

  return (
    <div className="rc-root">
      <div className="rc-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`rc-tab ${activeTab === tab.key ? 'rc-tab--active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'enrollment' && (
        <div className="rc-section">
          <div className="rc-section-header">
            <h2 className="rc-section-title">Enrollments</h2>
            {enrollment.period && <span className="rc-section-period">{enrollment.period}</span>}
          </div>
          <div className="rc-stat-grid">
            <StatCard label="Total Enrollments" value={enrollment.totalEnrollments.toLocaleString()} />
            <StatCard label="New Enrollments" value={enrollment.newEnrollments.toLocaleString()} />
            <StatCard label="Active Courses" value={enrollment.activeCourses.toLocaleString()} />
          </div>
        </div>
      )}

      {activeTab === 'assessment' && (
        <div className="rc-section">
          <div className="rc-section-header">
            <h2 className="rc-section-title">Assessments</h2>
            {assessment.period && <span className="rc-section-period">{assessment.period}</span>}
          </div>
          <div className="rc-stat-grid">
            <StatCard label="Total Attempts" value={assessment.totalAttempts.toLocaleString()} />
            <StatCard label="Passed" value={assessment.passed.toLocaleString()} />
            <StatCard label="Failed" value={assessment.failed.toLocaleString()} />
            <StatCard label="Avg Score" value={`${assessment.avgScore}%`} sub="Backend-computed" />
          </div>
        </div>
      )}

      {activeTab === 'active_users' && (
        <div className="rc-section">
          <div className="rc-section-header">
            <h2 className="rc-section-title">Active Users</h2>
            {activeUsers.period && <span className="rc-section-period">{activeUsers.period}</span>}
          </div>
          <div className="rc-stat-grid">
            <StatCard label="Daily Active" value={activeUsers.dailyActiveUsers.toLocaleString()} />
            <StatCard label="Weekly Active" value={activeUsers.weeklyActiveUsers.toLocaleString()} />
            <StatCard label="Monthly Active" value={activeUsers.monthlyActiveUsers.toLocaleString()} />
          </div>
        </div>
      )}

      <style>{`
        .rc-root { display: flex; flex-direction: column; gap: 16px; }
        .rc-tabs { display: flex; gap: 8px; border-bottom: 1px solid var(--border); padding-bottom: 0; }
        .rc-tab {
          padding: 8px 16px; border: none; background: none;
          font-size: 13px; font-weight: 600; color: var(--text-muted);
          cursor: pointer; font-family: inherit; border-bottom: 2px solid transparent;
          margin-bottom: -1px; transition: color 0.15s, border-color 0.15s;
        }
        .rc-tab:hover { color: var(--text-primary); }
        .rc-tab--active { color: var(--color-primary-500); border-bottom-color: var(--color-primary-500); }
        .rc-section {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 20px;
        }
        .rc-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .rc-section-title { margin: 0; font-size: 16px; font-weight: 600; color: var(--text-primary); }
        .rc-section-period { font-size: 12px; color: var(--text-muted); padding: 2px 8px; background: var(--surface-sunken); border-radius: var(--radius-sm); }
        .rc-stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
        .rc-stat {
          display: flex; flex-direction: column; gap: 4px; padding: 16px;
          background: var(--surface-sunken); border-radius: var(--radius-md);
        }
        .rc-stat-label {
          margin: 0; font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.04em; color: var(--text-muted);
        }
        .rc-stat-value { margin: 0; font-size: 26px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
        .rc-stat-sub { margin: 0; font-size: 11px; color: var(--text-muted); font-style: italic; }
        @media (max-width: 640px) {
          .rc-stat-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
        }
      `}</style>
    </div>
  );
}

