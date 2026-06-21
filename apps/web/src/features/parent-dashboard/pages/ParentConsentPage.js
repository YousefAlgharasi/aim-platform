// P12-055: Parent Consent UI

import { useState, useEffect } from 'react';
import { listConsents, grantConsent, revokeConsent } from '../api';
import { ParentCard, ParentLoadingState, ParentEmptyState, ParentErrorState, ParentBadge } from '../components';
import './ParentPages.css';

function ParentConsentPage({ childId }) {
  const [consents, setConsents] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!childId) { setStatus('empty'); return; }
    let cancelled = false;
    setStatus('loading');
    listConsents(childId)
      .then((data) => { if (!cancelled) { setConsents(data || []); setStatus('ready'); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setStatus('error'); } });
    return () => { cancelled = true; };
  }, [childId]);

  async function handleGrant(scope) {
    try {
      await grantConsent({ childId, scope });
      const data = await listConsents(childId);
      setConsents(data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRevoke(consentId) {
    try {
      await revokeConsent({ consentId });
      const data = await listConsents(childId);
      setConsents(data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  if (status === 'loading') return <ParentLoadingState message="جاري تحميل الموافقات..." />;
  if (status === 'error') return <ParentErrorState message={error} />;
  if (!childId) return <ParentEmptyState message="يرجى اختيار طفل أولاً." />;

  return (
    <div className="parent-consent-page">
      <h2 className="parent-page__title">إدارة الموافقات</h2>
      <p className="parent-consent-page__desc">
        تحكم في نطاق الرؤية لبيانات طفلك. يمكنك منح أو سحب الموافقة لكل نوع من البيانات.
      </p>

      {consents.length === 0 ? (
        <ParentEmptyState message="لا توجد موافقات مسجلة حالياً." />
      ) : (
        <div className="parent-consent-page__list">
          {consents.map((consent) => (
            <ParentCard key={consent.id} title={consent.scope}>
              <div className="parent-consent-page__item">
                <ParentBadge
                  label={consent.status === 'granted' ? 'ممنوحة' : 'مسحوبة'}
                  variant={consent.status === 'granted' ? 'success' : 'neutral'}
                />
                {consent.status === 'granted' ? (
                  <button className="parent-btn parent-btn--danger" onClick={() => handleRevoke(consent.id)} type="button" aria-label={`سحب الموافقة: ${consent.scope}`}>
                    سحب الموافقة
                  </button>
                ) : (
                  <button className="parent-btn parent-btn--primary" onClick={() => handleGrant(consent.scope)} type="button" aria-label={`منح الموافقة: ${consent.scope}`}>
                    منح الموافقة
                  </button>
                )}
              </div>
            </ParentCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default ParentConsentPage;
