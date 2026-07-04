// P18-075: Create Admin AI Model Config UI
// Model config list/status/limits UI. provider_key_ref is rendered as a
// non-secret reference string only — this page never reads, writes, or
// displays the underlying provider credential/API key, and never
// computes mastery/level/weakness/difficulty/recommendation/
// review-schedule values.

import { useEffect, useState } from 'react';
import { listModelConfigs, setModelConfigStatus, updateModelConfigLimits } from '../api';
import './AdminAiPages.css';

const STATUS_LABELS = {
  draft: 'مسودة',
  active: 'نشط',
  retired: 'متوقف',
};

const TIER_LABELS = {
  economy: 'اقتصادي',
  standard: 'قياسي',
  premium: 'متقدم',
};

function AdminAiModelConfig() {
  const [configs, setConfigs] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [limitsDraft, setLimitsDraft] = useState('{}');
  const [parametersDraft, setParametersDraft] = useState('{}');

  function fetchConfigs() {
    setStatus('loading');
    listModelConfigs()
      .then((result) => {
        const items = result?.configs || result || [];
        setConfigs(items);
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
    fetchConfigs();
  }, []);

  async function handleStatusChange(id, newStatus) {
    setBusyId(id);
    setActionError(null);
    try {
      await setModelConfigStatus(id, newStatus);
      fetchConfigs();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  function startEditing(config) {
    setEditingId(config.id);
    setLimitsDraft(JSON.stringify(config.limits ?? {}, null, 2));
    setParametersDraft(JSON.stringify(config.parameters ?? {}, null, 2));
    setActionError(null);
  }

  async function handleSaveLimits(id) {
    setBusyId(id);
    setActionError(null);
    try {
      const limits = JSON.parse(limitsDraft);
      const parameters = JSON.parse(parametersDraft);
      await updateModelConfigLimits(id, limits, parameters);
      setEditingId(null);
      fetchConfigs();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (status === 'loading') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--loading" role="status">
        جاري تحميل إعدادات النموذج...
      </p>
    );
  }

  if (status === 'forbidden') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--forbidden" role="alert">
        ليس لديك صلاحية الوصول إلى إعدادات النموذج.
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--error" role="alert">
        {error || 'حدث خطأ أثناء تحميل إعدادات النموذج.'}
      </p>
    );
  }

  return (
    <div className="admin-ai-page">
      <h2 className="admin-ai-page__title">إعدادات نماذج المعلم الذكي</h2>

      {actionError && (
        <p className="admin-ai-page__status admin-ai-page__status--error" role="alert">
          {actionError}
        </p>
      )}

      {status === 'empty' || configs.length === 0 ? (
        <p className="admin-ai-page__status admin-ai-page__status--empty" role="status">
          لا توجد إعدادات نموذج حتى الآن.
        </p>
      ) : (
        <table className="admin-ai-table" aria-label="إعدادات النماذج">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>النموذج</th>
              <th>الفئة</th>
              <th>مرجع المزود</th>
              <th>الحالة</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((cfg) => (
              <tr key={cfg.id}>
                <td>{cfg.name}</td>
                <td>{cfg.model_id}</td>
                <td>{TIER_LABELS[cfg.tier] || cfg.tier}</td>
                <td>{cfg.provider_key_ref}</td>
                <td>
                  <span className={`admin-ai-badge admin-ai-badge--${cfg.status}`}>
                    {STATUS_LABELS[cfg.status] || cfg.status}
                  </span>
                </td>
                <td>
                  <div className="admin-ai-table__actions">
                    {cfg.status !== 'active' && (
                      <button
                        type="button"
                        className="admin-ai-table__btn"
                        onClick={() => handleStatusChange(cfg.id, 'active')}
                        disabled={busyId === cfg.id}
                        aria-label={`تنشيط ${cfg.name}`}
                      >
                        تنشيط
                      </button>
                    )}
                    {cfg.status !== 'retired' && (
                      <button
                        type="button"
                        className="admin-ai-table__btn"
                        onClick={() => handleStatusChange(cfg.id, 'retired')}
                        disabled={busyId === cfg.id}
                        aria-label={`إيقاف ${cfg.name}`}
                      >
                        إيقاف
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin-ai-table__btn"
                      onClick={() => startEditing(cfg)}
                      disabled={busyId === cfg.id}
                      aria-label={`تعديل حدود ${cfg.name}`}
                    >
                      الحدود
                    </button>
                  </div>
                  {editingId === cfg.id && (
                    <div className="admin-ai-form" style={{ marginTop: 'var(--space-12, 12px)' }}>
                      <div className="admin-ai-form__group admin-ai-form__group--full">
                        <label className="admin-ai-form__label" htmlFor={`limits-${cfg.id}`}>الحدود (JSON)</label>
                        <textarea
                          id={`limits-${cfg.id}`}
                          className="admin-ai-form__textarea"
                          value={limitsDraft}
                          onChange={(e) => setLimitsDraft(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="admin-ai-form__group admin-ai-form__group--full">
                        <label className="admin-ai-form__label" htmlFor={`params-${cfg.id}`}>المعاملات (JSON)</label>
                        <textarea
                          id={`params-${cfg.id}`}
                          className="admin-ai-form__textarea"
                          value={parametersDraft}
                          onChange={(e) => setParametersDraft(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <button
                        type="button"
                        className="admin-ai-form__submit"
                        onClick={() => handleSaveLimits(cfg.id)}
                        disabled={busyId === cfg.id}
                      >
                        حفظ
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminAiModelConfig;
