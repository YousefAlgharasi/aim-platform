const foundationCards = [
  {
    title: 'Internal foundation',
    description:
      'This shell exists only to establish the Admin Dashboard project boundary for Phase 1.',
  },
  {
    title: 'Backend API only',
    description:
      'Future admin workflows must use the Backend API and must not bypass authorization boundaries.',
  },
  {
    title: 'No production modules',
    description:
      'Students, content, reports, audit logs, and review queue modules are not implemented in this task.',
  },
];

export default function AdminDashboardHomePage() {
  return (
    <main className="admin-shell">
      <section className="hero">
        <p className="eyebrow">AIM Platform · Phase 1</p>
        <h1>Admin Dashboard Shell</h1>
        <p className="hero-copy">
          Internal dashboard project shell for system foundation work. This is
          not a full institute management platform.
        </p>
      </section>

      <section className="card-grid" aria-label="Admin dashboard shell scope">
        {foundationCards.map((card) => (
          <article className="scope-card" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <section className="boundary-note">
        <h2>Phase 1 boundary</h2>
        <ul>
          <li>No learner Student Web App is created.</li>
          <li>No production admin modules are implemented.</li>
          <li>No secrets or service-role keys belong in this app.</li>
          <li>Backend API remains the final authorization authority.</li>
        </ul>
      </section>
    </main>
  );
}
