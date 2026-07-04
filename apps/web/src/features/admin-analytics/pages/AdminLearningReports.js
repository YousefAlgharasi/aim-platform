// P15-060: Admin Learning Reports UI
// Displays learning progress, skills, and retention reports.
// All metrics are backend-authoritative — this UI only renders API responses.

import { useEffect, useState } from 'react';
import { getLearningReports } from '../api';
import {
  AnalyticsKpiCard,
  AnalyticsChartShell,
  AnalyticsTableShell,
  AnalyticsFilterBar,
  AnalyticsPageLayout,
} from '../components';

function AdminLearningReports() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function fetchData(params) {
    setStatus('loading');
    getLearningReports(params)
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

  const progressColumns = [
    { key: 'subject', label: 'المادة' },
    { key: 'totalLessons', label: 'إجمالي الدروس' },
    { key: 'completedLessons', label: 'الدروس المكتملة' },
    { key: 'completionRate', label: 'نسبة الإكمال', render: (row) => row.completionRate != null ? `${row.completionRate}%` : '—' },
    { key: 'avgTimeMinutes', label: 'متوسط الوقت (دقيقة)' },
  ];

  const skillColumns = [
    { key: 'skillName', label: 'المهارة' },
    { key: 'learnersCount', label: 'عدد المتعلمين' },
    { key: 'avgMastery', label: 'متوسط الإتقان', render: (row) => row.avgMastery != null ? `${row.avgMastery}%` : '—' },
    { key: 'trend', label: 'الاتجاه' },
  ];

  return (
    <AnalyticsPageLayout
      title="تقارير التعلم"
      status={status}
      errorMessage={error}
      emptyMessage="لا توجد بيانات تعلم متاحة."
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

      <div className="analytics-kpi-grid" aria-label="مؤشرات التعلم">
        <AnalyticsKpiCard
          label="إجمالي المتعلمين"
          value={data?.totalLearners}
        />
        <AnalyticsKpiCard
          label="الدروس المكتملة"
          value={data?.completedLessons}
          variant="success"
        />
        <AnalyticsKpiCard
          label="متوسط نسبة الإكمال"
          value={data?.avgCompletionRate}
          unit="%"
          variant="info"
        />
        <AnalyticsKpiCard
          label="معدل الاستبقاء"
          value={data?.retentionRate}
          unit="%"
          variant={data?.retentionRate >= 70 ? 'success' : 'warning'}
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">تقدم التعلم حسب المادة</h3>
        <AnalyticsTableShell
          columns={progressColumns}
          rows={data?.progressBySubject}
          emptyMessage="لا توجد بيانات تقدم."
          caption="تقدم التعلم حسب المادة"
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">المهارات</h3>
        <AnalyticsTableShell
          columns={skillColumns}
          rows={data?.skills}
          emptyMessage="لا توجد بيانات مهارات."
          caption="تقرير المهارات"
        />
      </div>

      <AnalyticsChartShell title="اتجاه التعلم عبر الزمن">
        {data?.learningTrendChart && (
          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
            {JSON.stringify(data.learningTrendChart, null, 2)}
          </pre>
        )}
      </AnalyticsChartShell>

      <AnalyticsChartShell title="معدل الاستبقاء عبر الزمن">
        {data?.retentionChart && (
          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
            {JSON.stringify(data.retentionChart, null, 2)}
          </pre>
        )}
      </AnalyticsChartShell>
    </AnalyticsPageLayout>
  );
}

export default AdminLearningReports;
