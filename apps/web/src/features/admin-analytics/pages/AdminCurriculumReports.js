// P15-061: Admin Curriculum Reports UI
// Displays curriculum and content performance reports.
// All metrics are backend-authoritative — no client-side computation.

import { useEffect, useState } from 'react';
import { getCurriculumReports } from '../api';
import {
  AnalyticsKpiCard,
  AnalyticsChartShell,
  AnalyticsTableShell,
  AnalyticsFilterBar,
  AnalyticsPageLayout,
} from '../components';

function AdminCurriculumReports() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function fetchData(params) {
    setStatus('loading');
    getCurriculumReports(params)
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

  const curriculumColumns = [
    { key: 'name', label: 'المنهج' },
    { key: 'status', label: 'الحالة' },
    { key: 'enrolledCount', label: 'عدد المسجلين' },
    { key: 'completionRate', label: 'نسبة الإكمال', render: (row) => row.completionRate != null ? `${row.completionRate}%` : '—' },
    { key: 'avgRating', label: 'متوسط التقييم', render: (row) => row.avgRating != null ? `${row.avgRating}/5` : '—' },
  ];

  const contentColumns = [
    { key: 'title', label: 'المحتوى' },
    { key: 'type', label: 'النوع' },
    { key: 'viewCount', label: 'عدد المشاهدات' },
    { key: 'completionRate', label: 'نسبة الإكمال', render: (row) => row.completionRate != null ? `${row.completionRate}%` : '—' },
    { key: 'avgDurationMinutes', label: 'متوسط المدة (دقيقة)' },
  ];

  return (
    <AnalyticsPageLayout
      title="تقارير المنهج"
      status={status}
      errorMessage={error}
      emptyMessage="لا توجد بيانات منهج متاحة."
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

      <div className="analytics-kpi-grid" aria-label="مؤشرات المنهج">
        <AnalyticsKpiCard
          label="إجمالي المناهج"
          value={data?.totalCurricula}
        />
        <AnalyticsKpiCard
          label="المناهج المنشورة"
          value={data?.publishedCurricula}
          variant="success"
        />
        <AnalyticsKpiCard
          label="إجمالي المحتويات"
          value={data?.totalContent}
          variant="info"
        />
        <AnalyticsKpiCard
          label="متوسط التقييم"
          value={data?.avgRating}
          unit="/5"
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">أداء المناهج</h3>
        <AnalyticsTableShell
          columns={curriculumColumns}
          rows={data?.curricula}
          emptyMessage="لا توجد بيانات مناهج."
          caption="أداء المناهج"
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">أداء المحتوى</h3>
        <AnalyticsTableShell
          columns={contentColumns}
          rows={data?.content}
          emptyMessage="لا توجد بيانات محتوى."
          caption="أداء المحتوى"
        />
      </div>

      <AnalyticsChartShell title="التسجيلات عبر الزمن">
        {data?.enrollmentChart && (
          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
            {JSON.stringify(data.enrollmentChart, null, 2)}
          </pre>
        )}
      </AnalyticsChartShell>
    </AnalyticsPageLayout>
  );
}

export default AdminCurriculumReports;
