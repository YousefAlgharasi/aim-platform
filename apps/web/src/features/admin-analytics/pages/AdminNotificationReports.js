// P15-063: Admin Notification Reports UI
// Displays notification delivery, read, and failure reports.
// All metrics are backend-authoritative — no client-side computation.

import { useEffect, useState } from 'react';
import { getNotificationReports } from '../api';
import {
  AnalyticsKpiCard,
  AnalyticsChartShell,
  AnalyticsTableShell,
  AnalyticsFilterBar,
  AnalyticsPageLayout,
} from '../components';

function AdminNotificationReports() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function fetchData(params) {
    setStatus('loading');
    getNotificationReports(params)
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

  const channelColumns = [
    { key: 'channel', label: 'القناة' },
    { key: 'sent', label: 'المرسلة' },
    { key: 'delivered', label: 'المسلمة' },
    { key: 'read', label: 'المقروءة' },
    { key: 'failed', label: 'الفاشلة' },
    { key: 'deliveryRate', label: 'نسبة التسليم', render: (row) => row.deliveryRate != null ? `${row.deliveryRate}%` : '—' },
  ];

  const failureColumns = [
    { key: 'reason', label: 'سبب الفشل' },
    { key: 'count', label: 'العدد' },
    { key: 'percentage', label: 'النسبة', render: (row) => row.percentage != null ? `${row.percentage}%` : '—' },
  ];

  return (
    <AnalyticsPageLayout
      title="تقارير الإشعارات"
      status={status}
      errorMessage={error}
      emptyMessage="لا توجد بيانات إشعارات متاحة."
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

      <div className="analytics-kpi-grid" aria-label="مؤشرات الإشعارات">
        <AnalyticsKpiCard
          label="إجمالي المرسلة"
          value={data?.totalSent}
        />
        <AnalyticsKpiCard
          label="المسلمة"
          value={data?.totalDelivered}
          variant="success"
        />
        <AnalyticsKpiCard
          label="المقروءة"
          value={data?.totalRead}
          variant="info"
        />
        <AnalyticsKpiCard
          label="الفاشلة"
          value={data?.totalFailed}
          variant={data?.totalFailed > 0 ? 'error' : 'success'}
        />
        <AnalyticsKpiCard
          label="نسبة التسليم"
          value={data?.deliveryRate}
          unit="%"
          variant={data?.deliveryRate >= 95 ? 'success' : 'warning'}
        />
        <AnalyticsKpiCard
          label="نسبة القراءة"
          value={data?.readRate}
          unit="%"
          variant="info"
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">الأداء حسب القناة</h3>
        <AnalyticsTableShell
          columns={channelColumns}
          rows={data?.byChannel}
          emptyMessage="لا توجد بيانات قنوات."
          caption="أداء الإشعارات حسب القناة"
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">أسباب الفشل</h3>
        <AnalyticsTableShell
          columns={failureColumns}
          rows={data?.failureReasons}
          emptyMessage="لا توجد حالات فشل."
          caption="أسباب فشل الإشعارات"
        />
      </div>

      <AnalyticsChartShell title="الإشعارات عبر الزمن">
        {data?.notificationsChart && (
          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
            {JSON.stringify(data.notificationsChart, null, 2)}
          </pre>
        )}
      </AnalyticsChartShell>
    </AnalyticsPageLayout>
  );
}

export default AdminNotificationReports;
