// P18-074: Create Admin AI Prompt Management UI
// Prompt template list/draft/publish/retire UI. Version status (which
// template is "active") is always decided server-side — this page only
// triggers backend state transitions and renders what the backend
// returns. Never reads/writes provider secrets or model secrets, and
// never computes mastery/level/weakness/difficulty/recommendation/
// review-schedule values.

import { useEffect, useState } from 'react';
import {
  listPromptTemplates,
  createPromptTemplateDraft,
  publishPromptTemplate,
  retirePromptTemplate,
} from '../api';
import './AdminAiPages.css';

const STATUS_LABELS = {
  draft: 'مسودة',
  active: 'نشط',
  retired: 'متوقف',
};

function AdminAiPrompts() {
  const [templates, setTemplates] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [draftName, setDraftName] = useState('');
  const [draftLocale, setDraftLocale] = useState('ar');
  const [draftAudience, setDraftAudience] = useState('student');
  const [draftBody, setDraftBody] = useState('');
  const [creating, setCreating] = useState(false);

  function fetchTemplates() {
    setStatus('loading');
    listPromptTemplates()
      .then((result) => {
        const items = result?.templates || result || [];
        setTemplates(items);
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
    fetchTemplates();
  }, []);

  async function handleCreateDraft(e) {
    e.preventDefault();
    setCreating(true);
    setActionError(null);
    try {
      await createPromptTemplateDraft({
        name: draftName,
        locale: draftLocale,
        audience: draftAudience,
        body: draftBody,
      });
      setDraftName('');
      setDraftBody('');
      fetchTemplates();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handlePublish(id) {
    setBusyId(id);
    setActionError(null);
    try {
      await publishPromptTemplate(id);
      fetchTemplates();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRetire(id) {
    setBusyId(id);
    setActionError(null);
    try {
      await retirePromptTemplate(id);
      fetchTemplates();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (status === 'loading') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--loading" role="status">
        جاري تحميل قوالب التعليمات...
      </p>
    );
  }

  if (status === 'forbidden') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--forbidden" role="alert">
        ليس لديك صلاحية الوصول إلى إدارة القوالب.
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--error" role="alert">
        {error || 'حدث خطأ أثناء تحميل قوالب التعليمات.'}
      </p>
    );
  }

  return (
    <div className="admin-ai-page">
      <h2 className="admin-ai-page__title">إدارة قوالب التعليمات</h2>

      <section className="admin-ai-page__section">
        <h3 className="admin-ai-page__section-title">إنشاء مسودة جديدة</h3>
        <form className="admin-ai-form" onSubmit={handleCreateDraft} aria-label="إنشاء مسودة قالب">
          <div className="admin-ai-form__group">
            <label className="admin-ai-form__label" htmlFor="prompt-name">الاسم</label>
            <input
              id="prompt-name"
              className="admin-ai-form__input"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              required
            />
          </div>
          <div className="admin-ai-form__group">
            <label className="admin-ai-form__label" htmlFor="prompt-locale">اللغة</label>
            <input
              id="prompt-locale"
              className="admin-ai-form__input"
              value={draftLocale}
              onChange={(e) => setDraftLocale(e.target.value)}
              required
            />
          </div>
          <div className="admin-ai-form__group">
            <label className="admin-ai-form__label" htmlFor="prompt-audience">الجمهور</label>
            <input
              id="prompt-audience"
              className="admin-ai-form__input"
              value={draftAudience}
              onChange={(e) => setDraftAudience(e.target.value)}
              required
            />
          </div>
          <div className="admin-ai-form__group admin-ai-form__group--full">
            <label className="admin-ai-form__label" htmlFor="prompt-body">نص القالب</label>
            <textarea
              id="prompt-body"
              className="admin-ai-form__textarea"
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              rows={6}
              required
            />
          </div>
          <button className="admin-ai-form__submit" type="submit" disabled={creating}>
            {creating ? 'جاري الإنشاء...' : 'إنشاء مسودة'}
          </button>
        </form>
      </section>

      {actionError && (
        <p className="admin-ai-page__status admin-ai-page__status--error" role="alert">
          {actionError}
        </p>
      )}

      <section className="admin-ai-page__section">
        <h3 className="admin-ai-page__section-title">القوالب</h3>
        {status === 'empty' || templates.length === 0 ? (
          <p className="admin-ai-page__status admin-ai-page__status--empty" role="status">
            لا توجد قوالب تعليمات حتى الآن.
          </p>
        ) : (
          <table className="admin-ai-table" aria-label="قوالب التعليمات">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الإصدار</th>
                <th>اللغة</th>
                <th>الجمهور</th>
                <th>الحالة</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr key={tpl.id}>
                  <td>{tpl.name}</td>
                  <td>{tpl.version}</td>
                  <td>{tpl.locale}</td>
                  <td>{tpl.audience}</td>
                  <td>
                    <span className={`admin-ai-badge admin-ai-badge--${tpl.status}`}>
                      {STATUS_LABELS[tpl.status] || tpl.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-ai-table__actions">
                      {tpl.status !== 'active' && (
                        <button
                          type="button"
                          className="admin-ai-table__btn"
                          onClick={() => handlePublish(tpl.id)}
                          disabled={busyId === tpl.id}
                          aria-label={`نشر القالب ${tpl.name}`}
                        >
                          نشر
                        </button>
                      )}
                      {tpl.status !== 'retired' && (
                        <button
                          type="button"
                          className="admin-ai-table__btn"
                          onClick={() => handleRetire(tpl.id)}
                          disabled={busyId === tpl.id}
                          aria-label={`إيقاف القالب ${tpl.name}`}
                        >
                          إيقاف
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default AdminAiPrompts;
