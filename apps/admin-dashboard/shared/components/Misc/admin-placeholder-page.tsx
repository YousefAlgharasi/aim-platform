type AdminPlaceholderPageProps = {
  readonly title: string;
  readonly description: string;
  readonly checklist: readonly string[];
};

export function AdminPlaceholderPage({
  title,
  description,
  checklist,
}: AdminPlaceholderPageProps) {
  return (
    <section className="admin-placeholder-page">
      <p className="eyebrow">Internal admin surface</p>
      <h1>{title}</h1>
      <p className="hero-copy">{description}</p>

      <div className="boundary-note">
        <h2>Phase 1 placeholder rules</h2>
        <ul>
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
