import Link from 'next/link';

export default function AdminUnauthorizedPage() {
  return (
    <main className="admin-shell">
      <section className="hero">
        <p className="eyebrow">Admin access</p>
        <h1>Access unavailable</h1>
        <p className="hero-copy">
          The current backend session does not include an admin dashboard role,
          so protected admin routes were not rendered.
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
