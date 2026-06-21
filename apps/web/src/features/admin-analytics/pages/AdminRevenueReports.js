// P15-064: Admin Revenue Reports UI
// Displays revenue, subscription, invoice, and refund reports.
// All metrics are backend-authoritative — no client-side computation.

import { useEffect, useState } from 'react';
import { getRevenueReports } from '../api';
import {
  AnalyticsKpiCard,
  AnalyticsChartShell,
  AnalyticsTableShell,
  AnalyticsFilterBar,
  AnalyticsPageLayout,
} from '../components';

function AdminRevenueReports() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function fetchData(params) {
    setStatus('loading');
    getRevenueReports(params)
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

  const invoiceColumns = [
    { key: 'invoiceId', label: 'رقم الفاتورة' },
    { key: 'customerName', label: 'العميل' },
    { key: 'amount', label: 'المبلغ', render: (row) => row.amount != null ? `${row.amount} ${row.currency || ''}` : '—' },
    { key: 'status', label: 'الحالة' },
    { key: 'date', label: 'التاريخ' },
  ];

  const subscriptionColumns = [
    { key: 'planName', label: 'الخطة' },
    { key: 'activeCount', label: 'النشطة' },
    { key: 'newCount', label: 'الجديدة' },
    { key: 'cancelledCount', label: 'الملغاة' },
    { key: 'revenue', label: 'الإيرادات', render: (row) => row.revenue != null ? `${row.revenue} ${row.currency || ''}` : '—' },
  ];

  const refundColumns = [
    { key: 'refundId', label: 'رقم الاسترداد' },
    { key: 'customerName', label: 'العميل' },
    { key: 'amount', label: 'المبلغ', render: (row) => row.amount != null ? `${row.amount} ${row.currency || ''}` : '—' },
    { key: 'reason', label: 'السبب' },
    { key: 'date', label: 'التاريخ' },
  ];

  return (
    <AnalyticsPageLayout
      title="تقارير الإيرادات"
      status={status}
      errorMessage={error}
      emptyMessage="لا توجد بيانات إيرادات متاحة."
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

      <div className="analytics-kpi-grid" aria-label="مؤشرات الإيرادات">
        <AnalyticsKpiCard
          label="إجمالي الإيرادات"
          value={data?.totalRevenue}
          unit={data?.currency}
          variant="success"
          trend={data?.revenueTrend}
          trendLabel={data?.revenueTrendLabel}
        />
        <AnalyticsKpiCard
          label="الاشتراكات النشطة"
          value={data?.activeSubscriptions}
          variant="info"
        />
        <AnalyticsKpiCard
          label="الفواتير المعلقة"
          value={data?.pendingInvoices}
          variant={data?.pendingInvoices > 0 ? 'warning' : 'success'}
        />
        <AnalyticsKpiCard
          label="المبالغ المستردة"
          value={data?.totalRefunds}
          unit={data?.currency}
          variant={data?.totalRefunds > 0 ? 'error' : 'success'}
        />
        <AnalyticsKpiCard
          label="متوسط الإيراد لكل مستخدم"
          value={data?.arpu}
          unit={data?.currency}
        />
        <AnalyticsKpiCard
          label="معدل التحويل"
          value={data?.conversionRate}
          unit="%"
          variant="info"
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">الاشتراكات حسب الخطة</h3>
        <AnalyticsTableShell
          columns={subscriptionColumns}
          rows={data?.subscriptionsByPlan}
          emptyMessage="لا توجد بيانات اشتراكات."
          caption="الاشتراكات حسب الخطة"
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">أحدث الفواتير</h3>
        <AnalyticsTableShell
          columns={invoiceColumns}
          rows={data?.recentInvoices}
          emptyMessage="لا توجد فواتير."
          caption="أحدث الفواتير"
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">المبالغ المستردة</h3>
        <AnalyticsTableShell
          columns={refundColumns}
          rows={data?.recentRefunds}
          emptyMessage="لا توجد مبالغ مستردة."
          caption="المبالغ المستردة"
        />
      </div>

      <AnalyticsChartShell title="الإيرادات عبر الزمن">
        {data?.revenueChart && (
          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
            {JSON.stringify(data.revenueChart, null, 2)}
          </pre>
        )}
      </AnalyticsChartShell>
    </AnalyticsPageLayout>
  );
}

export default AdminRevenueReports;
