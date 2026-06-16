'use client';

// Phase 4 — P4-055
// AdminPlacementSectionsList — client component.
//
// Scope: Placement Test phase only — admin view of placement section definitions.
//
// Security rules:
// - All data is fetched server-side (page.tsx) and passed as props — never fetched here.
// - section order, questionCount, and skillCode are displayed as-is from the backend.
// - No placement scoring, CEFR thresholds, skill maps, or weakness maps here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// - Section order changes are not implemented here — enforced by backend in a future task.

import type { AdminPlacementSectionSummary } from '../../../../../lib/api/admin-placement-sections-api';

const SKILL_CODE_LABELS: Record<string, string> = {
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  reading: 'Reading',
  listening: 'Listening',
};

type AdminPlacementSectionsListProps = {
  readonly sections: AdminPlacementSectionSummary[];
};

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function truncateId(id: string): string {
  return id ? `…${id.slice(-8)}` : '—';
}

export function AdminPlacementSectionsList({ sections }: AdminPlacementSectionsListProps) {
  if (sections.length === 0) {
    return (
      <p className="admin-empty-state">
        No sections found for this placement test.
      </p>
    );
  }

  return (
    <table className="admin-table" aria-label="Placement sections">
      <thead>
        <tr>
          <th scope="col">Order</th>
          <th scope="col">Title</th>
          <th scope="col">Skill Area</th>
          <th scope="col">Questions</th>
          <th scope="col">Created</th>
          <th scope="col">ID</th>
        </tr>
      </thead>
      <tbody>
        {sections.map((section) => (
          <tr key={section.id}>
            <td className="admin-table-order">{section.order}</td>
            <td className="admin-table-primary">{section.title}</td>
            <td>
              <span className="skill-badge">
                {SKILL_CODE_LABELS[section.skillCode] ?? section.skillCode}
              </span>
            </td>
            <td>{section.questionCount}</td>
            <td>{formatDate(section.createdAt)}</td>
            <td className="admin-table-mono">{truncateId(section.id)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
