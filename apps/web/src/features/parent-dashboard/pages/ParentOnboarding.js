// P12-053: Parent Onboarding UI

import { ParentCard } from '../components';
import './ParentPages.css';

function ParentOnboarding({ onNavigateToInvitation }) {
  return (
    <div className="parent-onboarding">
      <h2 className="parent-page__title">مرحباً بك في لوحة الوالدين</h2>
      <p className="parent-onboarding__desc">
        تتيح لك لوحة الوالدين متابعة تقدم أبنائك في التعلم بشكل آمن. للبدء، يجب ربط حسابك بحساب طفلك عبر دعوة.
      </p>

      <div className="parent-onboarding__actions">
        <ParentCard title="ربط طفل جديد">
          <p>أدخل رمز الدعوة المقدم من المؤسسة التعليمية أو أنشئ طلب ربط جديد.</p>
          <button
            className="parent-btn parent-btn--primary"
            onClick={onNavigateToInvitation}
            type="button"
          >
            قبول دعوة
          </button>
        </ParentCard>
      </div>
    </div>
  );
}

export default ParentOnboarding;
