import Link from 'next/link';

import { ADMIN_AUTH_TOKEN_COOKIE } from '../../lib/auth';

export default function AdminAuthRequiredPage() {
  return (
    <main className="admin-shell">
      <section className="hero">
        <p className="eyebrow">Admin access</p>
        <h1>Authentication required</h1>
        <p className="hero-copy">
          The admin dashboard requires a backend-approved session before
          protected routes are shown.
        </p>
        <div className="boundary-note">
          <h2>Session boundary</h2>
          <ul>
            <li>Backend API /auth/me is the source of truth for this guard.</li>
            <li>
              Local development may provide a bearer token through the
              {' '}
              <code>{ADMIN_AUTH_TOKEN_COOKIE}</code>
              {' '}
              cookie.
            </li>
            <li>No service-role key or database credential belongs here.</li>
          </ul>
        </div>
        <div className="hero-actions">
          <Link className="primary-link" href="/">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
