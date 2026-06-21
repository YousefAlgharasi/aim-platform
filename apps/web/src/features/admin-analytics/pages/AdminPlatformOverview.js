// P15-059: Admin Platform Overview Dashboard
// Displays backend-approved KPI cards for users, learning, curriculum,
// assessments, notifications, and billing. Never computes metrics locally.

import { useEffect, useState } from 'react';
import { getDashboard } from '../api';
import {
  AnalyticsKpiCard,
  AnalyticsChartShell,
  AnalyticsFilterBar,
  AnalyticsPageLayout,
} from '../components';

function AdminPlatformOverview() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');

  function fetchData(params) {
    setStatus('loading');
    getDashboard(params)
      .then((result) => {
        setData(result);
        setStatus(result ? 'ready' : 'empty');
      })
      .catch((err) => {
        if (err.status === 403) {
          setStatus('forbidden');
        } else {
          setError(err.message);
          setStatus('error');
        }
      });
  }

  useEffect(() => {
    fetchData({ period });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleApply() {
    fetchData({ period });
  }

  return (
    <AnalyticsPageLayout
      title="نظرة عامة على المنصة"
      status={status}
      errorMessage={error}
      emptyMessage="لا توجد بيانات تحليلية متاحة."
    >
      <AnalyticsFilterBar
        period={period}
        onPeriodChange={setPeriod}
        onApply={handleApply}
      />

      <div className="analytics-kpi-grid" aria-label="مؤشرات الأداء الرئيسية">
        <AnalyticsKpiCard
          label="إجمالي المستخدمين"
          value={data?.totalUsers}
          trend={data?.usersTrend}
          trendLabel={data?.usersTrendLabel}
        />
        <AnalyticsKpiCard
          label="المستخدمون النشطون"
          value={data?.activeUsers}
          variant="success"
          trend={data?.activeUsersTrend}
          trendLabel={data?.activeUsersTrendLabel}
        />
        <AnalyticsKpiCard
          label="إجمالي الدروس المكتملة"
          value={data?.completedLessons}
          variant="info"
        />
        <AnalyticsKpiCard
          label="المناهج المنشورة"
          value={data?.publishedCurricula}
        />
        <AnalyticsKpiCard
          label="التقييمات المكتملة"
          value={data?.completedAssessments}
          variant="info"
        />
        <AnalyticsKpiCard
          label="الإشعارات المرسلة"
          value={data?.notificationsSent}
        />
        <AnalyticsKpiCard
          label="الإيرادات"
          value={data?.revenue}
          unit={data?.revenueCurrency}
          variant="success"
          trend={data?.revenueTrend}
          trendLabel={data?.revenueTrendLabel}
        />
        <AnalyticsKpiCard
          label="الاشتراكات النشطة"
          value={data?.activeSubscriptions}
          variant="info"
        />
      </div>

      <div className="analytics-kpi-grid" style={{ marginTop: 'var(--section-gap, 24px)' }}>
        <AnalyticsChartShell title="نمو المستخدمين">
          {data?.userGrowthChart && (
            <pre style={{ fontSize: '0.8rem', margin: 0 }}>
              {JSON.stringify(data.userGrowthChart, null, 2)}
            </pre>
          )}
        </AnalyticsChartShell>
        <AnalyticsChartShell title="نشاط التعلم">
          {data?.learningActivityChart && (
            <pre style={{ fontSize: '0.8rem', margin: 0 }}>
              {JSON.stringify(data.learningActivityChart, null, 2)}
            </pre>
          )}
        </AnalyticsChartShell>
      </div>
    </AnalyticsPageLayout>
  );
}

export default AdminPlatformOverview;
