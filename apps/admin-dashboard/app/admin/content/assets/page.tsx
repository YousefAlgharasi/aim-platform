import Link from 'next/link';

import { AdminPageHeader } from '../../../../components/layout';
import { AdminCard } from '../../../../components/common';

export default function AdminAssetsContentPage() {
  return (
    <section>
      <nav className="admin-breadcrumb" aria-label="Curriculum breadcrumb">
        <Link href="/admin/content">Content</Link>
        <span aria-hidden="true"> / </span>
        <span>Assets</span>
        <style>{`
          .admin-breadcrumb {
            display: flex;
            align-items: center;
            gap: var(--space-8);
            font-size: 13px;
            color: var(--text-secondary);
            margin-bottom: var(--space-16);
          }
          .admin-breadcrumb a {
            color: var(--text-link);
            text-decoration: none;
          }
          .admin-breadcrumb a:hover { text-decoration: underline; }
        `}</style>
      </nav>

      <AdminPageHeader
        eyebrow="Admin — Curriculum"
        title="Assets"
        description="Lesson asset metadata references. Media files and content blocks are managed per lesson."
      />

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-24)' }}>
        <strong>Backend authority:</strong> Asset metadata may be rendered here, but storage secrets stay server-side.
      </p>

      <div style={{ display: 'grid', gap: 'var(--space-16)', maxWidth: 600 }}>
        <AdminCard
          title="Lesson Content Blocks"
          description="Text, images, videos, audio, exercises, and vocabulary blocks are managed within each lesson."
        >
          <Link
            href="/admin/content/lessons"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: 'var(--space-8) var(--space-16)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary-600)',
              color: 'var(--text-on-primary)',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              marginTop: 'var(--space-12)',
            }}
          >
            Manage Lessons
          </Link>
        </AdminCard>

        <AdminCard
          title="Supported Asset Types"
          description="Content blocks support the following media types for lesson delivery."
        >
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 'var(--space-12) 0 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-8)',
          }}>
            {['Text', 'Image', 'Video', 'Audio', 'Exercise', 'Vocabulary'].map((type) => (
              <li
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-8)',
                  fontSize: 14,
                  color: 'var(--text-primary)',
                }}
              >
                <span style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--color-primary-500)',
                }} />
                {type}
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </section>
  );
}
