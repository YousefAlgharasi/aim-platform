// P12-054: Invitation Accept UI

import { useState } from 'react';
import { acceptInvitation } from '../api';
import { ParentCard, ParentLoadingState, ParentErrorState } from '../components';
import './ParentPages.css';

function ParentInvitationAccept() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleAccept(e) {
    e.preventDefault();
    if (!token.trim()) return;
    setStatus('loading');
    setError(null);
    try {
      const data = await acceptInvitation({ token: token.trim() });
      setResult(data);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  if (status === 'loading') return <ParentLoadingState message="جاري قبول الدعوة..." />;

  if (status === 'success') {
    return (
      <ParentCard title="تم قبول الدعوة">
        <p className="parent-invitation__success">تم ربط حسابك بنجاح. يمكنك الآن متابعة تقدم طفلك.</p>
      </ParentCard>
    );
  }

  return (
    <div className="parent-invitation-accept">
      <h2 className="parent-page__title">قبول دعوة ربط</h2>
      {status === 'error' && <ParentErrorState message={error} />}
      <form onSubmit={handleAccept} className="parent-invitation-accept__form">
        <label htmlFor="invitation-token" className="parent-form__label">رمز الدعوة</label>
        <input
          id="invitation-token"
          className="parent-form__input"
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="أدخل رمز الدعوة"
          required
          dir="ltr"
        />
        <button className="parent-btn parent-btn--primary" type="submit">
          قبول الدعوة
        </button>
      </form>
    </div>
  );
}

export default ParentInvitationAccept;
