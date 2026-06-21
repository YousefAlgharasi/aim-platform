// P15-066: Admin Export Manager UI
// Export creation and status UI with permissions.
// All export execution is backend-side — this UI only triggers and displays status.

import { useEffect, useState } from 'react';
import { listExports, createExport, getExportStatus } from '../api';
import {
  AnalyticsTableShell,
  AnalyticsPageLayout,
} from '../components';

const EXPORT_TYPE_OPTIONS = [
  { value: 'users', label: 'المستخدمون' },
  { value: 'learning', label: 'التعلم' },
  { value: 'assessments', label: 'التقييمات' },
  { value: 'curriculum', label: 'المنهج' },
  { value: 'revenue', label: 'الإيرادات' },
  { value: 'notifications', label: 'الإشعارات' },
];

const FORMAT_OPTIONS = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
  { value: 'json', label: 'JSON' },
];

const STATUS_LABELS = {
  queued: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  completed: 'مكتمل',
  failed: 'فشل',
  expired: 'منتهي الصلاحية',
};

function AdminExportManager() {
  const [exports, setExports] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [exportType, setExportType] = useState('users');
  const [format, setFormat] = useState('csv');
  const [createError, setCreateError] = useState(null);

  function fetchExports() {
    setStatus('loading');
    listExports()
      .then((result) => {
        const items = result?.exports || result || [];
        setExports(items);
        setStatus(items.length > 0 ? 'ready' : 'empty');
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
    fetchExports();
  }, []);

  async function handleCreate() {
    setCreating(true);
    setCreateError(null);
    try {
      const result = await createExport({ type: exportType, format });
      // Poll once for status if queued/processing
      if (result && (result.status === 'queued' || result.status === 'processing') && result.id) {
        const latest = await getExportStatus(result.id);
        if (latest) {
          setExports((prev) => [latest, ...prev]);
        } else {
          setExports((prev) => [result, ...prev]);
        }
      } else if (result) {
        setExports((prev) => [result, ...prev]);
      }
      if (status === 'empty') setStatus('ready');
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleRefreshStatus(exportId) {
    try {
      const latest = await getExportStatus(exportId);
      if (latest) {
        setExports((prev) =>
          prev.map((exp) => (exp.id === exportId ? latest : exp))
        );
      }
    } catch {
      // Silently ignore refresh errors
    }
  }

  const exportColumns = [
    { key: 'type', label: 'النوع', render: (row) => {
      const opt = EXPORT_TYPE_OPTIONS.find((o) => o.value === row.type);
      return opt ? opt.label : row.type;
    }},
    { key: 'format', label: 'التنسيق', render: (row) => (row.format || '').toUpperCase() },
    { key: 'status', label: 'الحالة', render: (row) => (
      <span className={`analytics-badge analytics-badge--${row.status === 'completed' ? 'success' : row.status === 'failed' ? 'error' : row.status === 'expired' ? 'warning' : 'info'}`}>
        {STATUS_LABELS[row.status] || row.status}
      </span>
    )},
    { key: 'createdAt', label: 'تاريخ الإنشاء' },
    { key: 'actions', label: 'إجراء', render: (row) => (
      <div style={{ display: 'flex', gap: 'var(--space-8, 8px)' }}>
        {(row.status === 'queued' || row.status === 'processing') && (
          <button
            type="button"
            className="analytics-filter-bar__btn"
            onClick={() => handleRefreshStatus(row.id)}
            aria-label={`تحديث حالة التصدير ${row.id}`}
            style={{ fontSize: '0.85rem', padding: '4px 12px' }}
          >
            تحديث
          </button>
        )}
        {row.status === 'completed' && row.downloadUrl && (
          <a
            href={row.downloadUrl}
            className="analytics-filter-bar__btn"
            style={{ textDecoration: 'none', fontSize: '0.85rem', padding: '4px 12px' }}
            aria-label={`تنزيل التصدير ${row.id}`}
            download
          >
            تنزيل
          </a>
        )}
      </div>
    )},
  ];

  return (
    <AnalyticsPageLayout
      title="إدارة التصدير"
      status={status}
      errorMessage={error}
      emptyMessage="لا توجد عمليات تصدير سابقة."
    >
      <div className="analytics-section">
        <h3 className="analytics-section__title">إنشاء تصدير جديد</h3>
        <div className="analytics-filter-bar" role="form" aria-label="إنشاء تصدير">
          <div className="analytics-filter-bar__group">
            <label className="analytics-filter-bar__label" htmlFor="export-type">
              نوع البيانات
            </label>
            <select
              id="export-type"
              className="analytics-filter-bar__select"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
            >
              {EXPORT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="analytics-filter-bar__group">
            <label className="analytics-filter-bar__label" htmlFor="export-format">
              التنسيق
            </label>
            <select
              id="export-format"
              className="analytics-filter-bar__select"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              {FORMAT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <button
            className="analytics-filter-bar__btn"
            type="button"
            onClick={handleCreate}
            disabled={creating}
            aria-label="بدء التصدير"
          >
            {creating ? 'جاري الإنشاء...' : 'بدء التصدير'}
          </button>
        </div>

        {createError && (
          <p className="analytics-page__status analytics-page__status--error" role="alert" style={{ marginTop: 'var(--space-8, 8px)' }}>
            {createError}
          </p>
        )}
      </div>

      <div className="analytics-section">
        <h3 className="analytics-section__title">عمليات التصدير السابقة</h3>
        <AnalyticsTableShell
          columns={exportColumns}
          rows={exports}
          emptyMessage="لا توجد عمليات تصدير."
          caption="سجل عمليات التصدير"
        />
      </div>
    </AnalyticsPageLayout>
  );
}

export default AdminExportManager;
