// P15-065: Admin User Reports UI
// Displays signup, active user, role, and engagement reports.
// All metrics are backend-authoritative — no client-side computation.

import { useEffect, useState } from 'react';
import { getUserReports } from '../api';
import {
  AnalyticsKpiCard,
  AnalyticsChartShell,
  AnalyticsTableShell,
  AnalyticsFilterBar,
  AnalyticsPageLayout,
} from '../components';

function AdminUserReports() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function fetchData(params) {
    setStatus('loading');
    getUserReports(params)
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
    const params = { period };
    if (period === 'custom') {
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
    }
    fetchData(params);
  }

  const roleColumns = [
    { key: 'role', label: 'الدور' },
    { key: 'count', label: 'العدد' },
    { key: 'percentage', label: 'النسبة', render: (row) => row.percentage != null ? `${row.percentage}%` : '—' },
    { key: 'activeCount', label: 'النشطون' },
  ];

  const engagementColumns = [
    { key: 'metric', label: 'المقياس' },
    { key: 'value', label: 'القيمة' },
    { key: 'change', label: 'التغيير' },
    { key: 'trend', label: 'الاتجاه' },
  ];

  const signupColumns = [
    { key: 'date', label: 'التاريخ' },
    { key: 'signups', label: 'التسجيلات الجديدة' },
    { key: 'verified', label: 'المؤكدون' },
    { key: 'active', label: 'النشطون' },
  ];

  return (
    <AnalyticsPageLayout
      title="تقارير المستخدمين"
      status={status}
      errorMessage={error}
      emptyMessage="لا توجد بيانات مستخدمين متاحة."
    >
      <AnalyticsFilterBar
        period={period}
        onPeriodChange={setPeriod}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onApply={handleApply}
      />

      <div className="analytics-kpi-grid" aria-label="مؤشرات المستخدمين">
        <AnalyticsKpiCard
          label="إجمالي المستخدمين"
          value={data?.totalUsers}
        />
        <AnalyticsKpiCard
          label="التسجيلات الجديدة"
          value={data?.newSignups}
          variant="info"
          trend={data?.signupsTrend}
          trendLabel={data?.signupsTrendLabel}
        />
        <AnalyticsKpiCard
          label="المستخدمون النشطون"
          value={data?.activeUsers}
          variant="success"
          trend={data?.activeUsersTrend}
          trendLabel={data?.activeUsersTrendLabel}
        />
        <AnalyticsKpiCard
          label="معدل التفاعل"
          value={data?.engagementRate}
          unit="%"
          variant="info"
        />
        <AnalyticsKpiCard
          label="معدل الاستبقاء"
          value={data?.retentionRate}
          unit="%"
          variant={data?.retentionRate >= 70 ? 'success' : 'warning'}
        />
        <AnalyticsKpiCard
          label="معدل المغادرة"
          value={data?.churnRate}
          unit="%"
          variant={data?.churnRate > 10 ? 'error' : 'success'}
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">المستخدمون حسب الدور</h3>
        <AnalyticsTableShell
          columns={roleColumns}
          rows={data?.usersByRole}
          emptyMessage="لا توجد بيانات أدوار."
          caption="المستخدمون حسب الدور"
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">مقاييس التفاعل</h3>
        <AnalyticsTableShell
          columns={engagementColumns}
          rows={data?.engagementMetrics}
          emptyMessage="لا توجد بيانات تفاعل."
          caption="مقاييس التفاعل"
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">التسجيلات عبر الزمن</h3>
        <AnalyticsTableShell
          columns={signupColumns}
          rows={data?.signupsByDate}
          emptyMessage="لا توجد بيانات تسجيل."
          caption="التسجيلات عبر الزمن"
        />
      </div>

      <AnalyticsChartShell title="نمو المستخدمين">
        {data?.userGrowthChart && (
          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
            {JSON.stringify(data.userGrowthChart, null, 2)}
          </pre>
        )}
      </AnalyticsChartShell>

      <AnalyticsChartShell title="النشاط اليومي">
        {data?.dailyActivityChart && (
          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
            {JSON.stringify(data.dailyActivityChart, null, 2)}
          </pre>
        )}
      </AnalyticsChartShell>
    </AnalyticsPageLayout>
  );
}

export default AdminUserReports;
