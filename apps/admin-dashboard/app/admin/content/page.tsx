import Link from 'next/link';

import { adminCurriculumNavigationItems } from '../../../core/admin-curriculum-navigation';

export default function AdminContentPage() {
  return (
    <section className="admin-curriculum-page">
      <header className="admin-page-header">
        <p className="eyebrow">Admin — Curriculum</p>
        <h1>Content</h1>
        <p className="hero-copy">
          Curriculum and content management navigation for backend-approved
          courses, levels, chapters, lessons, skills, objectives, assets, and
          question bank areas.
        </p>
      </header>

      <div className="admin-curriculum-grid">
        {adminCurriculumNavigationItems.map((item) => (
          <Link className="admin-curriculum-card" href={item.href} key={item.href}>
            <span>{item.label}</span>
            <small>{item.description}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
