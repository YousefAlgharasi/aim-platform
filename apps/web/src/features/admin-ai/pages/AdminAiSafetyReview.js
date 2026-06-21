// P18-077: Create Admin AI Safety Review UI
// Read-only listing of recent rejected AI safety events and flagged
// ('not_helpful') feedback. Never renders rejected raw message/response
// content — only the recorded decision/reason_category/rating, exactly
// as stored. Computes no mastery/level/weakness/difficulty/
// recommendation/review-schedule value locally.

import { useEffect, useState } from 'react';
import { listRejectedSafetyEvents, listFlaggedFeedback } from '../api';
import './AdminAiPages.css';

const DIRECTION_LABELS = {
  input: 'مدخل',
  output: 'مخرج',
};

const RATING_LABELS = {
  helpful: 'مفيد',
  not_helpful: 'غير مفيد',
};

function AdminAiSafetyReview() {
  const [events, setEvents] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  function fetchSafetyData() {
    setStatus('loading');
    Promise.all([listRejectedSafetyEvents(), listFlaggedFeedback()])
      .then(([eventsResult, feedbackResult]) => {
        const eventItems = eventsResult?.events || eventsResult || [];
        const feedbackItems = feedbackResult?.feedback || feedbackResult || [];
        setEvents(eventItems);
        setFeedback(feedbackItems);
        setStatus(eventItems.length > 0 || feedbackItems.length > 0 ? 'ready' : 'empty');
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
    fetchSafetyData();
  }, []);

  if (status === 'loading') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--loading" role="status">
        جاري تحميل بيانات مراجعة السلامة...
      </p>
    );
  }

  if (status === 'forbidden') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--forbidden" role="alert">
        ليس لديك صلاحية الوصول إلى مراجعة السلامة.
      </p>
    );
  }

  if (status === 'error') {
    return (
      <p className="admin-ai-page__status admin-ai-page__status--error" role="alert">
        {error || 'حدث خطأ أثناء تحميل بيانات مراجعة السلامة.'}
      </p>
    );
  }

  return (
    <div className="admin-ai-page">
      <h2 className="admin-ai-page__title">مراجعة السلامة</h2>

      <section className="admin-ai-page__section">
        <h3 className="admin-ai-page__section-title">أحداث السلامة المرفوضة</h3>
        {events.length === 0 ? (
          <p className="admin-ai-page__status admin-ai-page__status--empty" role="status">
            لا توجد أحداث سلامة مرفوضة حتى الآن.
          </p>
        ) : (
          <table className="admin-ai-table" aria-label="أحداث السلامة المرفوضة">
            <thead>
              <tr>
                <th>الاتجاه</th>
                <th>تصنيف السبب</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{DIRECTION_LABELS[event.direction] || event.direction}</td>
                  <td>{event.reason_category || '—'}</td>
                  <td>{event.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-ai-page__section">
        <h3 className="admin-ai-page__section-title">الملاحظات المعلَّمة كغير مفيدة</h3>
        {feedback.length === 0 ? (
          <p className="admin-ai-page__status admin-ai-page__status--empty" role="status">
            لا توجد ملاحظات معلَّمة حتى الآن.
          </p>
        ) : (
          <table className="admin-ai-table" aria-label="الملاحظات المعلَّمة">
            <thead>
              <tr>
                <th>الطالب</th>
                <th>التقييم</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item.id}>
                  <td>{item.student_id}</td>
                  <td>{RATING_LABELS[item.rating] || item.rating}</td>
                  <td>{item.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default AdminAiSafetyReview;
