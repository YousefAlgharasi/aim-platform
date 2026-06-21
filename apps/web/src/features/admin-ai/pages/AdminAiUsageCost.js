// P18-076: Create Admin AI Usage and Cost UI
// Read-only AI usage/cost event listing across all students, with an
// optional per-student lookup and quota/limit status. This page is
// strictly a display surface over backend-computed values: it never
// estimates cost, never decides quota outcomes, and never computes
// mastery/level/weakness/difficulty/recommendation/review-schedule
// values locally. Cost/quota enforcement happens server-side before any
// provider call, prior to and independent of this UI.

import { useEffect, useState } from 'react';
import { listRecentAiUsage, listAiUsageForStudent, getAiLimitStatusForStudent } from '../api';
import './AdminAiPages.css';

const EVENT_TYPE_LABELS = {
  text_generation: 'محادثة نصية',
  stt: 'تحويل صوت لنص',
  tts: 'تحويل نص لصوت',
};

function AdminAiUsageCost() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const [studentId, setStudentId] = useState('');
  const [limitStatus, setLimitStatus] = useState(null);
  const [limitStatusError, setLimitStatusError] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);

  function fetchRecentUsage() {
    setStatus('loading');
    listRecentAiUsage()
      .then((result) => {
        const items = result?.events || result || [];
        setEvents(items);
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
    fetchRecentUsage();
  }, []);

  async function handleLookupStudent(e) {
    e.preventDefault();
    if (!studentId) return;
    setLookingUp(true);
    setLimitStatusError(null);
    try {
      const [studentEvents, limit] = await Promise.all([
        listAiUsageForStudent(studentId),
        getAiLimitStatusForStudent(studentId),
      ]);
      setEvents(studentEvents?.events || studentEvents || []);
      setLimitStatus(limit);
      setStatus('ready');
    } catch (err) {
      setLimitStatusError(err.message);
    } finally {
      setLookingUp(false);
    }
  }

  if (status === 'loading') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--loading" role="status">
        جاري تحميل بيانات الاستخدام والتكلفة...
      </p>
    );
  }

  if (status === 'forbidden') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--forbidden" role="alert">
        ليس لديك صلاحية الوصول إلى بيانات الاستخدام والتكلفة.
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--error" role="alert">
        {error || 'حدث خطأ أثناء تحميل بيانات الاستخدام والتكلفة.'}
      </p>
    );
  }

  return (
    <div className="admin-ai-page">
      <h2 className="admin-ai-page__title">الاستخدام والتكلفة</h2>

      <section className="admin-ai-page__section">
        <h3 className="admin-ai-page__section-title">البحث عن طالب</h3>
        <form className="admin-ai-form" onSubmit={handleLookupStudent} aria-label="بحث عن استخدام طالب">
          <div className="admin-ai-form__group">
            <label className="admin-ai-form__label" htmlFor="usage-student-id">معرف الطالب</label>
            <input
              id="usage-student-id"
              className="admin-ai-form__input"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
          <button className="admin-ai-form__submit" type="submit" disabled={lookingUp}>
            {lookingUp ? 'جاري البحث...' : 'بحث'}
          </button>
        </form>
        {limitStatusError && (
          <p className="admin-ai-page__status admin-ai-page__status--error" role="alert">
            {limitStatusError}
          </p>
        )}
        {limitStatus && (
          <div className="admin-ai-table" role="region" aria-label="حالة الحصة">
            <table className="admin-ai-table">
              <thead>
                <tr>
                  <th>الفترة</th>
                  <th>المستخدم</th>
                  <th>الحد</th>
                </tr>
              </thead>
              <tbody>
                {limitStatus.daily && (
                  <tr>
                    <td>يومي</td>
                    <td>{limitStatus.daily.used}</td>
                    <td>{limitStatus.daily.limit}</td>
                  </tr>
                )}
                {limitStatus.monthly && (
                  <tr>
                    <td>شهري</td>
                    <td>{limitStatus.monthly.used}</td>
                    <td>{limitStatus.monthly.limit}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-ai-page__section">
        <h3 className="admin-ai-page__section-title">أحدث أحداث الاستخدام</h3>
        {status === 'empty' || events.length === 0 ? (
          <p className="admin-ai-page__status admin-ai-page__status--empty" role="status">
            لا توجد أحداث استخدام حتى الآن.
          </p>
        ) : (
          <table className="admin-ai-table" aria-label="أحداث الاستخدام">
            <thead>
              <tr>
                <th>النوع</th>
                <th>الطالب</th>
                <th>التوكنات</th>
                <th>المدة (ثانية)</th>
                <th>التكلفة التقديرية</th>
                <th>الفترة</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{EVENT_TYPE_LABELS[event.event_type] || event.event_type}</td>
                  <td>{event.student_id}</td>
                  <td>{event.tokens_used ?? '—'}</td>
                  <td>{event.duration_seconds ?? '—'}</td>
                  <td>{event.cost_estimate}</td>
                  <td>{event.quota_period}</td>
                  <td>{event.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default AdminAiUsageCost;
