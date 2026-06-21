// P15-062: Admin Assessment Reports UI
// Displays quizzes, exams, deadlines, attempts, and results reports.
// All metrics are backend-authoritative — no client-side computation.

import { useEffect, useState } from 'react';
import { getAssessmentReports } from '../api';
import {
  AnalyticsKpiCard,
  AnalyticsChartShell,
  AnalyticsTableShell,
  AnalyticsFilterBar,
  AnalyticsPageLayout,
} from '../components';

function AdminAssessmentReports() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function fetchData(params) {
    setStatus('loading');
    getAssessmentReports(params)
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

  const assessmentColumns = [
    { key: 'name', label: 'التقييم' },
    { key: 'type', label: 'النوع' },
    { key: 'totalAttempts', label: 'إجمالي المحاولات' },
    { key: 'avgScore', label: 'متوسط الدرجة', render: (row) => row.avgScore != null ? `${row.avgScore}%` : '—' },
    { key: 'passRate', label: 'نسبة النجاح', render: (row) => row.passRate != null ? `${row.passRate}%` : '—' },
  ];

  const deadlineColumns = [
    { key: 'assessmentName', label: 'التقييم' },
    { key: 'deadline', label: 'الموعد النهائي' },
    { key: 'submittedCount', label: 'المسلمون' },
    { key: 'pendingCount', label: 'المعلقون' },
    { key: 'overdueCount', label: 'المتأخرون' },
  ];

  return (
    <AnalyticsPageLayout
      title="تقارير التقييمات"
      status={status}
      errorMessage={error}
      emptyMessage="لا توجد بيانات تقييمات متاحة."
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

      <div className="analytics-kpi-grid" aria-label="مؤشرات التقييمات">
        <AnalyticsKpiCard
          label="إجمالي التقييمات"
          value={data?.totalAssessments}
        />
        <AnalyticsKpiCard
          label="إجمالي المحاولات"
          value={data?.totalAttempts}
          variant="info"
        />
        <AnalyticsKpiCard
          label="متوسط الدرجة"
          value={data?.avgScore}
          unit="%"
          variant="info"
        />
        <AnalyticsKpiCard
          label="نسبة النجاح"
          value={data?.passRate}
          unit="%"
          variant={data?.passRate >= 70 ? 'success' : 'warning'}
        />
        <AnalyticsKpiCard
          label="المواعيد المتأخرة"
          value={data?.overdueDeadlines}
          variant={data?.overdueDeadlines > 0 ? 'error' : 'success'}
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">أداء التقييمات</h3>
        <AnalyticsTableShell
          columns={assessmentColumns}
          rows={data?.assessments}
          emptyMessage="لا توجد بيانات تقييمات."
          caption="أداء التقييمات"
        />
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">حالة المواعيد النهائية</h3>
        <AnalyticsTableShell
          columns={deadlineColumns}
          rows={data?.deadlines}
          emptyMessage="لا توجد مواعيد نهائية."
          caption="حالة المواعيد النهائية"
        />
      </div>

      <AnalyticsChartShell title="توزيع الدرجات">
        {data?.scoreDistributionChart && (
          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
            {JSON.stringify(data.scoreDistributionChart, null, 2)}
          </pre>
        )}
      </AnalyticsChartShell>

      <AnalyticsChartShell title="المحاولات عبر الزمن">
        {data?.attemptsChart && (
          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
            {JSON.stringify(data.attemptsChart, null, 2)}
          </pre>
        )}
      </AnalyticsChartShell>
    </AnalyticsPageLayout>
  );
}

export default AdminAssessmentReports;
