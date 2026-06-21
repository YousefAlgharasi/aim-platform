'use client';

// Phase 4 — P4-056 / P4-057
// AdminPlacementQuestionsList — client component.
//
// Scope: Placement Test phase only — admin view of placement question bank.
//
// Security rules:
// - All data is fetched server-side (page.tsx) and passed as props — never fetched here.
// - correct_answer is NEVER included in props or rendered anywhere in this component.
// - question_type, prompt, mediaUrl, orderIndex, skillCode displayed as-is from backend.
// - No placement scoring, CEFR thresholds, skill maps, or weakness maps here.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard.
// P4-057: Added Skills → link column to navigate to skill linking UI per question.

import Link from 'next/link';
import type {
  AdminPlacementQuestionSummary,
  PlacementQuestionType,
} from '../../../../../../../../lib/api/admin-placement-questions-api';

const TYPE_LABELS: Record<PlacementQuestionType, string> = {
  multiple_choice: 'Multiple choice',
  true_false: 'True / False',
  fill_blank: 'Fill blank',
  listening_choice: 'Listening',
};

const TYPE_BADGE_CLASSES: Record<PlacementQuestionType, string> = {
  multiple_choice: 'status-published',
  true_false: 'status-draft',
  fill_blank: 'domain-reading',
  listening_choice: 'domain-grammar',
};

type AdminPlacementQuestionsListProps = {
  readonly questions: AdminPlacementQuestionSummary[];
  readonly testId: string;
  readonly sectionId: string;
};

function truncatePrompt(prompt: string, max = 80): string {
  if (!prompt) return '—';
  return prompt.length > max ? `${prompt.slice(0, max)}…` : prompt;
}

function truncateId(id: string): string {
  return id ? `…${id.slice(-8)}` : '—';
}

export function AdminPlacementQuestionsList({
  questions,
  testId,
  sectionId,
}: AdminPlacementQuestionsListProps) {
  if (questions.length === 0) {
    return (
      <p className="admin-empty-state">
        No questions found for this section.
      </p>
    );
  }

  return (
    <table className="admin-table" aria-label="Placement questions">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Type</th>
          <th scope="col">Prompt</th>
          <th scope="col">Audio</th>
          <th scope="col">Skill</th>
          <th scope="col">ID</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>
        {questions.map((q) => (
          <tr key={q.id}>
            <td className="admin-table-order">{q.orderIndex}</td>
            <td>
              <span className={`status-badge ${TYPE_BADGE_CLASSES[q.questionType] ?? 'status-draft'}`}>
                {TYPE_LABELS[q.questionType] ?? q.questionType}
              </span>
            </td>
            <td className="admin-table-primary admin-table-prompt">
              {truncatePrompt(q.prompt)}
            </td>
            <td>
              {q.mediaUrl ? (
                <span className="admin-table-media-indicator" title={q.mediaUrl}>
                  ♪
                </span>
              ) : (
                <span className="admin-table-none">—</span>
              )}
            </td>
            <td>
              <span className="skill-badge">{q.skillCode}</span>
            </td>
            <td className="admin-table-mono">{truncateId(q.id)}</td>
            <td>
              <Link
                href={`/admin/placement/tests/${testId}/sections/${sectionId}/questions/${q.id}/skills`}
                className="admin-table-link"
              >
                Skills →
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
      <caption className="admin-table-caption">
        correct_answer is backend-only and never displayed in the admin UI.
      </caption>
    </table>
  );
}
