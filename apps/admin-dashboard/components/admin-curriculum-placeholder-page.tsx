import Link from 'next/link';

import type { AdminCurriculumNavigationItem } from '../lib/admin-curriculum-navigation';

type AdminCurriculumPlaceholderPageProps = {
  readonly item: AdminCurriculumNavigationItem;
};

export function AdminCurriculumPlaceholderPage({
  item,
}: AdminCurriculumPlaceholderPageProps) {
  return (
    <section className="admin-curriculum-page">
      <nav className="admin-breadcrumb" aria-label="Curriculum breadcrumb">
        <Link href="/admin/content">Content</Link>
        <span aria-hidden="true">/</span>
        <span>{item.label}</span>
      </nav>

      <header className="admin-page-header">
        <p className="eyebrow">Admin — Curriculum</p>
        <h1>{item.label}</h1>
        <p className="hero-copy">{item.description}</p>
      </header>

      <div className="admin-boundary-note">
        <strong>Backend authority:</strong> {item.backendBoundary}
      </div>
    </section>
  );
}
