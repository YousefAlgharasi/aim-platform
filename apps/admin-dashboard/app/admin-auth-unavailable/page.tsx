import Link from 'next/link';

export default function AdminAuthUnavailablePage() {
  return (
    <main className="admin-shell">
      <section className="hero">
        <p className="eyebrow">Admin access</p>
        <h1>Auth check unavailable</h1>
        <p className="hero-copy">
          The dashboard could not confirm the current session with the Backend
          API, so protected admin routes were not rendered.
        </p>
        <div className="hero-actions">
          <Link className="primary-link" href="/">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
