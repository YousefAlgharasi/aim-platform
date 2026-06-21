// P12-051: Parent Auth Guard UI
// Protects parent pages; shows forbidden/empty states. Does NOT decide access —
// that is the backend's job. This guard only checks for a stored token.

import { ParentErrorState } from '../components';
import './ParentAuthGuard.css';

function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return (
    window.localStorage.getItem('aim_supabase_access_token') ||
    window.localStorage.getItem('supabase_access_token') ||
    null
  );
}

function ParentForbiddenState() {
  return (
    <div className="parent-auth-guard__forbidden">
      <ParentErrorState message="ليس لديك صلاحية الوصول إلى لوحة الوالدين. يرجى تسجيل الدخول." />
    </div>
  );
}

function ParentAuthGuard({ children }) {
  const token = getStoredToken();

  if (!token) {
    return <ParentForbiddenState />;
  }

  return <>{children}</>;
}

export default ParentAuthGuard;
